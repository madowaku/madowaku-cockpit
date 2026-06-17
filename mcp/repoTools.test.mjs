import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { buildContextPack, readFile, repoTree, searchFiles, toolDefinitions } from './repoTools.mjs';

let fixtureRoot;

async function writeFixture(relativePath, contents) {
  const absolutePath = path.join(fixtureRoot, relativePath);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, contents);
}

describe('read-only MCP repo tools', () => {
  beforeEach(async () => {
    fixtureRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'madowaku-mcp-'));
    await writeFixture('AI_CREOLE.md', 'TASK / GOAL / STATE / TARGET / DO / KEEP / NO / OUT / CHECK / RISK / NEXT');
    await writeFixture('package.json', '{"scripts":{"test":"vitest run","build":"vite build"}}');
    await writeFixture('src/App.tsx', 'export const label = "safe cockpit";\n');
    await writeFixture('src/large.txt', `${'abc '.repeat(200)}needle\n${'xyz '.repeat(200)}`);
    await writeFixture('src/config.ts', [
      'export const OPENAI_API_KEY = "sk-test1234567890abcdef";',
      'export const GITHUB_TOKEN = "ghp_123456789012345678901234567890123456";',
      'export const safeLabel = "cockpit";'
    ].join('\n'));
    await writeFixture('docs/api_keys.md', 'do not read by suspicious filename');
    await writeFixture('.env', 'SECRET=do-not-read');
    await writeFixture('secrets/token.txt', 'token');
    await writeFixture('node_modules/pkg/index.js', 'module');
    await writeFixture('dist/bundle.js', 'bundle');
    await writeFixture('build/output.js', 'output');
    await writeFixture('.git/config', 'repo internals');
  });

  afterEach(async () => {
    await fs.rm(fixtureRoot, { recursive: true, force: true });
  });

  it('blocks path traversal outside the repository root', async () => {
    await expect(readFile({ path: '../outside.txt' }, fixtureRoot)).rejects.toThrow('Path traversal');
    await expect(repoTree({ path: '..' }, fixtureRoot)).rejects.toThrow('Path traversal');
  });

  it('hides ignored directories and secret-looking files from tree and reads', async () => {
    const tree = await repoTree({ maxDepth: 4 }, fixtureRoot);

    expect(tree.text).toContain('src/App.tsx');
    expect(tree.text).not.toContain('.env');
    expect(tree.text).not.toContain('secrets');
    expect(tree.text).not.toContain('node_modules');
    expect(tree.text).not.toContain('dist');
    expect(tree.text).not.toContain('build');
    expect(tree.text).not.toContain('.git');
    expect(tree.text).not.toContain('api_keys');

    await expect(readFile({ path: '.env' }, fixtureRoot)).rejects.toThrow('ignored');
    await expect(readFile({ path: 'secrets/token.txt' }, fixtureRoot)).rejects.toThrow('ignored');
    await expect(readFile({ path: 'node_modules/pkg/index.js' }, fixtureRoot)).rejects.toThrow('ignored');
    await expect(readFile({ path: 'docs/api_keys.md' }, fixtureRoot)).rejects.toThrow('ignored');
  });

  it('redacts suspicious content snippets from file reads, search results, and context packs', async () => {
    const file = await readFile({ path: 'src/config.ts' }, fixtureRoot);
    const search = await searchFiles({ query: 'OPENAI_API_KEY', maxOutputChars: 1000 }, fixtureRoot);
    const pack = await buildContextPack({
      targetFiles: ['src/config.ts'],
      searchQuery: 'GITHUB_TOKEN',
      maxOutputChars: 6000
    }, fixtureRoot);

    expect(file.text).toContain('OPENAI_API_KEY=[REDACTED]');
    expect(file.text).toContain('GITHUB_TOKEN=[REDACTED]');
    expect(file.text).not.toContain('sk-test1234567890abcdef');
    expect(file.text).not.toContain('ghp_123456789012345678901234567890123456');
    expect(search.text).toContain('OPENAI_API_KEY=[REDACTED]');
    expect(pack.text).toContain('GITHUB_TOKEN=[REDACTED]');
    expect(pack.text).not.toContain('ghp_123456789012345678901234567890123456');
  });

  it('applies file and search output limits', async () => {
    const file = await readFile({ path: 'src/large.txt', maxBytes: 24 }, fixtureRoot);
    const search = await searchFiles({ query: 'abc', maxResults: 50, maxOutputChars: 180 }, fixtureRoot);

    expect(file.truncated).toBe(true);
    expect(file.text.length).toBeLessThanOrEqual(24);
    expect(search.truncated).toBe(true);
    expect(search.text.length).toBeLessThanOrEqual(180);
    expect(search.text).toContain('[truncated');
  });

  it('builds an AI Creole context pack without leaking ignored files', async () => {
    const pack = await buildContextPack({
      task: 'Add read-only MCP local bridge.',
      goal: 'Let ChatGPT inspect the repo safely.',
      targetFiles: ['src/App.tsx'],
      searchQuery: 'cockpit',
      maxOutputChars: 6000
    }, fixtureRoot);

    expect(pack.text).toContain('ROLE: Codex');
    expect(pack.text).toContain('TASK: Add read-only MCP local bridge.');
    expect(pack.text).toContain('GOAL: Let ChatGPT inspect the repo safely.');
    expect(pack.text).toContain('KEEP:');
    expect(pack.text).toContain('NO:');
    expect(pack.text).toContain('CHECK:');
    expect(pack.text).toContain('NEXT:');
    expect(pack.text).toContain('PACKET_QUALITY:');
    expect(pack.text).toContain('confidence: high');
    expect(pack.text).toContain('missing_context:');
    expect(pack.text).toContain('suggested_next_reads:');
    expect(pack.text).toContain('likely_touch_files:');
    expect(pack.text).toContain('risk_flags:');
    expect(pack.text).toContain('test_suggestions:');
    expect(pack.text).toContain('CONTEXT_PROVENANCE:');
    expect(pack.text).toContain('generated_at:');
    expect(pack.text).toContain('tools_used:');
    expect(pack.text).toContain('- build_context_pack');
    expect(pack.text).toContain('files_included:');
    expect(pack.text).toContain('- src/App.tsx');
    expect(pack.text).toContain('files_omitted_due_to_ignore:');
    expect(pack.text).toContain('- node_modules');
    expect(pack.text).toMatch(/redactions_applied: \d+/);
    expect(pack.text).toContain('HANDOFF_REVIEW_NOTES:');
    expect(pack.text).toContain('human_should_verify:');
    expect(pack.text).toContain('AI_CREOLE_DISCOVERY:');
    expect(pack.text).toContain('- state: found');
    expect(pack.text).toContain('TASK / GOAL / STATE / TARGET / DO / KEEP / NO / OUT / CHECK / RISK / NEXT');
    expect(pack.text).not.toContain('SECRET=do-not-read');
    expect(pack.text).not.toContain('node_modules/pkg/index.js');
    expect(pack.text).not.toContain('.git/config');
  });

  it('supports compact context packs without full metadata bodies or secret leakage', async () => {
    const compact = await buildContextPack({
      compact: true,
      targetFiles: ['src/config.ts'],
      searchQuery: 'TOKEN',
      maxOutputChars: 5000
    }, fixtureRoot);

    expect(compact.text).toContain('PACKET_QUALITY:');
    expect(compact.text).toContain('CONTEXT_PROVENANCE:');
    expect(compact.text).toContain('context_size_estimate: compact');
    expect(compact.text).toMatch(/redactions_applied: [1-9]\d*/);
    expect(compact.provenance.redactionsApplied).toBeGreaterThan(0);
    expect(compact.text).toContain('compact mode omits full package.json and AI_CREOLE.md bodies');
    expect(compact.text).toContain('## AI_CREOLE discovery');
    expect(compact.text).not.toContain('## package.json');
    expect(compact.text).not.toContain('## AI_CREOLE.md');
    expect(compact.text).toContain('GITHUB_TOKEN=[REDACTED]');
    expect(compact.text).not.toContain('ghp_123456789012345678901234567890123456');
    expect(compact.text.length).toBeLessThanOrEqual(5000);
  });

  it('records provenance omissions caused by limits without leaking ignored file paths', async () => {
    await writeFixture('docs/one.md', 'one');
    await writeFixture('docs/two.md', 'two');
    await writeFixture('docs/three.md', 'three');
    await writeFixture('docs/four.md', 'four');
    await writeFixture('docs/five.md', 'five');
    await writeFixture('docs/six.md', 'six');

    const pack = await buildContextPack({
      compact: true,
      targetFiles: [
        'src/large.txt',
        'src/App.tsx',
        'src/config.ts',
        'docs/one.md',
        'docs/two.md',
        'docs/three.md',
        'docs/four.md',
        'docs/five.md',
        'docs/six.md'
      ],
      maxFileBytes: 24,
      maxTreeEntries: 3,
      maxOutputChars: 7000
    }, fixtureRoot);

    expect(pack.text).toContain('CONTEXT_PROVENANCE:');
    expect(pack.text).toContain('files_omitted_due_to_limits:');
    expect(pack.text).toContain('repo_tree entries beyond limit');
    expect(pack.text).toContain('target files beyond maxItems: 1');
    expect(pack.text).toContain('src/large.txt beyond maxBytes');
    expect(pack.text).toContain('files_omitted_due_to_ignore:');
    expect(pack.text).toContain('- .git');
    expect(pack.text).not.toContain('node_modules/pkg/index.js');
    expect(pack.text).not.toContain('.git/config');
  });

  it('warns when recent context is empty and lowers packet confidence', async () => {
    const emptyRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'madowaku-empty-mcp-'));
    try {
      const pack = await buildContextPack({ compact: true, maxOutputChars: 4000 }, emptyRoot);

      expect(pack.text).toContain('PACKET_QUALITY:');
      expect(pack.text).toContain('confidence: low');
      expect(pack.text).toContain('recent_changes is empty or unavailable; context may be stale');
      expect(pack.text).toContain('stale-context warning: recent file evidence is missing');
    } finally {
      await fs.rm(emptyRoot, { recursive: true, force: true });
    }
  });

  it('declares explicit MCP input constraints for every tool schema', () => {
    expect(toolDefinitions.map((tool) => tool.name)).toEqual([
      'repo_tree',
      'read_file',
      'search_files',
      'recent_changes',
      'build_context_pack'
    ]);
    expect(toolDefinitions.every((tool) => tool.inputSchema.additionalProperties === false)).toBe(true);
    expect(toolDefinitions.find((tool) => tool.name === 'read_file')?.inputSchema.properties.maxBytes.maximum).toBe(65536);
    expect(toolDefinitions.find((tool) => tool.name === 'build_context_pack')?.inputSchema.properties.targetFiles.maxItems).toBe(8);
    expect(toolDefinitions.find((tool) => tool.name === 'build_context_pack')?.inputSchema.properties.compact.type).toBe('boolean');
    expect(toolDefinitions.find((tool) => tool.name === 'build_context_pack')?.inputSchema.properties.maxTreeEntries.maximum).toBe(2000);
  });

  it('server exposes only read-only baseline tools', () => {
    expect(toolDefinitions.map((tool) => tool.name)).toEqual([
      'repo_tree',
      'read_file',
      'search_files',
      'recent_changes',
      'build_context_pack'
    ]);
  });
});
