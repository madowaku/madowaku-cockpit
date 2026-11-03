# MGSF Agent Parallel Development Lab M0.1

A **local-first, review-first experiment** inspired by [Scaling Git at OpenAI](https://openai.com/index/scaling-git-at-openai/). This borrows the *principle* of independent branch progress. It does **not** implement Pando or change Git infrastructure.

## What is implemented

- Validates 2–3 proposed agent lanes and their unique branches.
- Detects overlapping owned directory prefixes, including nested prefixes.
- Rejects unsafe relative scope prefixes and a plan that targets the base branch.
- Requires a manual merge policy, human review, and named external checks.
- Emits one AI Creole Codex handoff per lane.
- Provides a pure `compareRuns` helper for measured elapsed time, CI failures, and merge conflicts.

The sample is **illustrative**. Its repository, paths, branches, tasks, and 60-minute baseline are not observations from a real game project. Replace them before a real experiment.

## Try it

From the repository root, in a normal local terminal **outside the read-only MCP bridge**:

```bash
node experiments/agent-parallel-lab/plan.mjs < experiments/agent-parallel-lab/sample-plan.json
node --test experiments/agent-parallel-lab/plan.node-check.mjs
```

The first command prints JSON with `ok`, `errors`, `warnings`, and `handoffs`; it does not execute handoffs. Invalid plans return exit code 1. The second command runs self-contained Node tests.

To use on a real game, copy and edit the sample plan outside this demo, setting actual `repo`, `base_branch`, `lanes[].owns`, `lanes[].task`, and check names. Feed the JSON through stdin. **Do not treat a valid plan as a successful build, test, gameplay evaluation, or GitHub PR.**

## Human-reviewed protocol

1. Use cockpit's read-only `build_context_pack` to inspect only safe context. Review `PACKET_QUALITY`, `CONTEXT_PROVENANCE`, and risk flags.
2. Identify **two or three disjoint directory scopes** for game logic, UI, and verification. If file ownership cannot be separated, use serial development instead.
3. Validate the JSON plan with this local, read-only tool. Review each emitted AI Creole handoff and edit instructions before giving them to Codex.
4. In the *separate, authorized development environment*, the human/operator may create one branch/worktree per lane, run Codex tasks, and collect outputs. This tool does **not** create or control worktrees, branch refs, processes, or agents.
5. Check each lane's actual diff against its scope; request fixes for out-of-scope edits. Open **draft PRs** for review.
6. Run **real** checks externally. Suggested for Godot: headless parse or smoke test, deterministic gameplay assertions, and `game-test-player` traces if configured. Do not claim these checks exist without verifying the target game's actual CI.
7. Integrate one approved PR at a time, rerun checks on the integrated branch, then obtain explicit human merge approval.
8. Record baseline (single agent) vs parallel execution results: wall-clock elapsed minutes, count of CI failures, and merge conflicts. Use `compareRuns(baseline, parallel)`; a faster time with worse quality is not an unconditional win.

## Known M0.1 limits

- Prefix checks are **lexical** only: symlinks, generated files, code dependencies, shared manifests, assets, and runtime coupling can still conflict.
- A valid JSON plan does not verify branch existence, ownership of actual diffs, test outcomes, build outputs, PR status, CI timing, or entertainment value.
- The plan tool reads **stdin only** and prints output; it does not access Git, filesystem, credentials, network services, or remote APIs.
- The `compareRuns` helper measures only provided numbers. Capture real timings with consistent start/stop boundaries, comparable tasks, and no claim of statistical significance from one trial.
- Do not merge or deploy automatically. The existing cockpit MCP bridge remains fixed at its v1.0 read-only capability set.

## M0.2 candidate, gated by evidence

If at least two real game trials show genuine parallel benefits without higher CI failure or conflict burden, consider a **separate reviewed development-side adapter** for PR evidence and worktree orchestration. Never add write, shell, authentication, Git mutation, or process execution tools to the cockpit read-only MCP bridge.

## References

- [OpenAI: Scaling Git at OpenAI](https://openai.com/index/scaling-git-at-openai/)
- [Git worktree manual](https://git-scm.com/docs/git-worktree)
- [Cockpit MCP v1 baseline](../../docs/mcp-v1-baseline.md)
- [Cockpit security boundary](../../docs/mcp-security.md)
- [AI Creole](../../AI_CREOLE.md)
