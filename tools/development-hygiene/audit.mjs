#!/usr/bin/env node
// MCC-M4: standalone audit. Never removes worktrees or writes audit records.
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const exec = promisify(execFile);
const MAX_OUTPUT = 256 * 1024;
const MAX_WORKTREES = 40;
const GIT_ENV_REDIRECT = /^(GIT_DIR|GIT_WORK_TREE|GIT_INDEX_FILE|GIT_COMMON_DIR|GIT_OBJECT_DIRECTORY|GIT_ALTERNATE_OBJECT_DIRECTORIES|GIT_CONFIG|GIT_CONFIG_COUNT|GIT_CONFIG_KEY_\d+|GIT_CONFIG_VALUE_\d+)$/;

function cleanEnv(env) {
  const redirect = Object.keys(env).filter((key) => GIT_ENV_REDIRECT.test(key));
  if (redirect.length) throw new Error(`Git environment overrides detected (${redirect.join(', ')}). Audit refused.`);
  return { ...env, GIT_OPTIONAL_LOCKS: '0', GIT_TERMINAL_PROMPT: '0', GIT_CONFIG_NOSYSTEM: '1' };
}

async function git(cwd, args, env, allowExitOne = false) {
  try {
    const { stdout } = await exec('git', ['--no-optional-locks', '-C', cwd, ...(args[0] === 'config' ? [] : ['-c', 'core.fsmonitor=false']), ...args], {
      env, timeout: 10000, maxBuffer: MAX_OUTPUT, encoding: 'utf8', windowsHide: true
    });
    return stdout;
  } catch (error) {
    if (allowExitOne && error.code === 1) return '';
    throw new Error(`Git inspection unavailable: ${String(error.message).slice(0, 240)}`);
  }
}

// Use Git's NUL format so directory names containing newlines cannot forge fields.
export function parseWorktrees(porcelain) {
  if (!porcelain.endsWith('\0\0')) throw new Error('Incomplete worktree listing.');
  const records = porcelain.split('\0\0').filter(Boolean);
  return records.map((record) => {
    const lines = record.split('\0');
    const first = lines.shift();
    if (!first?.startsWith('worktree ') || !first.slice(9) || lines.some((line) => !line)) {
      throw new Error('Malformed worktree listing.');
    }
    const result = { path: first.slice(9), head: null, branch: null, locked: false, prunable: false, detached: false };
    for (const line of lines) {
      if (line.startsWith('HEAD ')) result.head = line.slice(5);
      else if (line.startsWith('branch ')) result.branch = line.slice(7);
      else if (line === 'detached') result.detached = true;
      else if (line === 'locked' || line.startsWith('locked ')) result.locked = true;
      else if (line === 'prunable' || line.startsWith('prunable ')) result.prunable = true;
      else throw new Error('Unknown worktree field; inspection cannot be trusted.');
    }
    if (!/^[a-f0-9]{40,64}$/i.test(result.head ?? '') || (!result.branch && !result.detached)) {
      throw new Error('Invalid worktree HEAD or branch.');
    }
    return result;
  });
}

