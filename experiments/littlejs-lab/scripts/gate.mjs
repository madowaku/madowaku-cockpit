import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const variant = process.env.LITTLEJS_LAB_CASE || 'baseline';
if (!/^(baseline|codex|claude)$/.test(variant)) throw new Error('Invalid case');
const dir = resolve(ROOT, 'evidence', variant);
const errors = [];
async function json(file) {
  try { return JSON.parse(await readFile(resolve(dir, file), 'utf8')); }
  catch (error) { errors.push(file + ': ' + error.message); return null; }
}
const report = await json('playwright-results.json');
const evidence = await json('playtest.json');
const expected = report?.stats?.expected ?? 0;
if (expected < 1) errors.push('No passing Playwright test was recorded');
if ((report?.stats?.unexpected ?? 1) !== 0) errors.push('Unexpected Playwright failures');
if ((report?.stats?.flaky ?? 1) !== 0) errors.push('Flaky Playwright tests');
if (evidence?.schema !== 'mgsf.littlejs.evidence.v1' || evidence?.variant !== variant) {
  errors.push('Invalid or mismatched evidence schema');
}
if (!evidence?.passed || evidence?.after?.score < 1 || evidence?.after?.x <= evidence?.before?.x + 1) {
  errors.push('Gameplay movement or collect objective not proven');
}
if (!Array.isArray(evidence?.console_errors) || evidence.console_errors.length !== 0) {
  errors.push('Browser console contains errors or evidence is missing');
}
try {
  const screen = await stat(resolve(dir, 'playtest.png'));
  if (!screen.isFile() || screen.size < 1000) errors.push('Screenshot too small');
} catch (error) {
  errors.push('Screenshot missing: ' + error.message);
}
const decision = {
  schema: 'mgsf.littlejs.gate.v1',
  variant,
  result: errors.length ? 'HOLD' : 'PASS',
  passed_tests: expected,
  reasons: errors
};
await mkdir(dir, { recursive: true });
await writeFile(resolve(dir, 'gate.json'), JSON.stringify(decision, null, 2) + '\n');
console.log(JSON.stringify(decision, null, 2));
if (errors.length) process.exitCode = 1;
