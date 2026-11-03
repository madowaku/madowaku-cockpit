import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { assessPlan, compareRuns } from './plan.mjs';

const sample = JSON.parse(readFileSync(new URL('./sample-plan.json', import.meta.url), 'utf8'));
const clone = () => structuredClone(sample);

test('valid sample makes three separate, review-first handoffs', () => {
  const result = assessPlan(sample);
  assert.equal(result.ok, true);
  assert.equal(result.handoffs.length, 3);
  assert.match(result.handoffs[0].text, /no worktree, tests, or PR created/);
  assert.match(result.handoffs[1].text, /No edits outside TARGET/);
});

test('identifies overlapping nested prefixes', () => {
  const data = clone();
  data.lanes[1].owns = ['game/rules/extra/'];
  const result = assessPlan(data);
  assert.equal(result.ok, false);
  assert.match(result.errors.join(' '), /Ownership overlaps/);
  assert.equal(result.handoffs.length, 0);
});

test('rejects malformed directory ownership and duplicate branches', () => {
  const data = clone();
  data.lanes[0].owns = ['../secrets/'];
  data.lanes[2].branch = data.lanes[1].branch;
  const result = assessPlan(data);
  assert.equal(result.ok, false);
  assert.match(result.errors.join(' '), /invalid directory prefix/);
  assert.match(result.errors.join(' '), /duplicated/);
});

test('enforces human review and prevents base branch mutation plan', () => {
  const data = clone();
  data.lanes[0].branch = 'main';
  data.merge_gate.human_review = false;
  const result = assessPlan(data);
  assert.equal(result.ok, false);
  assert.match(result.errors.join(' '), /manual and human_review/);
});

test('warns when baseline missing and rejects invalid input', () => {
  const data = clone();
  delete data.baseline;
  assert.equal(assessPlan(data).warnings.length, 1);
  assert.equal(assessPlan(null).ok, false);
});

test('compares observed metrics without pretending to run checks', () => {
  assert.deepEqual(compareRuns(
    { elapsed_minutes: 60, ci_failures: 1, conflicts: 0 },
    { elapsed_minutes: 48, ci_failures: 2, conflicts: 1 }
  ), { time_saved_percent: 20, ci_failure_delta: 1, conflict_delta: 1 });
  assert.throws(() => compareRuns(
    { elapsed_minutes: 0, ci_failures: 0, conflicts: 0 },
    { elapsed_minutes: 30, ci_failures: 0, conflicts: 0 }
  ));
});
