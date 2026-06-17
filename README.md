# madowaku cockpit

Local-first cockpit for copy-only AI handoffs, review notes, and AI Creole packets.

## Read-Only MCP Local Bridge

This repo includes a minimal read-only MCP-style stdio bridge for letting ChatGPT inspect local context without granting shell or write access.

Detailed review-first workflow docs: [docs/mcp-workflow.md](docs/mcp-workflow.md).
Security baseline docs: [docs/mcp-security.md](docs/mcp-security.md).
v1.0 baseline: [docs/mcp-v1-baseline.md](docs/mcp-v1-baseline.md).
Change history: [CHANGELOG.md](CHANGELOG.md).

Status:

- read-only
- no shell
- no write
- no auth
- human-reviewed handoff

v1.0 baseline note: this bridge is stable as read-only. New write, shell, auth, browser, cookie, session, git mutation, deploy, sync, env, or credential capabilities are out of scope. Future changes should improve context quality, docs, tests, redaction, output limits, schema constraints, PACKET_QUALITY, or CONTEXT_PROVENANCE only.

Run it locally:

```bash
npm run mcp:local
```

Print a local smoke-test transcript:

```bash
npm run mcp:smoke
```

Tools:

- `repo_tree`: lists readable files and directories.
- `read_file`: reads one bounded text file.
- `search_files`: performs simple case-insensitive text search.
- `recent_changes`: lists readable files by filesystem modified time.
- `build_context_pack`: generates an AI Creole handoff packet compatible with `AI_CREOLE.md`.

`build_context_pack` also includes a `PACKET_QUALITY` section with confidence, missing context, suggested next reads, likely touch files, risk flags, and test suggestions. Pass `compact: true` when you want a smaller handoff packet that keeps quality metadata but omits full `package.json` and `AI_CREOLE.md` bodies.

Safety boundaries:

- No write tools.
- No arbitrary command execution.
- No auth, sync, deploy, or hidden services.
- Blocks path traversal outside the repo.
- Excludes `.env*`, secret-looking paths, credential/token/key files, `node_modules`, `dist`, `build`, `.playwright-cli`, `coverage`, and `.git` internals.
- Output is bounded so ChatGPT receives reviewable excerpts instead of unbounded dumps.
- Suspicious secret-looking content snippets are redacted from readable files, search previews, and context packs.

### Capability Boundary

Allowed tools:

- `repo_tree`
- `read_file`
- `search_files`
- `recent_changes`
- `build_context_pack`

Never add to this bridge:

- `write_file`
- `apply_patch`
- `run_command`
- git commit/push tools
- env, credential, token, cookie, or session access
- browser control
- tunnel, deploy, sync, billing, or auth automation

Unsafe ideas belong in a separate reviewed connector with a separate threat model, not in this read-only bridge.

### Suggested ChatGPT Usage

Use this connector as a read-only repo scout.

Allowed:

- inspect repo structure
- read safe source/docs files
- search project text
- build AI Creole context packs for Codex

Not allowed:

- execute shell commands
- modify files
- read secrets
- access files outside the repo

Recommended workflow:

1. Ask ChatGPT to inspect the repo with `build_context_pack`.
2. Ask ChatGPT to draft a Codex handoff.
3. Review the handoff manually.
4. Give the reviewed handoff to Codex for implementation.

Recommended prompt for Codex handoff generation:

```text
Use the madowaku read-only MCP connector as a repo scout.

TASK:
Inspect this repo with build_context_pack and draft a Codex handoff.

DO:
- start with build_context_pack
- read PACKET_QUALITY before proposing implementation
- use suggested_next_reads only when missing context would change the handoff
- include confidence, missing_context, risk_flags, and test_suggestions in your summary
- output a Codex-ready AI Creole packet

KEEP:
- read-only inspection
- copy-only / review-first workflow
- local-first assumptions

NO:
- do not execute shell commands
- do not modify files
- do not ask for secrets
- do not ignore stale-context warnings

OUT:
ROLE: Codex
MODE: codex_patch
TASK:
GOAL:
STATE:
TARGET:
DO:
KEEP:
NO:
OUT:
CHECK:
RISK:
NEXT:
```

Connector instruction block:

```text
ROLE: ChatGPT read-only repo scout
MODE: local_review

TASK:
Inspect madowaku-cockpit through the read-only MCP bridge and draft a Codex handoff.

KEEP:
- local-first
- copy-only / review-first workflow
- AI Creole tags from AI_CREOLE.md

NO:
- do not execute commands
- do not modify files
- do not request secrets
- do not access files outside the repo

DO:
- start with build_context_pack
- use read_file only for specific safe files needed to reduce uncertainty
- use search_files for bounded text lookup
- return a reviewed Codex handoff, not an implementation

OUT:
- TASK / GOAL / STATE / TARGET / DO / KEEP / NO / OUT / CHECK / RISK / NEXT
```

### ChatGPT Developer Mode Through A Secure Tunnel

Recommended topology:

1. Run `npm run mcp:local` on the machine that owns this repo.
2. Put a separately reviewed MCP stdio-to-HTTPS adapter in front of it if Developer Mode requires an HTTPS URL.
3. Bind that adapter to `127.0.0.1` first, then expose only the adapter through a secure tunnel you control.
4. Require tunnel authentication or an allowlist. Do not expose raw shell, filesystem roots, editor ports, or this repo directly.
5. Register the tunneled HTTPS endpoint in ChatGPT Developer Mode.
6. Test only `repo_tree` and `build_context_pack` first. Review output before asking ChatGPT to call `read_file`.

Keep the tunnel copy-only and review-first: ChatGPT may inspect bounded context and draft AI Creole/Codex handoffs, but v0 has no write, shell, sync, deploy, or secret access.

Sample `build_context_pack` output starts with:

```text
ROLE: Codex
MODE: codex_patch

TASK: Add read-only MCP local bridge.
GOAL: Let ChatGPT inspect the repo safely.
STATE: Read-only MCP context pack generated from madowaku-cockpit; no shell, write, auth, or secret access was used.
TARGET: repo overview
DO:
...
```
