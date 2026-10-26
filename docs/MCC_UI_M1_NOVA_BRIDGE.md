# MCC-UI-M1.0 Nova Design System Intelligence Bridge

Status: isolated reference implementation / review-first / no vendor dependency.

## Verified upstream facts (2026-10-26)

- Sun* introduced Nova on 2026-10-14. The company describes it as an MIT-based open-license design system with Figma, React, Storybook, MCP, and AI Skills.
- Its public installation guide currently documents a PRIVATE GitHub Packages dependency, @sun-asterisk-internal/sun-design-system, requiring personal access and organization SSO.
- The upstream theming guide uses scoped data-theme values and semantic CSS variables, with examples such as --color-sds-text-primary, --color-sds-surface-base, --spacing-sds-200, and --radius-sds-400.
- This bridge copies none of Nova's private package code, tokens, or visual assets. Colors in this repo are authored locally and are not Nova values.

References:
- https://sun-asterisk.com/news/pressrelease/5807/
- https://nova.sun-asterisk.com/guide/08-installation/
- https://nova.sun-asterisk.com/guide/09-theming/

## Integrated here

1. src/novaBridge.ts: local light/dark token profiles, semantic crosswalk, contrast calculations, and copy-only Codex/UI Librarian handoff.
2. src/NovaDesignLab.tsx and src/novaDesignLab.css: collapsed, keyboard-accessible isolated demo in cockpit; sample actions do not write project data.
3. src/novaBridge.test.ts: color, semantic crosswalk, and handoff contract tests.
4. skills/ui-librarian/references/nova-bridge.md: routing and adoption gates.

## Scope and safety

- No auth, network requests, private Nova package, external scripts, fonts, or dependencies.
- No changes to read-only MCP APIs, localStorage schema, global CSS design tokens, or existing Cockpit workflows.
- Demo theme state is transient, scoped to the Nova Lab element. The cockpit visual identity is unchanged.
- The crosswalk shows publicly documented upstream VARIABLE NAME EXAMPLES, not a drop-in compatible token namespace.
- Contrast quick checks cover three sample pairs for normal-size text (minimum 4.5:1); they are not an accessibility certification.

## Acceptance gates

Run locally:
- npm ci
- npm test
- npm run build
- npm run mcp:smoke

Then manually review in a browser:
- Expand Nova Bridge Lab with keyboard and pointer; try light and dark themes.
- Inspect 320px mobile width and desktop; no overflow or unintended body-level theme changes.
- Verify tab order and focus ring for details/summary, radios, text input, buttons, and external link.
- Verify sample action only updates demo message and never active project/localStorage.
- Verify copy button produces a review-first handoff and does not request private package access.
- Check reduced-motion setting and a screenshot before/after; record visual evidence in PR.

## Deferred (not claimed as complete)

- Vendor package installation, Figma Code Connect, Storybook integration, MCP bridge to Nova, and production component migration require verified public access plus a separate license/compatibility review.
- CI can verify unit tests and builds, not visual quality or browser interactions.
- Keep HOLD until CI succeeds and a human checks the rendered UI.
