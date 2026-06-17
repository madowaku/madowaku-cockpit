# Changelog

## Unreleased

- Added GitHub Actions CI for the read-only MCP bridge baseline.
- Documented the CI guardrail that keeps write, shell, auth, and mutation tools out of scope.

## v1.0.0 - Read-Only MCP Bridge Baseline

- Froze the bridge as a stable read-only ChatGPT-to-Codex handoff port.
- Fixed the capability boundary: read-only, no shell, no write, no auth, human-reviewed handoff.
- Fixed the tool set to `repo_tree`, `read_file`, `search_files`, `recent_changes`, and `build_context_pack`.
- Added a canonical v1 baseline page.
- Added the stable `npm run mcp:smoke` smoke command.
- Future changes are limited to context quality, docs, tests, redaction, limits, schema constraints, PACKET_QUALITY, and CONTEXT_PROVENANCE.

## v0.5 - v1.0 Baseline Prep

- Added security baseline docs for the read-only MCP bridge.
- Added README status and capability boundary sections.
- Added `npm run mcp:smoke` as a stable smoke-test alias.
- Marked unsafe future ideas as out of scope for this bridge.

## v0.4 - Audit Trail / Provenance Layer

- Added `CONTEXT_PROVENANCE` to `build_context_pack`.
- Added `HANDOFF_REVIEW_NOTES` for human review before Codex execution.
- Recorded tools used, included files, summarized files, omitted files, redaction count, and context size estimate.
- Added provenance tests for ignored paths, redaction counts, output limits, and compact mode.

## v0.3 - Review-First Workflow Docs

- Added `docs/mcp-workflow.md`.
- Documented the ChatGPT -> read-only MCP scout -> Codex handoff loop.
- Added sample prompts, review checklist, threat model, and never-add capability list.

## v0.2 - Handoff Quality Layer

- Added `PACKET_QUALITY` to `build_context_pack`.
- Added confidence, missing context, suggested next reads, likely touch files, risk flags, and test suggestions.
- Added compact context pack mode.
- Added stale-context warning.

## v0.1 - Hardening

- Centralized limits.
- Strengthened tool schemas with explicit input constraints.
- Added suspicious content redaction.
- Added `AI_CREOLE_DISCOVERY`.
- Added smoke sample output.

## v0.0 - Read-Only Repo Scout

- Added the read-only MCP-style stdio bridge.
- Added `repo_tree`, `read_file`, `search_files`, `recent_changes`, and `build_context_pack`.
- Excluded secret-looking paths, build artifacts, dependencies, and `.git` internals.
- Added tests for traversal, ignored files, and output limits.
