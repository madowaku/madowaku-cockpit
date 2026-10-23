import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REVISION = '5b712052848b58e4fce127cec2531c024cb3d9b5';
const prompt = await readFile(resolve(ROOT, 'benchmark/prompt.md'));
const promptHash = createHash('sha256').update(prompt).digest('hex');
const warnings = [];
const results = {};
for (const agent of ['codex', 'claude']) {
  try {
    const run = JSON.parse(await readFile(resolve(ROOT, 'runs', agent + '.json'), 'utf8'));
    const evidence = JSON.parse(await readFile(resolve(ROOT, 'evidence', agent, 'playtest.json'), 'utf8'));
    const gate = JSON.parse(await readFile(resolve(ROOT, 'evidence', agent, 'gate.json'), 'utf8'));
    if (run.agent !== agent || run.prompt_sha256 !== promptHash || run.engine_revision !== REVISION) {
      throw new Error('Agent, pinned revision, or benchmark prompt digest mismatch');
    }
    if (typeof run.model !== 'string' || !run.model.trim()) throw new Error('Model ID required');
    for (const field of ['duration_seconds', 'input_tokens', 'output_tokens', 'cost_usd']) {
      if (run[field] !== null && (!Number.isFinite(run[field]) || run[field] < 0)) {
        throw new Error('Invalid numeric metric: ' + field);
      }
    }
    if (run.duration_seconds === undefined || run.input_tokens === undefined ||
        run.output_tokens === undefined || run.cost_usd === undefined) {
      throw new Error('Missing metric field; use null when unavailable');
    }
    if (evidence.schema !== 'mgsf.littlejs.evidence.v1' ||
        evidence.variant !== agent || !evidence.passed || gate.result !== 'PASS') {
      throw new Error('No matching successful browser evidence and gate');
    }
    results[agent] = {
      model: run.model,
      duration_seconds: run.duration_seconds,
      input_tokens: run.input_tokens,
      output_tokens: run.output_tokens,
      cost_usd: run.cost_usd,
      human_playability_score: run.human_playability_score ?? null,
      gameplay_score: evidence.after.score,
      status: 'verified'
    };
  } catch (error) {
    warnings.push(agent + ': ' + error.message);
  }
}
const status = warnings.length ? 'INCOMPLETE' : 'COMPARABLE';
const output = {
  schema: 'mgsf.littlejs.comparison.v1',
  status,
  prompt_sha256: promptHash,
  engine_revision: REVISION,
  runs: results,
  warnings
};
await mkdir(resolve(ROOT, 'comparison'), { recursive: true });
await writeFile(resolve(ROOT, 'comparison/report.json'), JSON.stringify(output, null, 2) + '\n');
console.log(JSON.stringify(output, null, 2));
// Missing agent runs are not fake failures of the baseline, but remain explicitly incomplete.
// --strict enforces complete model comparison for a later promotion gate.
if (process.argv.includes('--strict') && status !== 'COMPARABLE') process.exitCode = 1;
