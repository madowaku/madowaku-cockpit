# MGSF UI Observatory M0.1: observation template

## Observation
- Game title:
- Reference URL (manually opened):
- Screen type: HUD / Inventory / Title & Menu / Dialogue / Map / Settings / Other
- Observation date:
- Source access: viewed by a human / user-provided notes / link only (not inspected)
- Confidence: verified observation / hypothesis / design idea
- Visual hierarchy:
- Interaction / navigation / back behavior:
- Feedback and states:
- Accessibility:
- Tags:

## Translation
- Target game / repository (or "unknown"):
- Intended player job:
- Transferable principles:
- Source-specific expression **not** to copy:
- New visual identity:
- Input devices and focus behavior:
- Empty / error / disabled / success states:
- Responsive and reduced-motion behavior:

## AI Creole handoff

```text
ROLE: Codex
MODE: codex_patch
TASK: Implement an original [screen] for [game]
GOAL: [player job]
STATE: Human-observed references with URLs; no remote screenshots imported
TARGET: Inspect repository before choosing paths
DO: Reuse local UI language and build original layout, states, and interactions
KEEP: Existing architecture, keyboard focus, accessibility, responsive conventions
NO: Scraping, copyrighted reference screenshots, visual tracing, hidden API access
OUT: Design spec, changed files, verification
CHECK: Keyboard / controller (if relevant) / focus / 360px / contrast / reduced motion
RISK: Misreading source details; unwitting imitation; unknown game implementation context
NEXT: Inspect target repository and create minimal patch
```

## M0.1 acceptance

- [ ] At least one manually recorded, attributed reference or an explicit empty state
- [ ] Observation fields can be edited and deleted locally
- [ ] Filter by screen type and keyword
- [ ] Safe JSON backup and restore, bounded entry counts
- [ ] Export original design brief to Markdown / AI Creole
- [ ] No automatic reference-site fetching, image downloading, telemetry, or API keys
- [ ] Input validation rejects executable/non-http(s) links
- [ ] Mobile and desktop layout, focus feedback, and accessibility reviewed
- [ ] Tests and any unverified behavior reported accurately
