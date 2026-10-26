import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { auditDevelopmentWorktrees, classifyWorktree, parseWorktrees } from './audit.mjs';

function git(cwd, ...args) {
  return execFileSync('git', ['-C', cwd, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

async function fixture(fn) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'mcc-hygiene-'));
  const repo = path.join(root, 'repo');
  const linked = path.join(root, 'linked');
  try {
    await fs.mkdir(repo);
    git(repo, 'init', '-q');
    git(repo, 'config', 'user.name', 'MCC Test');
    git(repo, 'config', 'user.email', 'mcc@example.invalid');
    await fs.writeFile(path.join(repo, 'source.txt'), 'first\n');
    await fs.writeFile(path.join(repo, '.gitignore'), 'cache/\n');
    git(repo, 'add', '.');
    git(repo, 'commit', '-qm', 'fixture');
    git(repo, 'worktree', 'add', '-qb', 'feature/hygiene', linked);
    return await fn({ repo, linked });
  } finally {
    await fs.rm(root, { recursive: true, force: true }); // isolated test fixture only
  }
}

test('NUL-safe parser rejects missing terminator and unrecognized fields', () => {
  assert.throws(() => parseWorktrees('worktree /tmp/x\nHEAD bad\n'), /Incomplete/);
  assert.throws(() => parseWorktrees(`worktree /tmp/x\0HEAD ${'a'.repeat(40)}\0surprise\0\0`), /Unknown/);
});

test('classification never marks a worktree as deletable', () => {
  assert.equal(classifyWorktree({}).classification, 'REVIEW_REQUIRED');
  assert.equal(classifyWorktree({ dirty: true }).classification, 'MUST_KEEP');
  assert.equal(classifyWorktree({ unmerged: true }).classification, 'MUST_KEEP');
  assert.equal(classifyWorktree({ inspectionError: true }).classification, 'UNKNOWN_KEEP');
});

test('read-only audit leaves repo and linked worktree untouched', async () => fixture(async ({ repo, linked }) => {
  const before = git(repo, 'status', '--porcelain=v1');
  const report = await auditDevelopmentWorktrees({ cwd: repo });
  assert.equal(report.mode, 'READ_ONLY');
  assert.equal(report.worktrees.length, 2);
  assert.equal(report.worktrees[0].classification, 'MUST_KEEP');
  assert.equal(report.worktrees[1].classification, 'REVIEW_REQUIRED', JSON.stringify(report.worktrees[1]));
  assert.equal(git(repo, 'status', '--porcelain=v1'), before);
  assert.match(git(repo, 'worktree', 'list'), /linked/);
  assert.equal(await fs.readFile(path.join(linked, 'source.txt'), 'utf8'), 'first\n');
}));

test('untracked, ignored and unmerged content are retained', async () => fixture(async ({ repo, linked }) => {
  await fs.writeFile(path.join(linked, 'scratch.txt'), 'important');
  await fs.mkdir(path.join(linked, 'cache'));
  await fs.writeFile(path.join(linked, 'cache', 'model.bin'), 'unique');
  git(linked, 'add', 'scratch.txt');
  git(linked, 'commit', '-qm', 'unmerged');
  const report = await auditDevelopmentWorktrees({ cwd: repo });
  const item = report.worktrees.find((x) => path.normalize(x.path).toLowerCase() === path.normalize(linked).toLowerCase());
  assert.equal(item.classification, 'MUST_KEEP');
  assert.equal(item.unmerged, true);
  assert.equal(item.ignored, true);
  assert.ok(item.reasons.includes('ignored_contents_not_proven_disposable'));
  assert.ok(item.reasons.includes('head_not_ancestor_of_primary'));
}));

test('untracked files are recognized as dirty', async () => fixture(async ({ repo, linked }) => {
  await fs.writeFile(path.join(linked, 'do-not-delete.txt'), 'draft');
  const report = await auditDevelopmentWorktrees({ cwd: repo });
  const item = report.worktrees.find((x) => path.normalize(x.path).toLowerCase() === path.normalize(linked).toLowerCase());
  assert.equal(item.dirty, true);
  assert.equal(item.classification, 'MUST_KEEP');
}));

test('external filter configuration fails closed', async () => fixture(async ({ repo, linked }) => {
  git(linked, 'config', 'filter.demo.process', 'dangerous-helper');
  const report = await auditDevelopmentWorktrees({ cwd: repo });
  assert.equal(report.worktrees.find((x) => path.normalize(x.path).toLowerCase() === path.normalize(linked).toLowerCase()).classification, 'UNKNOWN_KEEP');
}));

test('Git redirect environment is rejected before inspection', async () => fixture(async ({ repo }) => {
  await assert.rejects(auditDevelopmentWorktrees({ cwd: repo, env: { ...process.env, GIT_DIR: '/tmp/forged' } }), /environment overrides/);
}));
