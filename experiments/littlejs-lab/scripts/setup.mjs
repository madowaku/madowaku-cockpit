import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// LittleJS-AI is fetched only into an ignored sandbox. Review both revision and
// Git blob hashes when updating. Nothing is installed in Godot or cockpit MCP.
export const REVISION = '5b712052848b58e4fce127cec2531c024cb3d9b5';
export const BLOB_SHA1 = '03c6f1e6727e5c16c097f729ce8c6a4356d668bb';
export const PINNED = Object.freeze([
  { source: 'dist/littlejs.min.js', target: 'littlejs.min.js', hash: BLOB_SHA1 },
  { source: 'skills/littlejs-conventions/SKILL.md', target: 'littlejs-conventions.md', hash: '2d83e0dc14c65ba285a9f92df958cadd305609d7' },
  { source: 'reference.md', target: 'reference.md', hash: '709bc123293dea9c2eebd42cb1af624b08ba354c' }
]);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MAX_BYTES = 3_000_000;

export function gitBlobHash(bytes) {
  return createHash('sha1')
    .update('blob ' + bytes.length + '\0')
    .update(bytes)
    .digest('hex');
}

async function installFile(file) {
  const dest = resolve(ROOT, '.vendor', file.target);
  try {
    const local = await readFile(dest);
    if (gitBlobHash(local) === file.hash) {
      console.log('Verified cached ' + file.target);
      return;
    }
    throw new Error('Integrity failure in existing ' + file.target + '; remove the file manually before retrying.');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const url = 'https://raw.githubusercontent.com/KilledByAPixel/LittleJS-AI/' + REVISION + '/' + file.source;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error('Upstream download failed: HTTP ' + response.status);
    if (Number(response.headers.get('content-length') || 0) > MAX_BYTES) {
      throw new Error('Upstream file exceeds size limit');
    }
    const data = Buffer.from(await response.arrayBuffer());
    if (data.length > MAX_BYTES || gitBlobHash(data) !== file.hash) {
      throw new Error('Pinned Git blob hash mismatch: ' + file.source);
    }
    await writeFile(dest, data, { flag: 'wx' });
    console.log('Installed verified ' + file.target);
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  await mkdir(resolve(ROOT, '.vendor'), { recursive: true });
  for (const file of PINNED) await installFile(file);
  console.log('Pinned LittleJS-AI revision: ' + REVISION);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(error); process.exitCode = 1; });
}
