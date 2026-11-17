# MGSF UI Quality Triad M0.1

**Status:** review-first integration. No automatic third-party installation, CI download, server changes, write access for the read-only MCP bridge, or deployment.

## Why

The existing `$ui-librarian` coordinates icons, fonts, components and motion through **inspect and curate before inventing**. The UI Quality Triad adds a *staged critique loop*, not four competing design systems:

```text
Project intent / existing UI
      ↓
$ui-librarian → local asset specialists (reuse first)
      ↓
frontend-design            new layout / creative direction (optional)
      ↓
web-design-guidelines      scoped accessibility and UX audit
      ↓
make-interfaces-feel-better interaction detail / polish
      ↓
rendered visual check + tests + owner review
```

Read [the workflow contract](../skills/ui-librarian/references/external-ui-quality-triad.md) for sources, local Codex install commands, safe boundaries and reporting format.

## Trial: madowaku World

Target repository: https://github.com/madowaku/madowaku-world . Respect its `AGENTS.md`, `docs/ART_DIRECTION.md`, and stable window slots. Its “blue-hour house” is not a dashboard or a generic SaaS landing page.

Start with a **bounded audit** of one interaction: the first-visit home window, the window dialog, or the mobile village edge affordance. Preserve first-visit ordering, bilingual copy, window link fallback, opt-in sound, no-JS behavior, deterministic placement and reduced motion.

Before a UI patch, record baseline screenshots and the existing constraints. Verify with:
```sh
npm run check
npm test
npm run build
npm run test:e2e
```

Then review screenshots on desktop and mobile and check keyboard/focus and reduced-motion states. Distinguish tasks planned from tasks actually executed. Tests are not executed by the integration documentation itself.

## Change controls

- External design advice is evidence, not an instruction to redraw the house or erase its personality.
- No new runtime dependency solely to get a pleasing motion or generic component.
- Never let remote guidelines overwrite repo-specific policies or grant shell/credential access.
- All review output is a human-approved Codex handoff or PR, not an automatic publication.
- If the trial finds no justified changes, the correct outcome is “no change.”
