import test from 'node:test';
import assert from 'node:assert/strict';
import {clip, collectEvidence, MAX_CHARS_PER_QUERY, QUERIES} from './bridge-evidence.mjs';

test('no CLI fails closed before executing a child process', () => {
  let called = false;
  assert.throws(() => collectEvidence({hasCli: () => false, run: () => { called = true; }}), /not installed/);
  assert.equal(called, false);
});

test('read-only allowlist is fixed and bounded', () => {
  const calls = [];
  const report = collectEvidence({
    hasCli: () => true,
    at: '2026-11-17T00:00:00.000Z',
    run: (_exec, argv, opts) => {
      calls.push({argv, opts});
      return {status: 0, stdout: 'x'.repeat(MAX_CHARS_PER_QUERY + 100), stderr: ''};
    }
  });
  assert.equal(calls.length, QUERIES.length);
  assert.equal(report.entries.length, QUERIES.length);
  assert.equal(report.reviewRequired, true);
  assert.equal(report.entries[0].output.length, MAX_CHARS_PER_QUERY);
  for (const call of calls) {
    assert.equal(call.opts.shell, false);
    assert.equal(call.opts.timeout, 15000);
    assert.ok(['docs', 'component', 'template'].includes(call.argv[1]));
    assert.ok(!call.argv.includes('--apply'));
  }
});

test('capture error signals are preserved', () => {
  const report = collectEvidence({hasCli: () => true, run: () => ({status: 1, stdout: '', stderr: 'bad'})});
  assert.ok(report.entries.every((entry) => entry.ok === false && entry.error === 'bad'));
  assert.equal(clip('abcdef', 3), 'abc');
});
