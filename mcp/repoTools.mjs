import fs from 'node:fs/promises';
import path from 'node:path';

export const LIMITS = Object.freeze({
  TREE_DEFAULT_ENTRIES: 200,
  TREE_MAX_ENTRIES: 2000,
  TREE_DEFAULT_DEPTH: 6,
  TREE_MAX_DEPTH: 20,
  FILE_DEFAULT_BYTES: 16000,
  FILE_MAX_BYTES: 64 * 1024,
  OUTPUT_DEFAULT_CHARS: 24000,
  OUTPUT_MAX_CHARS: 64 * 1024,
  SEARCH_FILE_DEFAULT_BYTES: 128 * 1024,
  SEARCH_FILE_MAX_BYTES: 1024 * 1024,
  SEARCH_MAX_RESULTS_DEFAULT: 50,
  SEARCH_MAX_RESULTS_MAX: 200,
  CONTEXT_DEFAULT_CHARS: 24000,
  CONTEXT_COMPACT_DEFAULT_CHARS: 8000,
  CONTEXT_MAX_CHARS: 96 * 1024,
  CONTEXT_TARGET_FILES_MAX: 8,
  CONTEXT_TREE_ENTRIES_DEFAULT: 120,
  CONTEXT_COMPACT_TREE_ENTRIES: 40,
  CONTEXT_RECENT_FILES_DEFAULT: 12,
  CONTEXT_COMPACT_RECENT_FILES: 6,
  CONTEXT_AI_CREOLE_BYTES: 12000,
  CONTEXT_PACKAGE_BYTES: 6000,
  CONTEXT_SELECTED_FILE_BYTES: 12000,
  CONTEXT_SEARCH_OUTPUT_CHARS: 8000,
  PACKET_QUALITY_ITEMS_MAX: 6,
  PROVENANCE_ITEMS_MAX: 8
});

const IGNORED_DIRS = new Set(['.git', '.playwright-cli', 'node_modules', 'dist', 'build', 'coverage']);
const SECRET_PATTERNS = [
  /^\.env($|\.)/i,
  /(^|[\\/._-])secrets?($|[\\/._-])/i,
  /(^|[\\/._-])credentials?($|[\\/._-])/i,
  /(^|[\\/._-])tokens?($|[\\/._-])/i,
  /(^|[\\/._-])api[-_]?keys?($|[\\/._-])/i,
  /(^|[\\/._-])passwords?($|[\\/._-])/i,
  /(^|[\\/._-])id_rsa($|[\\/._-])/i,
  /(^|[\\/._-])id_dsa($|[\\/._-])/i,
  /\.pem$/i,
  /\.p12$/i,
  /\.pfx$/i,
  /\.key$/i
];

const REDACTION_PATTERNS = [
  {
    pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
    replacement: '[REDACTED_PRIVATE_KEY]'
  },
  {
    pattern: /\bsk-[A-Za-z0-9_-]{16,}\b/g,
    replacement: '[REDACTED_OPENAI_KEY]'
  },
  {
    pattern: /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/g,
    replacement: '[REDACTED_GITHUB_TOKEN]'
  },
  {
    pattern: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g,
    replacement: '[REDACTED_AWS_ACCESS_KEY]'
  },
  {
    pattern: /\b([A-Z0-9_]*(?:API[_-]?KEY|TOKEN|SECRET|PASSWORD|PRIVATE[_-]?KEY|ACCESS[_-]?KEY|CLIENT[_-]?SECRET)[A-Z0-9_]*)[ \t]*[:=][ \t]*["']?([^\s"',;]+)/gi,
    replacement: '$1=[REDACTED]'
  }
];

export class AccessDeniedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AccessDeniedError';
  }
}

function clampNumber(value, fallback, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(number)));
}

function normalizeSlashes(value) {
  return value.replace(/\\/g, '/');
}

function displayPath(root, absolutePath) {
  const relative = normalizeSlashes(path.relative(root, absolutePath));
  return relative || '.';
}

function isSecretPath(relativePath) {
  const normalized = normalizeSlashes(relativePath);
  const basename = path.posix.basename(normalized);
  return SECRET_PATTERNS.some((pattern) => pattern.test(normalized) || pattern.test(basename));
}

export function isIgnoredPath(relativePath) {
  const normalized = normalizeSlashes(relativePath);
  if (!normalized || normalized === '.') return false;

  const segments = normalized.split('/').filter(Boolean);
  return segments.some((segment) => IGNORED_DIRS.has(segment)) || isSecretPath(normalized);
}

