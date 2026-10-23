# MAF-M1.8 Art Style Compass (isolated pilot)
A zero-dependency, no-network art-direction prototype inside the existing Cockpit. Open `/art-style-compass` when running the Vite app. The current Cockpit root route remains unchanged.

## Inputs and outputs
Japanese keyword matching → up to 3 deterministic candidate profiles → palettes, effort 1–3, compatible engine, source reference, and copyable Markdown proposal. Seed profiles are **original illustrative directions**, not scraped game metadata. Scoring is heuristic (keyword hit=4, complexity penalty=0.1 per level), not AI semantic retrieval. No localStorage writes or remote API calls.

## Safety and licensing
Do not ingest screenshots or game assets automatically. Only store manually reviewed URLs and curator-owned tagging. A source-site link does not grant permission to use artwork, screenshots or tag databases. Verify source and license before incorporating any third-party material. Generated style suggestions do not promise copyright clearance.

## Quality gate
Run `npm test` and `npm run build`; manually verify root app, /art-style-compass, keyboard focus, copy behavior, mobile layout and palettes in a browser. No screenshot-based Visual Evidence has yet been gathered. Until confirmed, **HOLD** release/adoption. Existing Godot workflow is unaffected because this pilot lives solely in the Cockpit front end.

## Next iteration
Add per-project saved choices after confirming existing Cockpit backup schema; add provenance fields for individually reviewed game references; score sample prompts with human ratings; add Playwright visual regression only after baseline screenshots are approved.
