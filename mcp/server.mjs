#!/usr/bin/env node
import { callRepoTool, toolDefinitions } from './repoTools.mjs';

const repoRoot = process.env.MADOWAKU_REPO_ROOT || process.cwd();
let buffer = '';

async function printSmokeSample() {
  const tools = await callRepoTool('repo_tree', { maxDepth: 1, maxEntries: 12 }, repoRoot);
  const pack = await callRepoTool('build_context_pack', {
    task: 'Smoke test read-only MCP bridge.',
    goal: 'Confirm ChatGPT can inspect bounded repo context without write or shell access.',
    targetFiles: ['README.md', 'AI_CREOLE.md'],
    searchQuery: 'build_context_pack',
    compact: true,
    maxOutputChars: 3800
  }, repoRoot);

  process.stdout.write([
    '# madowaku read-only MCP smoke sample',
    '',
    'REQUEST tools/list',
    toolDefinitions.map((tool) => `- ${tool.name}: ${tool.description}`).join('\n'),
    '',
    'REQUEST repo_tree {"maxDepth":1,"maxEntries":12}',
    tools.text,
    '',
    'REQUEST build_context_pack {"compact":true,"targetFiles":["README.md","AI_CREOLE.md"],"searchQuery":"build_context_pack"}',
    pack.text
  ].join('\n'));
}

if (process.argv[2] === 'smoke' && process.argv[3] === 'sample') {
  await printSmokeSample();
  process.exit(0);
}

function send(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

function errorResponse(id, code, message) {
  return { jsonrpc: '2.0', id, error: { code, message } };
}

function successResponse(id, result) {
  return { jsonrpc: '2.0', id, result };
}

async function handleMessage(message) {
  if (!message || message.jsonrpc !== '2.0') return;
  if (message.method?.startsWith('notifications/')) return;

  try {
    if (message.method === 'initialize') {
      send(successResponse(message.id, {
        protocolVersion: message.params?.protocolVersion ?? '2024-11-05',
        capabilities: {
          tools: { listChanged: false }
        },
        serverInfo: {
          name: 'madowaku-cockpit-readonly',
          version: '0.1.0'
        }
      }));
      return;
    }

    if (message.method === 'ping') {
      send(successResponse(message.id, {}));
      return;
    }

    if (message.method === 'tools/list') {
      send(successResponse(message.id, { tools: toolDefinitions }));
      return;
    }

    if (message.method === 'tools/call') {
      const name = message.params?.name;
      const args = message.params?.arguments ?? {};
      const result = await callRepoTool(name, args, repoRoot);
      send(successResponse(message.id, {
        content: [{ type: 'text', text: result.text ?? JSON.stringify(result, null, 2) }],
        isError: false
      }));
      return;
    }

    send(errorResponse(message.id, -32601, `Method not found: ${message.method}`));
  } catch (error) {
    send(errorResponse(message.id, -32603, error?.message ?? String(error)));
  }
}

function tryReadHeaderMessage() {
  const separator = buffer.indexOf('\r\n\r\n');
  if (separator === -1) return false;

  const header = buffer.slice(0, separator);
  const match = header.match(/content-length:\s*(\d+)/i);
  if (!match) return false;

  const length = Number(match[1]);
  const bodyStart = separator + 4;
  if (buffer.length < bodyStart + length) return false;

  const body = buffer.slice(bodyStart, bodyStart + length);
  buffer = buffer.slice(bodyStart + length);
  handleMessage(JSON.parse(body));
  return true;
}

function tryReadLineMessage() {
  const newline = buffer.indexOf('\n');
  if (newline === -1) return false;

  const line = buffer.slice(0, newline).trim();
  buffer = buffer.slice(newline + 1);
  if (line) handleMessage(JSON.parse(line));
  return true;
}

process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  buffer += chunk;

  while (buffer.length > 0) {
    const parsed = buffer.startsWith('Content-Length:') ? tryReadHeaderMessage() : tryReadLineMessage();
    if (!parsed) break;
  }
});

process.stdin.on('error', (error) => {
  process.stderr.write(`stdin error: ${error.message}\n`);
});
