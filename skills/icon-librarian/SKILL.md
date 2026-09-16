---
name: icon-librarian
description: Select, integrate, review, and normalize UI icons by searching existing project assets and established icon libraries before creating custom SVGs. Use when adding, replacing, auditing, or animating interface icons in product UI.
metadata:
  short-description: Reuse-first UI icon selection and integration
---

# Icon Librarian

Treat icon work as information architecture, not decoration. Search before drawing, preserve the product's existing visual language, and add the smallest dependency needed to communicate the intended action or state.

## Establish the local icon language first

Before selecting an icon, inspect the target project for:

- existing icon packages or local icon components;
- nearby icons performing similar roles;
- stroke vs fill conventions;
- standard sizes, stroke widths, colors, and state treatments;
- accessibility conventions;
- existing motion libraries and `prefers-reduced-motion` handling.

Local product conventions outrank this skill's generic defaults. Do not introduce a new icon family merely because another library has a slightly better glyph.

## Selection loop

1. **Name the semantic job.** Describe the action, object, status, navigation destination, or feedback state in plain language before searching.
2. **Search the existing project.** Reuse an existing icon or component when it already expresses the meaning clearly.
3. **Search the established family.** If the project already uses Lucide, Heroicons, Tabler, Hugeicons, Iconsax, Nucleo, or another family, stay in that family when practical.
4. **Use the fallback ladder only when needed.** If no family is established, use Lucide first, then Tabler, then Hugeicons. Use Heroicons when Tailwind-oriented visual conventions make it the better local fit.
5. **Use motion only when motion communicates something.** Animated icons are appropriate for state change, progress, success, refresh, send, expand/collapse, or similarly legible feedback. Do not animate merely to decorate a control.
6. **Normalize integration.** Match the surrounding optical size, alignment, stroke/fill treatment, color states, button hit area, and accessible labeling.
7. **Create custom SVG only as a last resort.** Use a custom glyph when the concept is product-specific, no existing candidate communicates it adequately, or matching the current design system requires a bespoke shape.
8. **Verify in context.** Inspect the rendered control or screen, not just the isolated glyph. Check clarity at actual size, nearby visual weight, disabled/hover/focus states, and dark/light surfaces when relevant.

## Default source ladder

When the project has no stronger local convention:

```text
Lucide
  -> Tabler Icons
    -> Hugeicons
      -> Heroicons when locally appropriate
        -> expressive/decorative families when intentionally required
          -> custom SVG
```

Read [source-catalog.md](references/source-catalog.md) for source roles, URLs, and selection guidance.

## Dependency discipline

Prefer an icon library already installed in the project. Before adding a dependency, determine whether:

- the existing package already has a suitable icon;
- importing a single SVG or local component is more appropriate;
- the new package would duplicate an established library;
- its license is suitable for the project;
- the runtime/framework integration matches the codebase.

Do not add an entire icon package to obtain one marginally better glyph unless the tradeoff is justified.

## Accessibility

Icons that are purely decorative should not create duplicate accessible names. Icon-only controls need an accessible label supplied by the control or project convention. Never rely on icon shape or color alone for critical state communication when accompanying text or another cue is needed.

Read [review-checklist.md](references/review-checklist.md) when auditing a screen, reviewing an implementation, or deciding whether an animated/custom icon is justified.

## Output expectations

When the task asks for implementation, report compactly:

- semantic job;
- reused or selected source/family;
- selected glyph/component name when known;
- whether a dependency was added;
- any normalization or accessibility work;
- whether custom SVG or motion was necessary and why;
- verification performed.

Do not claim visual consistency unless the icon was inspected in its rendered context or equivalent supplied evidence.
