---
name: pixel-motion-studio
description: Produce and review pixel-art animations, retro intros and sprites for madowaku. Use when the task needs a reproducible pixel sequence, sprite export or game-like motion. Prefer the simplest free local pipeline before optional editor/MCP/3D tools.
metadata:
  short-description: Local-first pixel animation production
---

# Pixel Motion Studio

Build a small, testable artifact before adding animation dependencies. This skill complements MGSF Motion Foundry and motion-librarian without touching the public site.

## Selection gates

1. Choose output: GIF, sprite sheet, MP4, interactive Pyxel, or 3D diorama.
2. Inspect local sprites, art direction, pixel ratio, timing, licenses and existing motion tools.
3. Default: Pixelorama for authored RGBA sprites and lab/pixel-motion-studio/render.py for reproducible GIF and poster.
4. Pyxel and its upstream MCP/Skill: use only for game logic, interaction or headless game QA. Install separately if needed.
5. Aseprite AI Artist: only with a separately licensed/available Aseprite editor; MIT plugin licensing does not confer editor rights.
6. Diorama and Three.js: defer until 3D is needed.
7. Motion Foundry: composite/export after raw art passes visual QA, keeping nearest-neighbor scaling.

## First proof

- Read lab/pixel-motion-studio/README.md.
- Install Pillow in an isolated local Python environment if absent.
- Run: python lab/pixel-motion-studio/render.py
- Visually review outputs/opening.gif and outputs/poster.png: continuity, clipping, pixel interpolation, typography, consistent 8-second timeline.
- For Pixelorama exchange, export an RGBA 20×17 window PNG and pass --window. Reject incorrect sizes.
- Use FFmpeg for optional MP4 without cloud conversion.

## Guards

- Public identity: madowaku; MGSF is only the workshop.
- Never modify madowaku-world while producing or researching assets. Release or deployment needs owner approval.
- No sound or autoplay on public pages. Respect prefers-reduced-motion and offer a static poster.
- No paid APIs, surprise package installation, credential access, or unlicensed third-party graphics.
- Same frame/time must generate the same output; no randomness in production renders.
- Extract principles from design galleries instead of reproducing a site's visual assets.

## Handoff

Report files, actual checks, fps, resolution, duration, source/licensing, deferred work and missing verification. Never claim browser playback or accessibility QA that was not performed.
