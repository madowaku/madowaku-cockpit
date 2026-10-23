---
name: art-style-compass
description: Translate a game mood or reference into a small, evidence-aware art-direction shortlist, balancing implementation cost, original asset workflow, palette, and Godot/LittleJS compatibility.
metadata:
  short-description: Game art direction shortlist
---
# Art Style Compass
Use when the user asks to find, compare or choose game art styles or transform a mood board into a buildable brief.
1. Ask for a short mood description only when no intent can be inferred. Otherwise proceed.
2. Identify art method, outlines, shading, palette, camera, engine and accessibility constraints.
3. Propose at most three clearly differentiated art directions with a reference URL, palette, workload (1 to 3), risks, and Godot/LittleJS prototype approach.
4. Use curated metadata as hypotheses, not factual descriptions of any particular game. Reference sites: https://gameartstyles.com/ and https://gameartstyle.loopyhop.com/.
5. Never automatically scrape, download, redistribute, or train on reference screenshots. Obtain separate license evidence for actual third-party assets.
6. Prefer one tiny original-asset prototype per direction, and compare real screenshots at the same viewport.
7. The final adoption gate requires human visual approval plus engine performance, legibility, contrast, and license checks.
When operating in madowaku-cockpit, use the standalone /art-style-compass view and the deterministic rankStyles/buildArtDirection functions. Its seed dataset is illustrative and not an official catalog.
