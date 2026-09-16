---
name: ui-librarian
description: Route UI asset and interface-system work to reuse-first specialist skills before inventing new icons, fonts, components, or motion. Use when a UI task spans multiple visual or interaction asset types, when the correct specialist is unclear, or when reviewing a screen for unnecessary reinvention.
metadata:
  short-description: Reuse-first UI asset orchestration
---

# UI Librarian

Treat UI production as curation before creation. Inspect the product's existing visual language, identify which asset systems are actually involved, and use the smallest specialist workflow needed to solve the task.

This skill is an orchestrator. Do not duplicate specialist guidance when a narrower librarian can handle the work.

## Start with the local system

Before proposing new UI assets or dependencies, inspect the target project for:

- design-system packages and local primitives;
- icon, font, motion, and component dependencies;
- tokens for spacing, type, color, radius, elevation, and motion;
- nearby screens or controls that already solve the same problem;
- accessibility and responsive conventions;
- framework and rendering constraints.

Existing product conventions outrank generic library preferences.

## Route by asset type

Use the narrowest relevant specialist:

- **Icons:** `$icon-librarian` for icon selection, normalization, animation, and custom SVG decisions.
- **Fonts / typography assets:** `$font-librarian` for font reuse, fallback stacks, loading strategy, licensing, and type-system integration.
- **Components:** `$component-librarian` for reuse of existing primitives, design-system components, third-party component libraries, and custom-component gates.
- **Motion:** `$motion-librarian` for transitions, feedback animation, reduced-motion behavior, and animation dependency decisions.

Read [routing.md](references/routing.md) when the task spans several categories or the boundary is unclear.

## Orchestration loop

1. **Name the user-facing job.** Describe what the interface must communicate or enable before naming a library or asset.
2. **Inventory the local system.** Find what the project already uses and what nearby UI establishes as precedent.
3. **Split the task by domain.** Route only the icon, font, component, or motion parts that need specialist judgment.
4. **Prefer reuse over addition.** Reuse a local primitive or installed dependency before adding another package or drawing a new asset.
5. **Preserve coherence.** A locally consistent second-best asset is usually preferable to a theoretically perfect foreign asset that fractures the system.
6. **Integrate across domains.** Check that typography, icons, components, and motion agree on hierarchy, density, states, and interaction meaning.
7. **Verify in context.** Review the rendered UI or supplied visual evidence at realistic sizes and states.

## Cross-domain rules

- Do not add a dependency merely because one subproblem has a nicer isolated solution elsewhere.
- Do not mix visual families accidentally. Mixed families must be an intentional system decision.
- Do not create bespoke assets until project reuse and established external sources have been checked.
- Prefer semantic HTML and accessible primitives over visual imitation.
- Preserve keyboard, focus, contrast, labeling, reduced-motion, and responsive behavior while changing presentation.
- If a task is purely one domain, use that specialist directly instead of expanding into a full UI audit.

## Verification contract

Before calling a UI change complete, use [reuse-checklist.md](references/reuse-checklist.md) to confirm:

- the existing system was inspected;
- no avoidable dependency or bespoke asset was introduced;
- visual and interaction conventions remain coherent;
- accessibility behavior remains intact;
- the result was checked in rendered context when visual quality is claimed.

## Output expectations

For implementation or review work, report compactly:

- user-facing job;
- local systems discovered;
- specialist domains used;
- assets/components reused or added;
- dependencies added or avoided;
- accessibility or reduced-motion work;
- rendered verification performed;
- unresolved system-level inconsistencies, if any.

Do not claim system coherence from source inspection alone when the task materially changes visual presentation.