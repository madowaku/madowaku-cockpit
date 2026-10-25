# MGSF-M1.5.2 Kenney Original PNG Evidence + MAF Palette Bridge

This is a **stacked experimental PR** based on MGSF-M1.5.1 (PR #7), which itself depends on MGSF-M1.5 (PR #5). Both parents remain Draft/HOLD.

## What is shipped

- **13 unchanged Kenney PNG images** under `public/asset-previews/kenney/`, representing **6 authentic collections**. Original copies are committed as Git binary blobs, without redrawing, interpolation or fake screenshot generation. The gallery labels each original PNG as a **sample**, not a full-pack screenshot.
- `src/kenneyPreviews.ts` is a provenance manifest: each PNG's original path and exact Git blob SHA from the `shorepine/kenney` mirror. `shorepine/kenney` describes its content as CC0 (https://github.com/shorepine/kenney). **Kenney's official policy**, not the mirror, is the primary licensing authority: https://kenney.nl/support. Asset-specific official links remain in `assetCatalog.ts`.
- Two additional official Kenney CC0 catalogue listings with source-accurate names: UI Pack / UI Pack - Pixel Adventure.
- Other items without verified image samples remain explicitly marked **concept illustrations**. CC BY Game-icons SVGs remain attributed as before.
- **MAF Visual Evidence** runs browser-local analysis of *only the selected, locally bundled PNG samples*. It measures quantized colors, saturation, brightness and transparent area; it then compares sample representative RGB colors to frozen MAF M1.8 Art Style Compass profiles from [MAF PR #3](https://github.com/madowaku/madowaku-cockpit/pull/3) at commit `62ba331`. Results show the closest reference palette and the literal RGB distance, never fabricated confidence percentages.
- This is **NOT a model image classifier, art-quality judge, full pack analysis, MAF PR merge, or an automatic asset downloader**. Tag-based Style Compass ranking stays separate from measured sample color evidence.

## Design and UX safety

- One user action **「実画像を分析」** explicitly starts the pixel inspection. No external upload, no model expense.
- No arbitrary external URL can be analyzed: `analyzeLocalPreviews` allowlists only `/asset-previews/kenney/*.png` and limits 1–4 images per selection.
- Deliberate empty/loading/error states, keyboard-accessible button, screen-reader live region, no forced motion. Lack of original imagery is visibly disclosed.
- Selection and analysis never modify Godot, Cockpit localStorage, or read-only MCP.
- Comparison results are advisory. RGB distance is a color-only Euclidean score and a small sample gallery is not a representation of an entire game asset pack.

## Verification

1. `npm ci` / `npm test` / `npm run build` / `npm run mcp:smoke`.
2. Visual Evidence (Chrome 1440/768/390/320) + existing CDP browser smoke must assert **12 catalog items, 13 Kenney originals, 2 CC BY icons**, successful image loads, on-demand canvas evidence and no mobile overflow.
3. Human visually examine the real sprite gallery on Windows and mobile, credits and license URLs, palette swatches, disabled/empty states, keyboard navigation, contrast and reduced-motion.
4. Verify **exact Git blob checksums** against the source repo, and reconfirm Kenney's official CC0 before packaging. Third-party `shorepine` mirror is a source transport, not an endorsement.
5. Parent PRs #5 and #7 reviewed/merged in order or the stack rebased; never auto-merge.

**Release decision: HOLD until human UX and licensing acceptance.**
