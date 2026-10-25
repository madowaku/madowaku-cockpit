// Verifies that every bundled CC0 Kenney PNG is byte-for-byte identical
// to the exact original Git blob SHA stored in kenneyPreviews.ts.
// No network, npm package, image processing, or filesystem writes.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const source = readFileSync('src/kenneyPreviews.ts', 'utf8');
const matcher = /source\(\s*'([a-z0-9-]+)'\s*,\s*'([^']+\.png)'\s*,\s*'([a-f0-9]{40})'/g;
const entries = [...source.matchAll(matcher)];
assert.equal(entries.length, 13, 'Expected 13 original Kenney PNGs in the typed manifest');
const seen = new Set();
for (const [,name,upstream,sha] of entries) {
  assert.ok(!seen.has(name), 'Duplicate preview basename: ' + name);
  seen.add(name);
  const bytes = readFileSync(join('public','asset-previews','kenney',name+'.png'));
  assert.ok(bytes.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex')), 'Bad PNG signature: ' + name);
  const digest = createHash('sha1').update(Buffer.from('blob ' + bytes.length + '\0')).update(bytes).digest('hex');
  assert.equal(digest,sha,name + ' changed from upstream Git blob (' + upstream + ')');
  console.log('PASS ' + name + ' / ' + bytes.length + ' bytes / ' + digest);
}
console.log('PASS: verified all ' + entries.length + ' immutable Kenney originals');
