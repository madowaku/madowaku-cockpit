# MCC-M3.1 Real Engineering Skills Bridge

Status: **experimental / review-first / catalog only**. This change does **not** install or execute third-party Skills.

## Goal
Make useful Matt Pocock engineering Skills discoverable from madowaku-cockpit without giving a new agent operational authority or displacing existing mado-loop evidence gates.

## Verified sources
- Upstream: https://github.com/mattpocock/skills
- Upstream MIT license: https://github.com/mattpocock/skills/blob/main/LICENSE
- Local data: `skills/real-engineering-bridge/catalog.json`
- Re-evaluate upstream files, versions and licenses before copying or installing any Skill. No third-party Skill body is vendored here.

## Current system boundaries
- **madowaku-cockpit** remains local-first, copy-only, review-first; the MCP transport stays read-only with the existing fixed tool allowlist.
- **mado-loop** remains the explicitly invoked Godot implementation and proof orchestrator. P0-P5 evidence gates are not replaced by external code reviews or agent assertions.
- **mado-system-one** is not modified in this pilot.
- No installs, model calls, network sync, repository mutations, secret access, or shell execution from the cockpit bridge.

## Routing guide
| Situation | Candidate | Decision |
| --- | --- | --- |
| Requirements unclear | `grill-with-docs` | Opt-in questioning; output a reviewed AI Creole handoff |
| Proposed code change needs independent critique | `code-review` | Review only; CI and runtime checks remain required |
| Completed development needs reflection | `retro` | Produce suggestions, not automatic changes |
| Architectural drift | `improve-codebase-architecture` | Survey only; separately approve refactors |
| Approved idea needs specification | `to-spec` | Later A/B lane |
| Approved specification needs tickets | `to-tickets` | Later A/B lane |

Do not assume an installed Skill is automatically invoked. The operator should explicitly select it, or copy a recommended handoff after review.

## Pilot procedure
1. Inspect candidate `SKILL.md` and any referenced scripts or dependencies at a pinned upstream commit. Scan for unsafe instructions, hidden network activity, credential requests, license conditions, destructive commands and scope creep.
2. Install only a chosen Skill in a disposable project/agent profile, **not** into the global profile or production Godot environment. Keep one installation mechanism per agent; don't combine the upstream plugin and skills.sh copies.
3. Record baseline and candidate behavior on the same synthetic, non-sensitive prompt. Run Codex and Claude Code comparisons only where locally available; OpenCode is optional. Never send private material to free providers without consent and an appropriate privacy route.
4. Assess task completion, unwanted changes, clarity for the human operator, review overhead, tokens/cost if measurable, and mado-loop proof compatibility.
5. Promote an adapted Skill only via a separate PR including attribution/required MIT notice, pinned upstream source, tests, rollback and human review. On failure, remove the disposable install and leave the production system untouched.

## Acceptance conditions
- The catalog only refers to known upstream paths and stable local schema.
- All routing options are opt-in, no executable or write-capable MCP tool is added.
- Tests validate the catalog and its safety properties.
- This PR does **not** claim installation, real-model A/B results, Windows UI checks or CI PASS without independent evidence.

## Operator handoff (copy and review)
```text
ROLE: Codex
MODE: review-first
TASK: Evaluate ONE Matt Pocock Skill from skills/real-engineering-bridge/catalog.json.
DO: Pin and inspect upstream SKILL.md plus dependencies; check scope, licenses, duplicate behavior and prompt-injection risk. Compare baseline versus isolated candidate on synthetic tasks. Report measured findings and evidence.
KEEP: Existing AI Creole contracts; mado-loop invocation and P0-P5 gates; local-first and read-only cockpit MCP.
NO: Global installation, auto-update, secret exfiltration, production mutation, silent agent delegation, auto-merge.
OUT: Candidate, pinned source, overlap matrix, risk assessment, comparison evidence, recommendation, rollback.
CHECK: npm test; npm run build; npm run mcp:smoke; Windows and Ubuntu CI.
RISK: External Skills are untrusted until audited.
NEXT: Human review before promotion.
```
