# MCP v1 Baseline

This is the frozen v1.0 baseline for the madowaku read-only MCP bridge.

## Fixed Capability Boundary

- read-only
- no shell
- no write
- no auth
- human-reviewed handoff

## Fixed Tool Set

- `repo_tree`
- `read_file`
- `search_files`
- `recent_changes`
- `build_context_pack`

## Future Changes

Future changes should improve only:

- context quality
- AI Creole handoff clarity
- PACKET_QUALITY
- CONTEXT_PROVENANCE
- redaction
- output limits
- schema constraints
- tests
- docs

New write, shell, auth, browser, cookie, session, git mutation, deploy, sync, env, or credential capabilities are out of scope for this bridge.

## Release Check

- `npm test`
- `npm run build`
- `npm run mcp:smoke`