export function redactSensitiveTextWithCount(text) {
  let redactionsApplied = 0;
  const redacted = REDACTION_PATTERNS.reduce(
    (current, { pattern, replacement }) => {
      const matches = current.match(pattern);
      redactionsApplied += matches?.length ?? 0;
      return current.replace(pattern, replacement);
    },
    text
  );

  return { text: redacted, redactionsApplied };
}

export function redactSensitiveText(text) {
  return redactSensitiveTextWithCount(text).text;
}

export function resolveRepoPath(repoRoot, requestedPath = '.') {
  if (typeof requestedPath !== 'string') {
    throw new AccessDeniedError('Path must be a string.');
  }

  if (requestedPath.includes('\0')) {
    throw new AccessDeniedError('NUL bytes are not allowed in paths.');
  }

  const root = path.resolve(repoRoot);
  const target = path.resolve(root, requestedPath);
  const relative = path.relative(root, target);

  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new AccessDeniedError('Path traversal outside the repository is blocked.');
  }

  if (isIgnoredPath(relative)) {
    throw new AccessDeniedError('This path is ignored by the read-only bridge.');
  }

  return { root, target, relative: normalizeSlashes(relative || '.') };
}

async function safeStat(absolutePath) {
  try {
    return await fs.lstat(absolutePath);
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}

function isProbablyText(buffer) {
  if (buffer.length === 0) return true;
  return !buffer.includes(0);
}

async function readBoundedFile(absolutePath, maxBytes, options = {}) {
  const handle = await fs.open(absolutePath, 'r');
  try {
    const buffer = Buffer.alloc(maxBytes + 1);
    const { bytesRead } = await handle.read(buffer, 0, maxBytes + 1, 0);
    const raw = buffer.subarray(0, Math.min(bytesRead, maxBytes));
    if (!isProbablyText(raw)) {
      return { text: '[binary file omitted]', truncated: bytesRead > maxBytes, binary: true };
    }
    const rawText = raw.toString('utf8');
    const redacted = options.redact === false
      ? { text: rawText, redactionsApplied: 0 }
      : redactSensitiveTextWithCount(rawText);
    return {
      text: redacted.text,
      redactionsApplied: redacted.redactionsApplied,
      truncated: bytesRead > maxBytes,
      binary: false
    };
  } finally {
    await handle.close();
  }
}

async function walkEntries(repoRoot, startPath, options = {}) {
  const root = path.resolve(repoRoot);
  const maxDepth = clampNumber(options.maxDepth, LIMITS.TREE_DEFAULT_DEPTH, 0, LIMITS.TREE_MAX_DEPTH);
  const maxEntries = clampNumber(options.maxEntries, LIMITS.TREE_DEFAULT_ENTRIES, 1, LIMITS.TREE_MAX_ENTRIES);
  const entries = [];
  let truncated = false;

  async function visit(directory, depth) {
    if (entries.length >= maxEntries) {
      truncated = true;
      return;
    }

    const children = await fs.readdir(directory, { withFileTypes: true });
    children.sort((a, b) => a.name.localeCompare(b.name));

    for (const child of children) {
      if (entries.length >= maxEntries) {
        truncated = true;
        return;
      }

      const absolutePath = path.join(directory, child.name);
      const relative = displayPath(root, absolutePath);
      if (isIgnoredPath(relative)) continue;

      const stat = await safeStat(absolutePath);
      if (!stat) continue;

      if (stat.isSymbolicLink()) {
        entries.push({
          path: relative,
          type: 'symlink',
          size: 0,
          mtimeMs: stat.mtimeMs
        });
        continue;
      }

      if (stat.isDirectory()) {
        entries.push({
          path: `${relative}/`,
          type: 'directory',
          size: 0,
          mtimeMs: stat.mtimeMs
        });
        if (depth < maxDepth) await visit(absolutePath, depth + 1);
        continue;
      }

      if (stat.isFile()) {
        entries.push({
          path: relative,
          type: 'file',
          size: stat.size,
          mtimeMs: stat.mtimeMs
        });
      }
    }
  }

  await visit(startPath, 0);
  return { entries, truncated };
}

function truncateText(text, maxChars) {
  if (text.length <= maxChars) return { text, truncated: false };
  return {
    text: `${text.slice(0, Math.max(0, maxChars - 80))}\n[truncated: output limit reached]`,
    truncated: true
  };
}

function renderEntries(entries, truncated) {
  const lines = entries.map((entry) => {
    const size = entry.type === 'file' ? ` ${entry.size}b` : '';
    return `${entry.type.padEnd(9)} ${entry.path}${size}`;
  });
  if (truncated) lines.push('[truncated: entry limit reached]');
  return lines.join('\n') || '(no readable files found)';
}

export async function repoTree(args = {}, repoRoot = process.cwd()) {
  const { root, target } = resolveRepoPath(repoRoot, args.path ?? '.');
  const stat = await safeStat(target);
  if (!stat?.isDirectory()) {
    throw new AccessDeniedError('repo_tree path must be a readable directory.');
  }

  const result = await walkEntries(root, target, {
    maxDepth: args.maxDepth,
    maxEntries: args.maxEntries
  });

  return {
    root,
    path: displayPath(root, target),
    entries: result.entries,
    truncated: result.truncated,
    text: renderEntries(result.entries, result.truncated)
  };
}

export async function readFile(args = {}, repoRoot = process.cwd()) {
  const requested = args.path;
  if (!requested) throw new AccessDeniedError('read_file requires a path.');

  const { root, target, relative } = resolveRepoPath(repoRoot, requested);
  const stat = await safeStat(target);
  if (!stat?.isFile()) {
    throw new AccessDeniedError('read_file path must be a readable file.');
  }
  if (stat.isSymbolicLink()) {
    throw new AccessDeniedError('read_file does not follow symbolic links.');
  }

  const maxBytes = clampNumber(args.maxBytes, LIMITS.FILE_DEFAULT_BYTES, 1, LIMITS.FILE_MAX_BYTES);
  const file = await readBoundedFile(target, maxBytes);

  return {
    path: relative,
    size: stat.size,
    maxBytes,
    truncated: file.truncated || stat.size > maxBytes,
    redactionsApplied: file.redactionsApplied ?? 0,
    text: file.text
  };
}

function formatSearchResults(results, truncated) {
  const lines = results.map((result) => {
    if (result.line == null) return `${result.path}: path match`;
    return `${result.path}:${result.line}: ${result.preview}`;
  });
  if (truncated) lines.push('[truncated: result or output limit reached]');
  return lines.join('\n') || '(no matches)';
}

export async function searchFiles(args = {}, repoRoot = process.cwd()) {
  const query = String(args.query ?? '').trim();
  if (!query) throw new AccessDeniedError('search_files requires a non-empty query.');

  const { root, target } = resolveRepoPath(repoRoot, args.path ?? '.');
  const stat = await safeStat(target);
  if (!stat?.isDirectory()) {
    throw new AccessDeniedError('search_files path must be a readable directory.');
  }

  const maxResults = clampNumber(args.maxResults, LIMITS.SEARCH_MAX_RESULTS_DEFAULT, 1, LIMITS.SEARCH_MAX_RESULTS_MAX);
  const maxFileBytes = clampNumber(args.maxFileBytes, LIMITS.SEARCH_FILE_DEFAULT_BYTES, 256, LIMITS.SEARCH_FILE_MAX_BYTES);
  const maxOutputChars = clampNumber(args.maxOutputChars, LIMITS.OUTPUT_DEFAULT_CHARS, 200, LIMITS.OUTPUT_MAX_CHARS);
  const { entries } = await walkEntries(root, target, { maxDepth: 20, maxEntries: 5000 });
  const files = entries.filter((entry) => entry.type === 'file');
  const needle = query.toLowerCase();
  const results = [];
  let redactionsApplied = 0;
  let output = '';
  let truncated = false;

  for (const entry of files) {
    if (results.length >= maxResults) {
      truncated = true;
      break;
    }

    if (entry.path.toLowerCase().includes(needle)) {
      results.push({ path: entry.path, line: null, preview: 'path match' });
    }

    if (entry.size > maxFileBytes || results.length >= maxResults) continue;

    const absolutePath = path.join(root, entry.path);
    const file = await readBoundedFile(absolutePath, maxFileBytes, { redact: false });
    if (file.binary) continue;

    const lines = file.text.split(/\r?\n/);
    for (let index = 0; index < lines.length; index += 1) {
      if (!lines[index].toLowerCase().includes(needle)) continue;

      const preview = redactSensitiveTextWithCount(lines[index].trim());
      redactionsApplied += preview.redactionsApplied;

      results.push({
        path: entry.path,
        line: index + 1,
        preview: preview.text.slice(0, 240)
      });

      output = formatSearchResults(results, false);
      if (results.length >= maxResults || output.length >= maxOutputChars) {
        truncated = true;
        break;
      }
    }

    if (truncated) break;
  }

  output = formatSearchResults(results, truncated);
  const bounded = truncateText(output, maxOutputChars);

  return {
    query,
    results,
    truncated: truncated || bounded.truncated,
    redactionsApplied,
    text: bounded.text
  };
}

export async function recentChanges(args = {}, repoRoot = process.cwd()) {
  const { root, target } = resolveRepoPath(repoRoot, args.path ?? '.');
  const stat = await safeStat(target);
  if (!stat?.isDirectory()) {
    throw new AccessDeniedError('recent_changes path must be a readable directory.');
  }

  const maxFiles = clampNumber(args.maxFiles, 20, 1, 100);
  const { entries } = await walkEntries(root, target, { maxDepth: 20, maxEntries: 5000 });
  const files = entries
    .filter((entry) => entry.type === 'file')
    .sort((a, b) => b.mtimeMs - a.mtimeMs)
    .slice(0, maxFiles);

  return {
    files,
    text:
      files
        .map((entry) => `${new Date(entry.mtimeMs).toISOString()} ${entry.path} ${entry.size}b`)
        .join('\n') || '(no readable files found)'
  };
}

async function optionalRead(repoRoot, relativePath, maxBytes) {
  try {
    return await readFile({ path: relativePath, maxBytes }, repoRoot);
  } catch (error) {
    return null;
  }
}

async function optionalRecentChanges(repoRoot, args) {
  try {
    const changes = await recentChanges(args, repoRoot);
    return { ...changes, unavailable: false };
  } catch (error) {
    return {
      files: [],
      unavailable: true,
      text: `(recent_changes unavailable: ${error?.message ?? String(error)})`
    };
  }
}

async function discoverAiCreole(repoRoot) {
  const aiCreole = await optionalRead(repoRoot, 'AI_CREOLE.md', LIMITS.CONTEXT_AI_CREOLE_BYTES);
  if (!aiCreole) {
    return {
      file: null,
      text: [
        'AI_CREOLE_DISCOVERY:',
        '- state: missing',
        '- next: create a minimal AI_CREOLE.md before relying on project dialect terms'
      ].join('\n')
    };
  }

  const coreTags = ['TASK', 'GOAL', 'STATE', 'TARGET', 'DO', 'KEEP', 'NO', 'OUT', 'CHECK', 'RISK', 'NEXT'];
  const foundTags = coreTags.filter((tag) => new RegExp(`\\b${tag}\\b`).test(aiCreole.text));
  const modes = [...aiCreole.text.matchAll(/^### MODE:\s*(.+)$/gm)].map((match) => match[1].trim());

  return {
    file: aiCreole,
    text: [
      'AI_CREOLE_DISCOVERY:',
      '- state: found',
      `- core_tags_found: ${foundTags.join(' / ')}`,
      `- modes_found: ${modes.length ? modes.join(', ') : '(none detected)'}`,
      '- next: preserve local dialect terms and use the core tags in Codex handoffs'
    ].join('\n')
  };
}

function uniqueBounded(items) {
  const seen = new Set();
  const result = [];
  for (const item of items.filter(Boolean)) {
    if (seen.has(item)) continue;
    seen.add(item);
    result.push(item);
    if (result.length >= LIMITS.PACKET_QUALITY_ITEMS_MAX) break;
  }
  return result;
}

function renderList(items) {
  const visibleItems = items.filter(Boolean);
  return visibleItems.length ? visibleItems.map((item) => `- ${item}`).join('\n') : '- (none)';
}

function inferLikelyTouchFiles(targetFiles, search, tree) {
  const searchedPaths = search?.results?.map((result) => result.path) ?? [];
  const bridgePaths = tree.entries
    .map((entry) => entry.path.replace(/\/$/, ''))
    .filter((entryPath) => /^(mcp\/|README\.md|AI_CREOLE\.md|package\.json)/.test(entryPath));

  return uniqueBounded([...targetFiles, ...searchedPaths, ...bridgePaths]);
}

function inferSuggestedNextReads(targetFiles, likelyTouchFiles, tree) {
  const alreadyRead = new Set(targetFiles);
  const candidates = [
    ...likelyTouchFiles,
    'README.md',
    'AI_CREOLE.md',
    'package.json',
    'src/App.tsx',
    'src/promptBuilders.ts',
    'mcp/repoTools.mjs',
    'mcp/repoTools.test.mjs'
  ];
  const available = new Set(tree.entries.filter((entry) => entry.type === 'file').map((entry) => entry.path));
  return uniqueBounded(candidates.filter((candidate) => available.has(candidate) && !alreadyRead.has(candidate)));
}

function buildPacketQuality({ aiCreoleDiscovery, packageJson, targetFiles, tree, changes, search, selectedFiles, compact }) {
  const staleContext = changes.unavailable || changes.files.length === 0;
  const likelyTouchFiles = inferLikelyTouchFiles(targetFiles, search, tree);
  const suggestedNextReads = inferSuggestedNextReads(targetFiles, likelyTouchFiles, tree);
  const missingContext = uniqueBounded([
    'runtime UI state was not inspected by this read-only bridge',
    targetFiles.length ? null : 'no target file bodies were requested',
    search ? null : 'no search query was requested',
    packageJson ? null : 'package.json was unavailable',
    aiCreoleDiscovery.file ? null : 'AI_CREOLE.md was unavailable',
    staleContext ? 'recent_changes is empty or unavailable; context may be stale' : null,
    compact ? 'compact mode omits full package.json and AI_CREOLE.md bodies' : null
  ]);
  const riskFlags = uniqueBounded([
    'avoid expanding MCP beyond read-only inspection',
    'verify redaction before copying context into external tools',
    tree.truncated ? 'repo_tree was truncated by entry limits' : null,
    search?.truncated ? 'search_files was truncated by output limits' : null,
    selectedFiles.some((file) => file.truncated) ? 'one or more selected files were truncated' : null,
    staleContext ? 'stale-context warning: recent file evidence is missing' : null
  ]);
  const testSuggestions = ['npm test', 'npm run build', 'npm run mcp:smoke'];
  const confidence =
    aiCreoleDiscovery.file && packageJson && !staleContext && (targetFiles.length > 0 || search)
      ? 'high'
      : aiCreoleDiscovery.file && packageJson && !staleContext
        ? 'medium'
        : 'low';

  return {
    confidence,
    missingContext,
    suggestedNextReads,
    likelyTouchFiles,
    riskFlags,
    testSuggestions,
    text: [
      'PACKET_QUALITY:',
      `confidence: ${confidence}`,
      'missing_context:',
      renderList(missingContext),
      'suggested_next_reads:',
      renderList(suggestedNextReads),
      'likely_touch_files:',
      renderList(likelyTouchFiles),
      'risk_flags:',
      renderList(riskFlags),
      'test_suggestions:',
      renderList(testSuggestions)
    ].join('\n')
  };
}

function buildContextProvenance({
  generatedAt,
  repoRoot,
  requestedTargetFiles,
  targetFiles,
  packageJson,
  aiCreoleDiscovery,
  tree,
  changes,
  search,
  selectedFiles,
  compact,
  maxOutputChars,
  inputRedactionsApplied
}) {
  const filesIncluded = uniqueBounded([
    ...selectedFiles.map((file) => file.path),
    compact ? null : packageJson ? 'package.json' : null,
    compact ? null : aiCreoleDiscovery.file ? 'AI_CREOLE.md' : null
  ]);
  const filesSummarized = uniqueBounded([
    compact && packageJson ? 'package.json' : null,
    compact && aiCreoleDiscovery.file ? 'AI_CREOLE.md' : null,
    ...(search?.results?.map((result) => result.path) ?? []),
    ...changes.files.map((file) => file.path)
  ]);
  const filesOmittedDueToLimits = uniqueBounded([
    tree.truncated ? 'repo_tree entries beyond limit' : null,
    search?.truncated ? 'search_files results beyond limit' : null,
    requestedTargetFiles.length > targetFiles.length ? `target files beyond maxItems: ${requestedTargetFiles.length - targetFiles.length}` : null,
    ...selectedFiles.filter((file) => file.truncated).map((file) => `${file.path} beyond maxBytes`)
  ]);
  const redactionsApplied =
    inputRedactionsApplied +
    (packageJson?.redactionsApplied ?? 0) +
    (aiCreoleDiscovery.file?.redactionsApplied ?? 0) +
    selectedFiles.reduce((sum, file) => sum + (file.redactionsApplied ?? 0), 0) +
    (search?.redactionsApplied ?? 0);
  const toolsUsed = uniqueBounded([
    'build_context_pack',
    'repo_tree',
    'recent_changes',
    packageJson || aiCreoleDiscovery.file || selectedFiles.length ? 'read_file' : null,
    search ? 'search_files' : null
  ]);

  return {
    redactionsApplied,
    filesIncluded,
    filesSummarized,
    filesOmittedDueToLimits,
    text: [
      'CONTEXT_PROVENANCE:',
      `generated_at: ${generatedAt}`,
      `repo: ${path.basename(path.resolve(repoRoot))}`,
      'tools_used:',
      renderList(toolsUsed),
      'files_included:',
      renderList(filesIncluded),
      'files_summarized:',
      renderList(filesSummarized),
      'files_omitted_due_to_limits:',
      renderList(filesOmittedDueToLimits),
      'files_omitted_due_to_ignore:',
      renderList(['.env*', 'secrets*', 'credentials*', 'tokens*', 'api_keys*', 'password*', 'node_modules', 'dist', '.git']),
      `redactions_applied: ${redactionsApplied}`,
      `context_size_estimate: ${compact ? 'compact' : 'full'} <= ${maxOutputChars} chars`
    ].join('\n')
  };
}

function buildHandoffReviewNotes({ quality, provenance }) {
  return [
    'HANDOFF_REVIEW_NOTES:',
    'can_support:',
    renderList([
      'drafting Codex handoffs for read-only MCP bridge workflow/docs changes',
      'reviewing likely target files from PACKET_QUALITY',
      'choosing small next reads from suggested_next_reads',
      provenance.filesIncluded.length ? 'checking cited included files against the handoff' : null
    ]),
    'cannot_prove:',
    renderList([
      'runtime UI behavior',
      'external tunnel configuration',
      'uninspected source files',
      'that CHECK commands passed unless a human reports results',
      quality.confidence === 'high' ? 'that high confidence removes the need for human review' : null
    ]),
    'human_should_verify:',
    renderList([
      'generated handoff does not request write/shell MCP capabilities',
      'CHECK commands match local package scripts',
      'suggested target files are appropriate',
      'risk_flags and missing_context are reflected in the Codex handoff',
      provenance.redactionsApplied > 0 ? 'redacted context is not needed before execution' : null
    ])
  ].join('\n');
}

export async function buildContextPack(args = {}, repoRoot = process.cwd()) {
  const compact = Boolean(args.compact);
  const defaultOutputChars = compact ? LIMITS.CONTEXT_COMPACT_DEFAULT_CHARS : LIMITS.CONTEXT_DEFAULT_CHARS;
  const maxOutputChars = clampNumber(args.maxOutputChars, defaultOutputChars, 1000, LIMITS.CONTEXT_MAX_CHARS);
  const taskInput = redactSensitiveTextWithCount(String(args.task ?? 'Inspect local repo and prepare a Codex handoff.').trim());
  const goalInput = redactSensitiveTextWithCount(String(args.goal ?? 'Give ChatGPT safe read-only context without shell or write access.').trim());
  const task = taskInput.text;
  const goal = goalInput.text;
  const requestedTargetFiles = Array.isArray(args.targetFiles) ? args.targetFiles : [];
  const targetFiles = requestedTargetFiles.slice(0, LIMITS.CONTEXT_TARGET_FILES_MAX);
  const generatedAt = new Date().toISOString();

  const tree = await repoTree({
    maxDepth: args.maxDepth ?? 2,
    maxEntries: args.maxTreeEntries ?? (compact ? LIMITS.CONTEXT_COMPACT_TREE_ENTRIES : LIMITS.CONTEXT_TREE_ENTRIES_DEFAULT)
  }, repoRoot);
  const changes = await optionalRecentChanges(repoRoot, {
    maxFiles: args.maxRecentFiles ?? (compact ? LIMITS.CONTEXT_COMPACT_RECENT_FILES : LIMITS.CONTEXT_RECENT_FILES_DEFAULT)
  });
  const aiCreoleDiscovery = await discoverAiCreole(repoRoot);
  const packageJson = await optionalRead(repoRoot, 'package.json', LIMITS.CONTEXT_PACKAGE_BYTES);
  const selectedFiles = [];

  for (const target of targetFiles) {
    selectedFiles.push(await readFile({ path: target, maxBytes: args.maxFileBytes ?? LIMITS.CONTEXT_SELECTED_FILE_BYTES }, repoRoot));
  }

  const search = args.searchQuery
    ? await searchFiles({
        query: args.searchQuery,
        maxResults: args.maxSearchResults ?? 30,
        maxOutputChars: LIMITS.CONTEXT_SEARCH_OUTPUT_CHARS
      }, repoRoot)
    : null;
  const quality = buildPacketQuality({
    aiCreoleDiscovery,
    packageJson,
    targetFiles,
    tree,
    changes,
    search,
    selectedFiles,
    compact
  });
  const provenance = buildContextProvenance({
    generatedAt,
    repoRoot,
    requestedTargetFiles,
    targetFiles,
    packageJson,
    aiCreoleDiscovery,
    tree,
    changes,
    search,
    selectedFiles,
    compact,
    maxOutputChars,
    inputRedactionsApplied: taskInput.redactionsApplied + goalInput.redactionsApplied
  });
  const handoffReviewNotes = buildHandoffReviewNotes({ quality, provenance });

  const sections = [
    'ROLE: Codex',
    'MODE: codex_patch',
    '',
    `TASK: ${task}`,
    `GOAL: ${goal}`,
    `STATE: Read-only MCP context pack generated from ${path.basename(path.resolve(repoRoot))}; no shell, write, auth, or secret access was used.`,
    `TARGET: ${targetFiles.length ? targetFiles.join(', ') : 'repo overview'}`,
    'DO:',
    '- Inspect this context before asking for more files.',
    '- Produce small reviewable patches or review notes only after constraints are clear.',
    'KEEP:',
    '- local-first',
    '- copy-only / review-first workflow',
    '- AI Creole tags and project dialect from AI_CREOLE.md',
    'NO:',
    '- no secrets exposure',
    '- no arbitrary command execution',
    '- no write tools',
    '- no auth, sync, deploy, or hidden services',
    'OUT:',
    '- changed files or proposed files',
    '- verification commands actually run or requested',
    '- TRACE / RISK / NEXT',
    'CHECK:',
    '- npm test',
    '- npm run build',
    'RISK:',
    '- Context may be truncated by bridge limits.',
    '- Recent changes are based on filesystem mtimes, not git history.',
    'NEXT: Ask for exact missing files through read_file or search_files, then produce one bounded Codex task.',
    '',
    quality.text,
    '',
    provenance.text,
    '',
    handoffReviewNotes,
    '',
    'CONTEXT:',
    '',
    '## repo_tree',
    tree.text,
    '',
    '## recent_changes',
    changes.text,
    '',
    ...(compact ? [] : ['## package.json', packageJson?.text ?? '(package.json unavailable)', '']),
    '## AI_CREOLE discovery',
    aiCreoleDiscovery.text,
    '',
    ...(compact ? [] : ['## AI_CREOLE.md', aiCreoleDiscovery.file?.text ?? '(AI_CREOLE.md unavailable)', '']),
    '## selected_files',
    selectedFiles.length
      ? selectedFiles.map((file) => `### ${file.path}\n${file.text}`).join('\n\n')
      : '(none requested)',
    '',
    '## search_files',
    search?.text ?? '(none requested)'
  ];

  const bounded = truncateText(redactSensitiveText(sections.join('\n')), maxOutputChars);
  return {
    truncated: bounded.truncated || tree.truncated || Boolean(search?.truncated),
    quality,
    provenance,
    text: bounded.text
  };
}

export const toolDefinitions = [
  {
    name: 'repo_tree',
    description: 'List readable repo files and directories with ignored and secret-looking paths removed.',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        path: { type: 'string', description: 'Directory inside the repository. Must not traverse outside repo root. Defaults to repo root.' },
        maxDepth: { type: 'integer', minimum: 0, maximum: LIMITS.TREE_MAX_DEPTH, description: `Traversal depth. Defaults to ${LIMITS.TREE_DEFAULT_DEPTH}.` },
        maxEntries: { type: 'integer', minimum: 1, maximum: LIMITS.TREE_MAX_ENTRIES, description: `Maximum entries returned. Defaults to ${LIMITS.TREE_DEFAULT_ENTRIES}.` }
      }
    }
  },
  {
    name: 'read_file',
    description: 'Read a single text file inside the repository with byte limits and ignore checks.',
    inputSchema: {
      type: 'object',
      required: ['path'],
      additionalProperties: false,
      properties: {
        path: { type: 'string', description: 'File path inside the repository. Ignored paths and symlinks are rejected.' },
        maxBytes: { type: 'integer', minimum: 1, maximum: LIMITS.FILE_MAX_BYTES, description: `Maximum bytes to read. Defaults to ${LIMITS.FILE_DEFAULT_BYTES}.` }
      }
    }
  },
  {
    name: 'search_files',
    description: 'Search readable text files by simple case-insensitive substring.',
    inputSchema: {
      type: 'object',
      required: ['query'],
      additionalProperties: false,
      properties: {
        query: { type: 'string', minLength: 1, description: 'Case-insensitive substring query.' },
        path: { type: 'string', description: 'Directory inside the repository. Defaults to repo root.' },
        maxResults: { type: 'integer', minimum: 1, maximum: LIMITS.SEARCH_MAX_RESULTS_MAX, description: `Maximum matches returned. Defaults to ${LIMITS.SEARCH_MAX_RESULTS_DEFAULT}.` },
        maxFileBytes: { type: 'integer', minimum: 256, maximum: LIMITS.SEARCH_FILE_MAX_BYTES, description: `Skip files larger than this many bytes. Defaults to ${LIMITS.SEARCH_FILE_DEFAULT_BYTES}.` },
        maxOutputChars: { type: 'integer', minimum: 200, maximum: LIMITS.OUTPUT_MAX_CHARS, description: `Maximum rendered search output. Defaults to ${LIMITS.OUTPUT_DEFAULT_CHARS}.` }
      }
    }
  },
  {
    name: 'recent_changes',
    description: 'Show recently modified readable files by filesystem mtime.',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        path: { type: 'string', description: 'Directory inside the repository. Defaults to repo root.' },
        maxFiles: { type: 'integer', minimum: 1, maximum: 100, description: 'Maximum files to return. Defaults to 20.' }
      }
    }
  },
  {
    name: 'build_context_pack',
    description: 'Generate an AI Creole handoff packet from safe repo context.',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        task: { type: 'string', description: 'TASK line for the generated AI Creole handoff.' },
        goal: { type: 'string', description: 'GOAL line for the generated AI Creole handoff.' },
        targetFiles: {
          type: 'array',
          maxItems: LIMITS.CONTEXT_TARGET_FILES_MAX,
          items: { type: 'string' },
          description: `Optional safe files to include. Maximum ${LIMITS.CONTEXT_TARGET_FILES_MAX}.`
        },
        searchQuery: { type: 'string', description: 'Optional text query to include bounded search results.' },
        compact: { type: 'boolean', description: 'When true, omit full package.json and AI_CREOLE.md bodies and use smaller default limits.' },
        maxDepth: { type: 'integer', minimum: 0, maximum: LIMITS.TREE_MAX_DEPTH, description: 'Optional repo_tree depth for context generation.' },
        maxTreeEntries: { type: 'integer', minimum: 1, maximum: LIMITS.TREE_MAX_ENTRIES, description: 'Optional repo_tree entry cap for context generation.' },
        maxRecentFiles: { type: 'integer', minimum: 1, maximum: 100, description: 'Optional recent_changes file cap for context generation.' },
        maxSearchResults: { type: 'integer', minimum: 1, maximum: LIMITS.SEARCH_MAX_RESULTS_MAX, description: 'Optional search result cap when searchQuery is provided.' },
        maxFileBytes: { type: 'integer', minimum: 1, maximum: LIMITS.FILE_MAX_BYTES, description: 'Optional selected-file byte cap.' },
        maxOutputChars: { type: 'integer', minimum: 1000, maximum: LIMITS.CONTEXT_MAX_CHARS, description: `Maximum generated context pack characters. Defaults to ${LIMITS.CONTEXT_DEFAULT_CHARS}.` }
      }
    }
  }
];

export async function callRepoTool(name, args = {}, repoRoot = process.cwd()) {
  if (name === 'repo_tree') return repoTree(args, repoRoot);
  if (name === 'read_file') return readFile(args, repoRoot);
  if (name === 'search_files') return searchFiles(args, repoRoot);
  if (name === 'recent_changes') return recentChanges(args, repoRoot);
  if (name === 'build_context_pack') return buildContextPack(args, repoRoot);
  throw new AccessDeniedError(`Unknown tool: ${name}`);
}
