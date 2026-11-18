# MGSF Tiny Pixel Foundry M0.1

Status: **proposal / source evaluation required**  
Added: 2026-11-18  
Reference: https://huggingface.co/spaces/cfahlgren1/slack-moji

## Intent

Investigate a small, free-first pipeline for making emoji-scale pixel-art assets for MGSF games and madowaku windows. Treat Slack Moji as a research reference, **not** as a cleared dependency or redistributable asset source.

This document is a reviewed handoff proposal; it does not grant the cockpit MCP bridge new capabilities or import external code/weights.

## M0.1 scope

1. **Reference probe:** inspect the Space source and its upstream model card, commit/revision, dependencies, license, usage restrictions, browser runtime, network requests, and any model downloads. Record evidence and dates. Do not infer that a public Space grants commercial redistribution rights.
2. **Manual experiment:** try prompts for a key, potion, heart, NPC emotion, tiny window, and treasure icon. Measure usable outputs, rough latency, output dimensions, background transparency, and mobile performance.
3. **Asset adapter (local/offline-first):** accept a user-provided PNG into a local staging area, produce a preview/contact sheet and optionally a 16x16/32x32 nearest-neighbor downscaled PNG. Preserve the original; avoid imposing generated pixel-art labels on non-pixel imagery. No third-party network call in the adapter.
4. **Metadata:** per asset, retain prompt (when known), source/model identification (when known), creation date, source URL, license verification state, human acceptance flag, and export size.
5. **Human review:** before an asset enters a game, confirm license, provenance, readability at target size, transparent edges if required, and consistency with the game's palette.
6. **Exports:** transparent PNG (only if verified or explicitly edited), optional sprite-sheet/manifest. No automatic publishing.

## Gates and safety

- **License gate:** investigate the Space source license separately from any model weights, fonts, datasets, and generated content terms. If missing/ambiguous, do not copy, distribute, or commercially deploy upstream code or model.
- **No implicit inference access:** browser-local execution is a hypothesis until source/runtime inspection confirms it.
- **No credential collection** and no uploads of private assets to unknown endpoints.
- **No new write/shell/auth/browser tool** in the existing read-only MCP bridge. Any generator or converter lives in a separately reviewed package/process.
- **No mandatory cloud or paid service.** Provide a hand-drawn or user-supplied PNG path as a fully functional fallback.

## Acceptance checks

- [ ] Source/model/terms evidence recorded (or unknown marked as blocking).
- [ ] Five or more trial prompts documented with failures as well as successes.
- [ ] At least one user-provided PNG imported, previewed at 16x16 and 32x32, and exported with original intact.
- [ ] Exported PNG opens in a sample game project; no palette or alpha regressions.
- [ ] Metadata manifest tracks source, license status, and human approval.
- [ ] Local-only fallback works without the Slack Moji Space.
- [ ] Unit tests cover resize behavior, file type/size limits, and malformed inputs.

## Suggested architecture

```text
User / manually saved image
          |
          v
Input validator -> Source & rights record -> Local pixel preview
                                             |
                                     Human review + approval
                                             |
                                 PNG / sprite sheet / manifest
                                             |
                                  Game or madowaku window
```

Optional upstream model integration is **M0.2 or later** only after license and architecture validation.

## Codex handoff (review first)

```text
ROLE: Codex
MODE: codex_patch
TASK: Prototype MGSF Tiny Pixel Foundry M0.1 in a separately reviewed project/package.
GOAL: Free-first, local image-to-small-PNG asset staging with provenance.
STATE: Slack Moji reference not yet cleared for code/model reuse; cockpit MCP is read-only.
TARGET: A minimal converter, manifest schema, tests, and demo input.
DO: Verify upstream terms; start with locally supplied PNG; preserve originals; make 16x16 and 32x32 previews.
KEEP: Human review, transparent provenance, offline fallback, existing cockpit security boundary.
NO: No unlicensed model weights, remote upload by default, credentials, auto publishing, or MCP mutation tools.
OUT: Demo, test report, dependency/license table, and integration proposal.
CHECK: PNG handling, alpha edges, dimensions, invalid inputs, mobile/game readability.
RISK: Source terms not verified; tiny-image downsampling can destroy detail; possible browser incompatibility.
NEXT: Consider model inference integration only after documented license and runtime proof.
```
