# MGSF-M1.5.1 Visual Evidence and Style Compass

This is a stacked, isolated extension of MGSF-M1.5 (PR #5). Parent feature is not merged. **Draft/HOLD** until the base feature and interactive manual QA are approved.

## What is actual vs illustrative?

- **Actual source-hosted image**: two curated Game-icons.net icon SVGs, displayed with a visibly labelled `ACTUAL ICON / SOURCE HOSTED` marker, using explicit provider URLs.
- **Decorative placeholder**: all other Kenney packs use CSS shapes visibly labelled `CONCEPT ART / NOT ACTUAL ASSET`. Do not imply these represent specific asset pack contents.
- Remote preview errors do not grant trust; the individual source listing remains the authority.
- Preview hotlinking is experimental; if the provider blocks embedding, use a reviewed locally cached asset or revert to the illustration. Do not scrape or redistribute media without checking permission.

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
- Actual icon preview load and provenance markers
- Live search narrowing
- Style intent button state
- Candidate add/remove and localStorage persistence
- 320 / 390px horizontal overflow and narrow back button wrapping

CI uploads actual screenshots and `browser-smoke.txt` logs. Browser tests are only a **smoke**: they do not replace keyboard-only exploratory QA, credit audit, accessibility scanning or Windows acceptance. Remote source URLs must be checked before release; third-party links can change.

## Release gates

- [ ] PR #5 accepted and merged or deliberately rebased
- [ ] TypeScript/Vite build and unit tests pass
- [ ] CDP browser smoke pass with evidence (including remote actual-icon images)
- [ ] Screenshot and direct interaction human review at 1440, 768, 390, and 320px
- [ ] Keyboard, focus, reduced-motion, source-link navigation, attribution correctness reviewed
- [ ] Decide whether remote hotlink preview should be replaced by permission-reviewed local preview assets

No rights clearance or Godot auto-import is claimed.
