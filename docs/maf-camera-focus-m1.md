# MAF Camera & Focus Intelligence M1

**Status:** isolated experimental planner. The connected GitHub installation did not expose a dedicated MAF repository, so this module resides in madowaku-cockpit as an opt-in prototype, not a change to MAF.

## API

`buildFocusPlan(intent, scene, backend?)` returns schema-tagged `maf.camera_focus.v1` containing a focus preset, explicit foreground/midground/background, prompt, avoid list, and manual visual QA criteria. No additional dependencies and no remote generation calls.

## Trial cases

- emotion: close portrait with sharp eyes and subtle background blur
- mystery: framed character, varied bokeh from distant lights
- story-object: sharp key/clock while the face recedes
- relationship: crisp distant person, soft near person
- worldbuilding: sharp architectural depth
- game-asset: crisp readable silhouette, no lens blur

For A/B capture, save the prompt, model/engine/version, seed (when supported), aspect ratio, scene identity, output image references, reviewer notes and pass/fail reason. **No actual images were generated** in M1; text checks alone cannot validate artistic quality.

## Integration guardrails

Keep current Godot and ComfyUI pipelines unchanged. Add a UI only after a manual artistic review; keep presets revisable and clearly labeled. Source inspiration: https://x.com/mugi_AI_Art/status/2113571447763595529 (concepts, not copied example imagery).
