---
name: ui-observatory
description: Research game UI manually using source links and human-authored observations, then translate the underlying design principles into an original, accessible implementation brief. Use before ui-librarian when a game interface requires external reference research.
metadata:
  short-description: Game UI observation to original design brief
---

# UI Observatory (MGSF M0.1)

**Observe -> analyze -> translate -> create original UI.** Work from a design problem, not a screenshot to replicate.

## Scope and consent boundary

- Use Game UI Database (https://www.gameuidatabase.com/) as a human-opened reference source, not a scrape target.
- Do not crawl, use hidden endpoints, bulk download images, bypass anti-bot controls, copy screenshots into datasets, or imply the site's game UI images are open-licensed.
- Do not reproduce third-party screen layouts, branding, art, icons, sound, text, or animations verbatim. Capture your own concise notes and retain the source URL.
- Do not claim an automated visual analysis happened when only manual observations were supplied.
- A user's own notes and non-copyrightable design principles may inform original UI work; still check specific source terms and individual asset licenses before reuse.

## Intake

For each source manually inspected by a human, record:
1. Game / reference page URL (http or https), screen category (HUD, inventory, title/menu, dialogue, map, settings, other).
2. **Visual hierarchy**: what information is primary, secondary, on-demand?
3. **Interaction**: focus order, confirm/back, navigation, controllers and touch.
4. **Feedback**: default, selected, disabled, warning, success and error.
5. **Accessibility**: typography, contrast, non-color cues, reduced motion and readable density.
6. Distinguish **observed fact**, **assumption**, and **our intended design choice**.

If the source cannot be inspected directly, request the user's observations or use a source link as a pointer. Never infer unseen UI details from a game's title.

## Translate

1. Define player-facing job and screen state in one or two sentences.
2. Separate transferable *principles* from source-specific visual expression.
3. Consult `$ui-librarian` and relevant icon/font/component/motion specialists to reuse the target game's existing language.
4. Propose an original information architecture, interactions, keyboard/gamepad/touch focus rules, feedback and accessibility constraints.
5. Produce a compact **AI Creole / Codex** handoff using `ROLE MODE TASK GOAL STATE TARGET DO KEEP NO OUT CHECK RISK NEXT`.
6. Keep the repo target unresolved if it has not been inspected. Do not invent a Godot scene or component path.

## Verification

- Source URLs and human observations are traceable.
- No third-party screenshots or assets are copied into the deliverable.
- Output labels observations separately from design decisions and caveats.
- Keyboard focus, non-color selection cues, responsive layout (360px minimum), and reduced-motion paths are explicitly checked.
- If code is produced, run relevant tests and inspect the actual render; report tests not executed.

See [intake-template.md](references/intake-template.md) for a copy-ready observation record and acceptance checklist.
