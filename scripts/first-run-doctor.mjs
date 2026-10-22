import { readFile, realpath, stat } from 'node:fs/promises';
import { resolve, relative, isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

const catalog = JSON.parse(await readFile(new URL('../src/firstRunCatalog.json', import.meta.url), 'utf8'));
const inside = (root, file) => { const p = relative(root, file); return !p.startsWith('..') && !isAbsolute(p); };

// Fixed metadata/source paths only. No process execution, env inspection, network or file writes.
export async function diagnose(projectsRoot) {
  const root = await realpath(projectsRoot);
  const checks = [];
  for (const workflow of catalog) {
    const files = [];
    for (const name of workflow.files) {
      try {
        const path = await realpath(resolve(root, workflow.repo, name));
        if (!inside(root, path)) throw new Error('outside root');
        const info = await stat(path);
        if (!info.isFile() || info.size > 1_000_000) throw new Error('not bounded file');
        const bytes = await readFile(path);
        files.push({ name, status: 'found', sha256: createHash('sha256').update(bytes).digest('hex') });
      } catch { files.push({ name, status: 'unavailable' }); }
    }
    checks.push({ id: workflow.id, status: files.every(f => f.status === 'found') ? 'detected' : 'incomplete', files });
  }
  return { schema: 'mcc.first-run.v1', observedAt: new Date().toISOString(), nodeMajor: Number(process.versions.node.split('.')[0]), checks };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  if (process.argv.length !== 4 || process.argv[2] !== '--projects-root') {
    console.error('Usage: node scripts/first-run-doctor.mjs --projects-root <folder containing the four repos>');
    process.exitCode = 2;
  } else {
    try { console.log(JSON.stringify(await diagnose(process.argv[3]), null, 2)); }
    catch { console.error('診断対象フォルダを読み取れません。--projects-root を確認してください。'); process.exitCode = 1; }
  }
}
