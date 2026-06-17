# MCP Security

This bridge is a stable read-only, review-first ChatGPT-to-Codex handoff port.

It exists to let ChatGPT inspect bounded local repo context and draft AI Creole handoff packets. It must not become an execution, patching, authentication, browser, or deployment surface.

## Security Status

- Read-only repo inspection.
- No shell execution.
- No write tools.
- No auth tools.
- No env or credential access.
- Human-reviewed handoff before Codex execution.
- Local-first and copy-only by default.

## Capability Boundary

Allowed MCP tools:

- `repo_tree`
- `read_file`
- `search_files`
- `recent_changes`
- `build_context_pack`

Allowed behavior:

- list bounded repo structure
- read bounded safe files
- search bounded safe text
- report recent file mtimes
- generate AI Creole context packs
- include PACKET_QUALITY, CONTEXT_PROVENANCE, and HANDOFF_REVIEW_NOTES

Forbidden behavior:

- write, patch, move, delete, or format files
- execute shell commands
- run package scripts
- call git mutation commands
- read `.env`, credentials, tokens, private keys, browser profiles, cookies, or sessions
- authenticate to external services
- start tunnels, browsers, servers, deploys, sync, billing, or background automation
- access arbitrary filesystem roots outside this repo

## Review Gate

Before a generated handoff is given to Codex:

1. Confirm the TASK is narrow.
2. Confirm TARGET files are plausible.
3. Confirm KEEP preserves this read-only boundary.
4. Confirm NO forbids bridge capability expansion.
5. Confirm CHECK matches local package scripts.
6. Confirm PACKET_QUALITY missing_context and risk_flags are reflected.
7. Confirm CONTEXT_PROVENANCE supports the proposed handoff.
8. Confirm HANDOFF_REVIEW_NOTES cannot_prove items are not treated as facts.

## Out Of Scope

These are intentionally out of scope for this bridge:

- `write_file`
- `apply_patch`
- `run_command`
- `git commit`
- `git push`
- package install or update tools
- env, token, key, cookie, session, or credential readers
- browser control
- tunnel automation
- cloud deploy or sync
- model API calls
- direct Codex execution

If one of these becomes useful, build it as a separate reviewed connector with a separate threat model. Do not smuggle it into this read-only bridge.

## Incident Response

If a context pack appears to expose sensitive content:

1. Stop using that transcript.
2. Check whether the source path should be ignored.
3. Add or tighten a filename ignore or redaction pattern.
4. Add a regression test.
5. Rotate any real credential that may have been exposed.

Redaction is a backstop, not permission to read secrets.
