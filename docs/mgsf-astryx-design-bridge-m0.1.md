# MGSF Astryx Design Bridge M0.1

Status: **isolated pilot / review required**, not a production UI migration.

## Scope

- Host: madowaku-cockpit, because it already uses React 19. Runtime dependencies live only under experiments/astryx.
- Do not change madowaku-world. Its Astro/SVG house, content, typography, and growth rules remain untouched.
- Goal: test an accessible component, keep madowaku's visual identity, and collect official version-specific component/tokens docs for AI agents.
- Official project: https://github.com/meta/astryx (MIT, beta).

## Architecture

Independent Vite lab: experiments/astryx (React 19 + Astryx core/theme/CLI).
Read-only CLI evidence capture: experiments/astryx/scripts/bridge-evidence.mjs.
Agent policy: skills/astryx-bridge/SKILL.md, underneath the established UI Librarian reuse-first workflow.

No changes to root cockpit package.json, its lockfile, the production UI, CI, the MCP read-only security boundary, or deployment.

## Check

From experiments/astryx:

1. npm install
2. npm run dev
3. npm run build
4. npm test
5. npm run astryx -- doctor --json
6. npm run astryx -- component Button --json
7. npm run bridge:evidence > astryx-evidence.local.json

The evidence report uses only read-only CLI queries, capped output, and explicit human review before any copy into Shared Brain / AI Creole packets. The generated report is git-ignored.

## Acceptance gate for M0.2

Review keyboard/Tab/Enter/Space, visible focus, screen-reader status text, touch, 360px and desktop layouts, reduced-motion, package versions, dependency size, and comparison with the existing cockpit primitive. Record what is **actually** installed, built and visually tested. Astryx is still beta, so do not infer API stability from an older example.

Only adopt a production component if its accessibility, maintainability or agent-friendliness materially improves on the existing system. Any change to the public madowaku-world requires a separate explicit decision.

## References

- https://github.com/meta/astryx
- https://github.com/meta/astryx/blob/main/packages/core/README.md
- https://github.com/meta/astryx/blob/main/packages/cli/README.md
- https://github.com/meta/astryx/blob/main/LICENSE
