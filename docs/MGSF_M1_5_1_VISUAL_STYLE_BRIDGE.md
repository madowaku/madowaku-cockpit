# MGSF-M1.5.1 Visual Evidence and Style Compass

This is a stacked, isolated extension of MGSF-M1.5 (PR #5). Parent feature is not merged. **Draft/HOLD** until the base feature and interactive manual QA are approved.

## What is actual vs illustrative?

- **Actual source-hosted image**: two original CC BY 3.0 Game-icons.net SVGs preserved under `public/asset-previews/`, labelled `ACTUAL ICON / CC BY ORIGINAL`. Originals were fetched from `game-icons/icons` and retain per-asset author/source/credit records.
- **Decorative placeholder**: all other Kenney packs use CSS shapes visibly labelled `CONCEPT ART / NOT ACTUAL ASSET`. Do not imply these represent specific asset pack contents.
- Local SVGs do not grant license clearance; the individual source listing and CC BY attribution remain the authority.
- Remote preview hotlinking failed in CI and was replaced by locally retained original CC BY SVGs with provenance. Their source and attribution must ship with the software. Do not redistribute modified assets without checking license obligations.

## MAF compatibility

`STYLE_INTENTS` and `assessStyleMatch` are an **explainable local recommendation baseline**, not an MAF ML score:
- Pixel RPG, fantasy, low-poly 3D, rapid prototype.
- Each profile has explicit category/style/tag keywords and an evaluation hint.
- Scores are **strong / possible / low**, derived from matching catalogue keywords (not percentages, not image analysis).
- Matches are sorted stably; no unseen model claims. Artist review should eventually compare actual images with MAF Art Style Compass from its separate experimental branch.
- Existing MAF and MGSF branches are not modified.

## Browser QA

`scripts/asset-studio-browser-smoke.mjs` uses the Node 22 built-in WebSocket client and Chrome DevTools Protocol, with no browser automation library installation. The visual-evidence workflow launches Chrome with a local debug port. The smoke test exercises:
- Japanese heading and asset/source counts
- Original local icon preview load and provenance markers
- Live search narrowing
- Style intent button state
- Candidate add/remove and localStorage persistence
- 320 / 390px horizontal overflow and narrow back button wrapping

CI uploads actual screenshots and `browser-smoke.txt` logs. Browser tests are only a **smoke**: they do not replace keyboard-only exploratory QA, credit audit, accessibility scanning or Windows acceptance. Original upstream source URLs must still be checked before release; third-party pages can change.

## Release gates

- [ ] PR #5 accepted and merged or deliberately rebased
- [ ] TypeScript/Vite build and unit tests pass
- [ ] CDP browser smoke pass with evidence (including local original icon loads)
- [ ] Screenshot and direct interaction human review at 1440, 768, 390, and 320px
- [ ] Keyboard, focus, reduced-motion, source-link navigation, attribution correctness reviewed
- [ ] Confirm bundled original CC BY SVGs retain license and author attributions in release materials

No rights clearance or Godot auto-import is claimed.
