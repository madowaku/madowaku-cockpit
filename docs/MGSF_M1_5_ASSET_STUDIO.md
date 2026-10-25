# MGSF-M1.5 Asset Discovery & License Intelligence / Asset Studio

## Purpose

Give a non-expert game maker one calm, visual flow: **discover → check provenance and usage terms → shortlist → copy a Godot handoff**. Asset Studio is a responsive, offline-first pilot within the existing madowaku-cockpit. It is deliberately **not** a federated search engine, live marketplace, downloader, license attorney, or Godot write agent.

## Entry and usage

1. From the Cockpit project rail, select **✳ Asset Studio**.
2. Search the 8-entry curated pack list by keyword, choose UI/2D/3D/icon filters, optionally filter to evidenced CC0.
3. Choose **詳細を見る** to inspect the **individual asset** URL and licensing evidence.
4. Choose **+ 候補に追加** to build a shortlist. Shortlist IDs are stored under `madowaku-mgsf-asset-studio-shortlist-v1`, separate from legacy Cockpit project backup.
5. Choose **導入メモをコピー** or **Markdownに保存**, then manually obtain source files and test in Godot.
6. Select **AI調査指示をコピー** to copy a research-only prompt with the current query and all eight provider URLs for Codex or Claude Code. **The studio does not execute AI searches.**
7. Visit the eight provider directories at the bottom when the curated list does not cover the desired format.

The current previews are intentionally **decorative CSS, not screenshots of downloaded assets**. The interface explicitly says so. There are no additional font, image or icon library dependencies.

## Trust and licensing contract

- **Source policy != per-item approval.** A source portal does not constitute approval for all its contents.
- `CURATED_ASSETS` contains only hand-checked Kenney pack URLs advertising **CC0**. Each pack has an evidence URL pointing to its actual listing; recheck the downloaded LICENSE and current listing prior to production use.
- Kenney states its assets on asset pages are CC0, including commercial uses: https://kenney.nl/support
- Game-icons.net describes CC BY 3.0 and an author credit obligation: https://game-icons.net/about.html
- Freesound has multiple CC licenses, including non-commercial cases: https://freesound.org/help/faq/
- Mixamo allows royalty-free characters/animation in commercial games; redistribution of raw assets is a separate concern. https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html
- The **Godot Asset Store** supersedes the deprecated Asset Library (which stays for older releases); verify individual add-on terms: https://godotengine.org/article/introducing-the-godot-asset-store/ and https://store.godotengine.org/
- Lospec, itch.io and OpenGameArt items are **not** automatically approved. Find author, license terms and source page first.
- `licenseVerdict` returns `ready`, `caution` or `blocked`. Only evidenced CC0 yields `ready`. `createGodotHandoff` preserves source URLs and manual review checkboxes.

None of these notes is legal advice. This pilot does not automate or certify commercial rights.

## Local architecture and compatibility

- `src/assetCatalog.ts`: portable typed source/catalog data, filtering, status gating, copy-only AI research prompt and markdown handoff.
- `src/AssetStudio.tsx`: screen state, local selection, outbound source links, copy/download actions.
- `src/asset-studio.css`: namespaced new visual system, no global changes to Cockpit.
- `src/App.tsx`: one launcher and conditional render; no changes to project state, backups, prompt builders or MCP bridge.
- `src/assetCatalog.test.ts`: source coverage, filtering, rights safety and handoff contract.

Existing Godot workflow, LittleJS experimental PR, read-only MCP security boundary, local-first storage and AI Creole handoffs remain unchanged. Asset Studio is an **isolated optional screen** rather than a replacement.

## Design rules

- A confident hierarchy: oversized hero → three-step map → searchable packs → side-by-side provenance inspector and shortlist → external directory.
- One primary action per decision: inspect a pack, shortlist it, then export a reviewable Godot note.
- Warm off-white surfaces, deep-teal anchors, restrained coral and mint highlights, patterned illustrations.
- Decorative illustrations are always identified as decorations rather than actual asset previews.
- Keyboard: semantic buttons, skip link, visible focus states, readable labels, live status text, no forced modal.
- Motion: subtle user-triggered CSS transitions only and a `prefers-reduced-motion` override.
- Responsive widths: two-column card+inspector on desktop, stacked inspectors and card layouts at tablet/mobile sizes.
- Avoid dependency churn; use the existing React 19, Typescript and CSS build.

## Verification checklist

Automated:
- `npm ci`
- `npm test`
- `npm run build`
- `npm run mcp:smoke`

Manual (human review remains required):
- [ ] Open Cockpit, open/close Asset Studio, ensure original project data remains unchanged.
- [ ] At 1440, 768, 390 and 320 px: inspect hero, cards, 8 directories, inspector, tray and no horizontal overflow.
- [ ] Verify **Japanese characters actually render** in CI screenshots (CI installs Noto CJK fonts) and check type hierarchy.
- [ ] Keyboard-only Tab / Shift+Tab: skip link, category filters, source links, add/remove buttons and export.
- [ ] Search `RPG`, `3D`, an unmatched term, reset, filter by kind and CC0.
- [ ] Add two packs, remove one, reload; check shortlist persistence without touching Cockpit backup.
- [ ] Copy the AI research prompt; verify all 8 sources, current category/query, license verification and no auto-download instructions.
- [ ] Copy and save markdown, verify URLs / evidence / unchecked quality gates.
- [ ] Disable clipboard access and try again: should explain that Markdown download is the fallback.
- [ ] Disable localStorage or corrupt shortlist JSON and verify no crash.
- [ ] OS reduced-motion setting: verify no distracting transitions.
- [ ] Confirm no network requests to asset APIs or automatic downloads.

## Follow-up phases (not implemented)

1. Extend to vetted **individual item** records from providers that require attribution, with credit/author/license proof.
2. Add user-entered candidate links, evidence snapshot metadata and an explicit rights review workflow.
3. Provide optional visual evidence capture of real assets with license-safe thumbnails, art-style comparison to MAF, and Godot import smoke via separately reviewed tooling.
4. Add automated accessibility/browser checks once a browser test runner and baseline are approved. Never claim visual QA complete from code inspection alone.

Review state: **DRAFT / HOLD until CI + human UI and licensing checks.**
