import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gitBlobHash, REVISION, BLOB_SHA1 } from '../scripts/setup.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('upstream is pinned by exact revision and Git blob', () => {
  assert.match(REVISION, /^[a-f0-9]{40}$/);
  assert.match(BLOB_SHA1, /^[a-f0-9]{40}$/);
  assert.equal(gitBlobHash(Buffer.from('hello')), 'b6fc4c620b67d95f953a5c1c1230aaab5db5a1b0');
});

test('game fixture uses the global LittleJS API with a real test seam', async () => {
  const html = await readFile(resolve(ROOT, 'fixtures/index.html'), 'utf8');
  const js = await readFile(resolve(ROOT, 'fixtures/game.js'), 'utf8');
  assert.match(html, /\.vendor\/littlejs\.min\.js/);
  assert.match(js, /engineInit\(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost\)/);
  assert.match(js, /keyDirection\(\)/);
  assert.match(js, /__littlejsLab/);
});

test('isolated workspace cannot extend the cockpit read-only MCP', async () => {
  const readme = await readFile(resolve(ROOT, 'README.md'), 'utf8');
  assert.match(readme, /read-only MCP/i);
  assert.match(readme, /Godot/i);
  assert.match(readme, /no automatic model calls/i);
});
