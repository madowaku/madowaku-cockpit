import {spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, resolve} from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(here, '..');
const cliPath = resolve(projectRoot, 'node_modules/@astryxdesign/cli/clients/cli/bin/astryx.mjs');

export const QUERIES = Object.freeze([
  ['docs', 'principles', '--dense'],
  ['docs', 'tokens', '--dense'],
  ['docs', 'theme', '--dense'],
  ['component', 'Button', '--json'],
  ['template', '--list', '--json']
]);

export const MAX_CHARS_PER_QUERY = 16000;

export function clip(value, limit = MAX_CHARS_PER_QUERY) {
  return String(value ?? '').slice(0, limit);
}

export function collectEvidence({hasCli = existsSync, run = spawnSync, at = new Date().toISOString()} = {}) {
  if (!hasCli(cliPath)) {
    throw new Error('Astryx CLI is not installed in the isolated lab. Run cd experiments/astryx && npm install.');
  }
  const entries = QUERIES.map((args) => {
    const result = run(process.execPath, [cliPath, ...args], {
      cwd: projectRoot,
      encoding: 'utf8',
      timeout: 15000,
      maxBuffer: 512 * 1024,
      shell: false
    });
    return {
      command: ['astryx', ...args],
      ok: !result.error && result.status === 0,
      exitCode: result.status ?? -1,
      output: clip(result.stdout),
      error: clip(result.stderr || result.error?.message || '', 1200)
    };
  });

  return {
    schemaVersion: 'mgsf.astryx-evidence.v1',
    mode: 'read-only-local-capture',
    collectedAt: at,
    source: 'local @astryxdesign/cli',
    reviewRequired: true,
    entries
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const report = collectEvidence();
    process.stdout.write(JSON.stringify(report, null, 2) + '\n');
    if (report.entries.some((entry) => !entry.ok)) process.exitCode = 1;
  } catch (error) {
    process.stderr.write((error instanceof Error ? error.message : String(error)) + '\n');
    process.exitCode = 1;
  }
}