function isInside(candidate, root) {
  const relative = path.relative(root, candidate);
  return relative === '' || (relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
}

export function classifyWorktree({ isActive, isPrimary, dirty, ignored, locked, prunable, unmerged, inspectionError }) {
  const reasons = [];
  if (isActive) reasons.push('current_worktree');
  if (isPrimary) reasons.push('primary_checkout');
  if (dirty) reasons.push('uncommitted_or_untracked');
  if (ignored) reasons.push('ignored_contents_not_proven_disposable');
  if (locked) reasons.push('git_worktree_locked');
  if (prunable) reasons.push('stale_registration_requires_manual_check');
  if (unmerged) reasons.push('head_not_ancestor_of_primary');
  if (inspectionError) reasons.push('inspection_incomplete');
  if (reasons.length) return { classification: inspectionError ? 'UNKNOWN_KEEP' : 'MUST_KEEP', reasons };
  return { classification: 'REVIEW_REQUIRED', reasons: ['git_clean_only_external_checks_not_performed'] };
}

export async function auditDevelopmentWorktrees({ cwd = process.cwd(), env = process.env } = {}) {
  // Crucially this routine is read-only; no cleanup or log-save mode exists.
  const safeEnv = cleanEnv(env);
  const workingDir = path.resolve(cwd);
  const primary = (await git(workingDir, ['rev-parse', '--show-toplevel'], safeEnv)).trim();
  if (!primary) throw new Error('Not in a Git worktree.');
  const listing = parseWorktrees(await git(workingDir, ['worktree', 'list', '--porcelain', '-z'], safeEnv));
  if (!listing.length || listing.length > MAX_WORKTREES) throw new Error('Worktree count is zero or exceeds the inspection limit.');
  const primaryPath = path.resolve(listing[0].path);
  const activePath = path.resolve(primary);
  const primaryHead = listing[0].head;
  const output = [];

  for (const [index, item] of listing.entries()) {
    const base = {
      path: item.path, branch: item.branch, head: item.head,
      isPrimary: index === 0, isActive: isInside(workingDir, path.resolve(item.path)) || isInside(activePath, path.resolve(item.path)),
      dirty: null, ignored: null, unmerged: null, locked: item.locked, prunable: item.prunable
    };
    let inspectionError = false;
    if (item.prunable) inspectionError = true;
    else {
      try {
        // Check before status: filters and fsmonitor must never be executed during inspection.
        const unsafeConfig = await git(item.path, ['config', '--get-regexp', '^(filter\\..*\\.(clean|process)|core\\.fsmonitor)$'], safeEnv, true);
        if (unsafeConfig.trim()) throw new Error('Potential external Git filter or fsmonitor configuration.');
        const status = await git(item.path, ['status', '--porcelain=v1', '--untracked-files=all'], safeEnv);
        const ignored = await git(item.path, ['ls-files', '--others', '--ignored', '--exclude-standard', '--directory'], safeEnv);
        base.dirty = status.length > 0;
        base.ignored = ignored.length > 0;
        if (index === 0) base.unmerged = false;
        else {
          try {
            await git(item.path, ['merge-base', '--is-ancestor', item.head, primaryHead], safeEnv);
            base.unmerged = false;
          } catch {
            base.unmerged = true; // including ambiguous ancestry: never assume integrated
          }
        }
      } catch {
        inspectionError = true;
      }
    }
    const decision = classifyWorktree({ ...base, inspectionError });
    output.push({ ...base, ...decision });
  }
  return {
    schema: 'mcc-development-hygiene/v1', mode: 'READ_ONLY',
    repository: primaryPath, activeWorktree: activePath, worktrees: output,
    summary: {
      mustKeep: output.filter((item) => item.classification === 'MUST_KEEP').length,
      reviewRequired: output.filter((item) => item.classification === 'REVIEW_REQUIRED').length,
      unknownKeep: output.filter((item) => item.classification === 'UNKNOWN_KEEP').length
    },
    limitations: [
      'No files or worktrees were removed; no audit record was saved.',
      'REVIEW_REQUIRED is not permission to delete.',
      'Running processes, other chats, shortcuts, external references, Codex ownership and unique artifacts are not verified.',
      'An ignored-content check only proves presence, not disposability.',
      'Never publish raw local paths without review.'
    ]
  };
}

function mainArgs(argv) {
  if (argv.includes('--help') && argv.length === 1) return { help: true };
  const allowed = ['--repo'];
  if (argv.some((arg) => !allowed.includes(arg) && arg !== '--repo')) {
    // All positional arguments must be values immediately following --repo.
    if (!(argv.length === 2 && argv[0] === '--repo')) throw new Error('Usage: audit.mjs [--repo PATH] or --help. No delete/apply mode exists.');
  }
  if (argv.length === 0) return { cwd: process.cwd() };
  if (argv.length === 2 && argv[0] === '--repo' && argv[1] && argv[1] !== '--repo') return { cwd: argv[1] };
  throw new Error('Usage: audit.mjs [--repo PATH] or --help.');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = mainArgs(process.argv.slice(2));
    if (args.help) console.log('Read-only Git worktree audit: node tools/development-hygiene/audit.mjs [--repo PATH]');
    else console.log(JSON.stringify(await auditDevelopmentWorktrees(args), null, 2));
  } catch (error) {
    console.error(`MCC-M4 audit refused: ${error.message}`);
    process.exitCode = 2;
  }
}
