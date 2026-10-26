# Nova reference adapter (MCC-UI-M1.0)

Use this only when a screen or component task benefits from a design-system token audit. This is a reference to public Sun* Nova guidance, not a vendored Nova integration.

## Decision order

1. Inspect existing cockpit components, tokens, accessibility conventions, and UI Librarian references first.
2. Identify the semantic job: primary actions, text/surface, spacing, radius, focus, and theme. Avoid copying raw brand colors.
3. If studying Nova, map PUBLIC semantic role names only; do not rely on internal *--ref variable names.
4. Use the isolated Nova Bridge Lab preview to explore light/dark, then copy the handoff packet for Codex.
5. Introduce no new runtime dependency or global style without explicit compatibility review.
6. Verify automated tests, responsive visual evidence, real keyboard behavior, and reduced motion.

## Package availability guard

As of 2026-10-26, the official Nova install guide names a PRIVATE GitHub Packages package with organization SSO. Free-to-use announcements do not imply anonymous install access. Never request or store a PAT inside cockpit. Do not edit repository .npmrc or CI secrets to force access.

## Separation of concerns

- Official Sun* Nova docs: https://nova.sun-asterisk.com/guide/09-theming/
- Local authored demonstration: src/novaBridge.ts and src/NovaDesignLab.tsx
- No assertion of token numerical equivalence or component API compatibility.
- MCP remains read-only; AI outputs are copy-only and review-first.

## Handoff requirements

Return token-role map, reuse candidates, changed files, accessibility checks, visual evidence, CI status, unresolved compatibility concerns, and one next step.
