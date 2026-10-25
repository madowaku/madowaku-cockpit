import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const catalog = JSON.parse(readFileSync(new URL('./catalog.json', import.meta.url), 'utf8'));
test('MCC-M3.1 is opt-in catalog only', () => {
  assert.equal(catalog.schema_version, 1);
  assert.equal(catalog.auto_install, false);
  assert.equal(catalog.auto_execute, false);
  assert.equal(catalog.default_mode, 'discover');
  assert.deepEqual(catalog.modes, ['discover', 'recommend', 'handoff']);
  assert.equal(catalog.upstream.license, 'MIT');
  assert.equal(catalog.upstream.update_policy, 'manual-reviewed');
});
test('third-party candidates are uniquely identified and scoped', () => {
  const ids = catalog.skills.map(skill => skill.id);
  assert.ok(ids.length >= 4);
  assert.equal(new Set(ids).size, ids.length);
  for (const skill of catalog.skills) {
    assert.match(skill.id, /^[a-z][a-z0-9-]+$/);
    assert.equal(skill.source, `skills/engineering/${skill.id}/SKILL.md`);
    assert.ok(skill.use_when && skill.collision && skill.route);
    assert.ok(['trial', 'later'].includes(skill.priority));
  }
});
test('existing authority boundaries are preserved', () => {
  const g = catalog.guardrails;
  for (const key of ['read_only_mcp', 'no_shell', 'no_secrets', 'no_background_sync', 'no_auto_update', 'requires_human_review']) {
    assert.equal(g[key], true, key);
  }
  assert.equal(g.proof_authority, 'mado-loop P0-P5');
  assert.equal(g.agent_invocation, 'explicit only');
});
