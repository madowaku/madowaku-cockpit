---
name: astryx-bridge
description: Evaluate Astryx components and design tokens for a React 19 madowaku internal UI without replacing local components or changing madowaku-world.
metadata:
  short-description: Astryx evidence and guarded UI pilot
---

# Astryx Bridge

Use as a candidate under ui-librarian and component-librarian, not as a blanket design-system replacement.

## Workflow

1. Identify the interaction job and exact target repo. Do not target madowaku-world automatically.
2. Inspect local primitives, installed dependencies, tokens, accessible behavior, and visual patterns **before** proposing Astryx.
3. In experiments/astryx, read the project-scoped CLI: npm run astryx -- docs principles --dense; npm run astryx -- docs tokens --dense; npm run astryx -- component Button --json; npm run astryx -- doctor --json.
4. Run npm run bridge:evidence > astryx-evidence.local.json and review bounded local output before copying relevant excerpts into an AI Creole / Shared Brain handoff.
5. Prototype in the isolated lab, then validate focus, keyboard, semantics, responsive layout, reduced motion, theme isolation, and bundle cost.
6. Record evidence, alternatives, dependencies, and a human-reviewed go/no-go.

## Safety boundaries

- Do not run CLI init, swizzle, template scaffolding, upgrade --apply, or any write/migration command without separate approval.
- Never run unscoped npx astryx: use @astryxdesign/cli.
- Do not modify production UI, the madowaku-world house, or the cockpit's read-only MCP tool set.
- No automatic sync of repo files or reports to external services.
- Read the installed CLI version's documentation rather than guessing props.

## AI Creole handoff contract

ROLE: Codex
MODE: codex_patch
TASK: Evaluate one Astryx-backed internal component
GOAL: A measurable accessibility or development improvement
STATE: Isolated M0.1 pilot, not production-integrated
TARGET: experiments/astryx
DO: inspect local primitives; consult CLI; prototype; test
KEEP: madowaku visual language, existing system, accessibility
NO: global CSS injection, site replacement, deploy, auto-migration
OUT: candidate comparison, screenshots, dependency and evidence report
CHECK: install, build, keyboard, mobile, reduced motion, doctor
RISK: beta API, dependency drift, reset/theme leakage
NEXT: human-reviewed decision for M0.2
