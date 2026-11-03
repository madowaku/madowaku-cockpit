# MGSF Code Intelligence M0.1: CodeGraph evaluation

Status: experimental / opt-in / documentation-only. No CodeGraph install, repository indexing, agent configuration, CI mutation, or production rollout is performed by this change.

## Goal

Evaluate [CodeGraph](https://github.com/colbymchenry/codegraph) as an **independent, local code-structure index** for Codex-driven development. Preserve the cockpit's existing read-only MCP bridge, copy-only handoff, review-first policy, and no-shell/no-write/no-auth baseline.

## Architecture

```text
madowaku cockpit (read-only context pack + human review)
           |                         \
           v                          v
   Codex / Gearshift          CodeGraph (separate opt-in local agent MCP)
           |                          |
           +-- reviewed analysis <---+
           |
           +-- proposed patch (outside cockpit read-only bridge)
           |
           +-- Game Test Player / project tests (separately controlled)
```

CodeGraph must **not** be embedded in `npm run mcp:local`, offered as a tool by that server, or granted access to its secret-filter bypasses. Any CodeGraph MCP connection belongs to the local Codex environment and is separately audited.

## M0.1 scope

1. **Pilot:** use `madowaku/gearshift` as the initial TypeScript pilot; leave `madowaku-cockpit` itself unchanged except for this plan.
2. **Read-only discovery:** compare existing text search against CodeGraph structural navigation for three fixed tasks: trace task-analyzer entry points, identify dependencies of risk guidance, and list test candidates for a small display-only change.
3. **Safety:** record exactly which agent config is modified by `codegraph install`; check executable release integrity/version, telemetry controls, index files, ignore rules, and whether local project data remains on-device. Do not index secrets, generated output, or private unrelated roots.
4. **Measurement:** compare wall time, agent tool calls, tokens consumed, correct files found, missing dependencies, false-positive impacted files, and explanations with specific file/line evidence.
5. **Decision:** opt in only when accuracy and safety meet the gate below. Do not claim upstream benchmark improvements as local results.

## Pilot procedure (run manually in an isolated checkout)

First inspect the upstream README and release notes before executing any third-party installer. Prefer a reviewed, pinned package version and check its provenance. The upstream README currently documents:

```bash
npm i -g @colbymchenry/codegraph
codegraph install
cd /path/to/gearshift
codegraph init
```

`codegraph install` may auto-configure multiple detected agents. Before running, check its current flags/help and choose only the intended Codex target where supported. Review the diff of agent configuration immediately afterward. `codegraph init` creates a local `.codegraph/` index and may enable auto-sync. Do not commit the index or treat it as source data.

Pilot acceptance:
- The original read-only MCP tool list stays unchanged: `repo_tree`, `read_file`, `search_files`, `recent_changes`, `build_context_pack`.
- No shell/write/auth capability enters that bridge.
- No secrets are indexed or surfaced; observed config and network behavior are documented.
- At least 3 reproducible tasks are evaluated both with and without CodeGraph.
- Every affected-file recommendation includes checkable source evidence; any omission of an actual dependency is treated as a failure to investigate.
- Existing `npm test`, `npm run typecheck`, and `npm run build` still pass in the pilot repository.
- A human approves any broader rollout.

## Godot boundary

As of the initial M0.1 assessment, do **not** assume GDScript, `.tscn`, or Godot Signal graph support. Keep future Godot scene/signal analysis as a separately testable adapter. Combine CodeGraph's supported-language relationships with Godot MCP and runtime observations only after each source has evidence and provenance.

## Future contract (proposal, not implemented)

A compact AI Creole result for Codex/Gearshift could be:

```text
ROLE: Codex
MODE: codex_patch
TASK: <user task>
STATE: source commit SHA; CodeGraph version; graph generated timestamp
TARGET: candidate files and symbols
DO: use graph edges as hypotheses, verify with source
KEEP: cockpit read-only MCP unchanged; local-first
NO: no automatic patch/merge/deploy from graph evidence
CHECK: impacted files, regression tests, runtime checks
RISK: unsupported languages, unresolved edges, stale graph, false confidence
NEXT: human-reviewed implementation and test plan
```

## Rollback

Remove CodeGraph's **separate** agent integration using the upstream-supported uninstall command/target after inspecting its effect, remove the pilot project's `.codegraph/` index, and restore the reviewed agent config backup. Cockpit's read-only server should require no rollback because it is not modified.

## References

- [CodeGraph README](https://github.com/colbymchenry/codegraph)
- [Cockpit read-only MCP baseline](./mcp-v1-baseline.md)
- [Cockpit MCP security](./mcp-security.md)
- [Cockpit MCP workflow](./mcp-workflow.md)
