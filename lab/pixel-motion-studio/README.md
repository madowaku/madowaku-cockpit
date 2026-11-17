# MGSF Pixel Motion Studio M0.1

A local-first pixel-art opening workshop, separate from the released madowaku World site.

## Reproducible first proof

An **8-second, 12 fps, 160×90** (nearest-neighbor upscaled to 640×360) original opening. A blue-hour house rises, a window opens, and the MADOWAKU wordmark appears. No audio, external assets, network, paid AI model, or runtime randomness.

Python 3.11+ and the open-source Pillow library are required for rendering. No cockpit npm dependencies change.

    python -m pip install Pillow
    python lab/pixel-motion-studio/render.py

Generated files are ignored by git:
- lab/pixel-motion-studio/outputs/opening.gif
- lab/pixel-motion-studio/outputs/poster.png

Optional MP4 with your existing FFmpeg installation:

    ffmpeg -y -i lab/pixel-motion-studio/outputs/opening.gif -vf "fps=24,format=yuv420p" lab/pixel-motion-studio/outputs/opening.mp4

## Pixelorama integration

1. Open the free Pixelorama pixel editor (https://github.com/Orama-Interactive/Pixelorama).
2. Make one 20×17 RGBA image of a window interior, allowing transparency. Export a PNG.
3. Render using the original pixel dimensions:

    python lab/pixel-motion-studio/render.py --window path/to/window.png

The PNG replaces the default window interior in the animation. Invalid dimensions cause an error. The source PNG stays untouched. Animation-frame import and sprite sheet export are future work, not claimed M0.1 features.

## Tool priorities

- **Use first:** Pixelorama (sprite editor) + this Pillow renderer (deterministic GIF) + an existing motion compositor as needed.
- **Optional when interactive:** Pyxel (https://github.com/kitao/pyxel), official skill (https://github.com/kitao/pyxel-skill), official MCP (https://github.com/kitao/pyxel-mcp). These are not automatically installed.
- **Defer:** Aseprite AI Artist (https://github.com/with-pebbly/aseprite-ai-artist) until a usable Aseprite editor is available. MIT plugin is not a license to use the editor for free.
- **Defer:** Three.js diorama workflow (https://github.com/sloemo01/diorama) until 3D is needed.
- **Inspiration only:** git-koi and pixel-path; check tool and paid API requirements before adoption.

Reference library for design research: https://motionsites.ai/ (some paid prompts), https://land-book.com/, https://recent.design/, https://landdding.com/, https://fontinlogo.com/, https://60fps.design/. Godly redirects to Recent.design. Do not copy protected art, layouts or logos; treat examples as study material and verify reuse rights.

## Safety and acceptance

- This workshop does not create or publish a work in madowaku World.
- No edits to the site's navigation house, window placement, release counters, or deployment.
- The GIF and static poster can be reviewed locally. Before public integration, verify visual quality, small-screen scaling, accessibility, reduced-motion and browser playback.
- Record provenance of imported art and licensing. Do not install unneeded dependencies.

Next M0.2 decision: animation frames in Pixelorama, interactive Pyxel, or 3D diorama. Choose one after reviewing the proof.
