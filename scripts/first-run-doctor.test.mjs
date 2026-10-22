import { test } from 'vitest';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { diagnose } from './first-run-doctor.mjs';

test('missing repos are incomplete; no dependencies or model calls are implied', async () => {
  const root = await mkdtemp(join(tmpdir(), 'mcc-doctor-'));
  try {
    const report = await diagnose(root);
    assert.equal(report.checks.length, 4);
    assert.ok(report.checks.every(c => c.status === 'incomplete'));
    await mkdir(join(root, 'madowaku-cockpit', 'mcp'), { recursive: true });
    for (const file of ['package.json', 'mcp/server.mjs', 'mcp/repoTools.mjs']) await writeFile(join(root, 'madowaku-cockpit', file), 'fixture');
    await writeFile(join(root, 'madowaku-cockpit', '.env'), 'NEVER_READ_SECRET');
    const second = await diagnose(root);
    assert.equal(second.checks[0].status, 'detected');
    assert.match(second.checks[0].files[0].sha256, /^[a-f0-9]{64}$/);
    assert.ok(!JSON.stringify(second).includes('NEVER_READ_SECRET'));
    await writeFile(join(root, 'madowaku-cockpit', 'package.json'), 'x'.repeat(1_000_001));
    assert.equal((await diagnose(root)).checks[0].status, 'incomplete');
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('repository symlinks cannot escape selected root', async () => {
  const root = await mkdtemp(join(tmpdir(), 'mcc-root-'));
  const outside = await mkdtemp(join(tmpdir(), 'mcc-outside-'));
  try {
    await writeFile(join(outside, 'package.json'), 'outside');
    await symlink(outside, join(root, 'madowaku-cockpit'), 'junction');
    assert.equal((await diagnose(root)).checks[0].files[0].status, 'unavailable');
  } finally { await rm(root, { recursive: true, force: true }); await rm(outside, { recursive: true, force: true }); }
});
