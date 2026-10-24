# MAF Camera & Focus Intelligence (experimental)

Use when creating AI art, illustration or game image prompts that require deliberate depth-of-field, focal storytelling, or comparison of blur treatments. **Opt-in only**: no network, model invocation, prompt history, automatic generation, or changes to the existing Godot/ComfyUI flow.

## Workflow

1. Identify the artistic goal: `emotion`, `mystery`, `story-object`, `relationship`, `worldbuilding`, or `game-asset`.
2. Use `buildFocusPlan(intent, scene, backend)` in `src/cameraFocus.ts`, where backend is `gpt-image`, `comfyui` or `generic`.
3. Review foreground, midground, background and **the exact focal target**. Ask the user only for direction-changing ambiguity.
4. Use `prompt` as a candidate, not a proven generation result. `avoid` is guidance: for ComfyUI it may go into a negative prompt if supported, but GPT Image needs natural-language adaptation.
5. Produce A/B images with the same character, scene, seed when supported, and aspect ratio. Change just focus treatment; capture prompt, model/version, settings and output identifiers.
6. Use `buildFocusEvidenceChecklist(plan)` plus human review. No claim of automated vision scoring unless actual tests were run.
7. Preserve the original assets and workflow. Do not import copyrighted example images; derive descriptions and presets independently.

## Quality gate

- Main subject or story object clearly readable
- No foreground objects covering essential eyes/face
- Bokeh has identifiable light sources and varied size if used
- Worldbuilding remains crisp across the scene
- Game assets have clear silhouettes; avoid gratuitous lens blur
- Compare A/B outputs before promoting a preset

## Roadmap

M1: deterministic focus presets + text QA (this module).
M2: optional UI entrypoint and structured visual evidence capture.
M3: backend-specific verified A/B benchmark. Integration into MAF requires identifying its actual repository.
