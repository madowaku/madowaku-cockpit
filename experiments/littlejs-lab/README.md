# MGSF-M1.3 LittleJS Rapid Game Lab

**Status: experimental, isolated, not integrated into MGSF/Godot.**

This folder offers a browser-game canary and a reproducible, evidence-driven
Codex vs Claude Code comparison procedure. It does NOT add browser, write,
shell or network tools to the cockpit read-only MCP. No automatic model calls
and no automatic paid services.

## Install and test (Node.js 22)

From this folder:

```bash
npm install --no-package-lock --ignore-scripts --no-audit --no-fund
npm run setup
npx playwright install chromium
npm run test:unit
npm run test:browser
npm run gate
npm run compare
```

The isolated `setup` installs only a LittleJS engine bundle, API reference,
and `littlejs-conventions` instruction file into ignored `.vendor/`.
All are pinned to LittleJS-AI commit
`5b712052848b58e4fce127cec2531c024cb3d9b5` with individual Git blob
integrity checks. Upstream LittleJS-AI is MIT-licensed; preserve its notices.
No source files, root dependencies, Godot scenes or MCP commands are modified.

The baseline canary opens directly over `file://`. Browser testing presses
ArrowRight, checks movement, collection and canvas visibility, rejects page
errors, and records PNG + JSON evidence. Successful runs create
`evidence/baseline/{playtest.png,playtest.json,playwright-results.json,gate.json}`.
Failures preserve Playwright screenshots/traces in `test-results/`.
Generated artifacts are ignored by Git and uploaded by the lab-only CI job.

## Identical Codex / Claude Code benchmark

1. Run setup once. Give both agents the **exact bytes** of
   `benchmark/prompt.md`, plus `.vendor/littlejs-conventions.md` and
   `.vendor/reference.md`, under identical instructions and resources.
2. The agents write independent games only to `runs/codex/` or
   `runs/claude/`; do not give them access to the other run. Never run
   code produced by a model outside this sandbox.
3. Execute the same test and gate for each:
   ```bash
   LITTLEJS_LAB_CASE=codex npm run test:browser
   LITTLEJS_LAB_CASE=codex npm run gate
   LITTLEJS_LAB_CASE=claude npm run test:browser
   LITTLEJS_LAB_CASE=claude npm run gate
   ```
   In Windows PowerShell, run
   `$env:LITTLEJS_LAB_CASE="codex"`, the two npm scripts, then
   `Remove-Item Env:LITTLEJS_LAB_CASE`; repeat for claude.
4. Create `runs/codex.json` and `runs/claude.json` from
   `benchmark/run.example.json`. Compute the prompt hash using
   `node -e "const fs=require('fs'),c=require('crypto'); console.log(c.createHash('sha256').update(fs.readFileSync('benchmark/prompt.md')).digest('hex'))"`.
   Record the actual model ID and measured usage. Unknown usage is `null`.
5. Run `npm run compare -- --strict`. The JSON comparison will be stored
   in ignored `comparison/report.json`.

`npm run compare` without strict mode outputs **INCOMPLETE** until both
verified cases and matched prompt digests exist. This is not a real benchmark
result yet. No model is called by scripts in this directory. The reported
time/tokens/cost are user-supplied and not independently verified against
vendor billing; subjective playability still requires human review.

## Quality / compatibility requirements

- Existing cockpit CI: `npm test`, `npm run build`,
  `npm run mcp:smoke`. Existing tool-name regression must remain green.
- Standalone LittleJS lab canary passes on Ubuntu and Windows and saves proof.
- Real Codex and Claude Code runs must separately pass browser and gate before
  the A/B result may be called comparable.
- Human checks actual gameplay and evidence before merging or promoting.
- Godot and MGSF remain unchanged. Direct MGSF import is deferred because its
  repository was not exposed by this GitHub connection.

**Merge recommendation: HOLD** until CI and human review pass.
**MGSF promotion: HOLD** pending real model comparison and reviewed adapter.
See `docs/mgsf-bridge.md` for the proposed read-only evidence contract.
