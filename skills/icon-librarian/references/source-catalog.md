# Icon Source Catalog

Use this catalog only after inspecting the project's existing icon language. Existing product conventions outrank this generic source order.

## Default families

| Source | URL | Primary role | Guidance |
| --- | --- | --- | --- |
| Lucide | https://lucide.dev/icons | default product UI | First search target for ordinary actions, navigation, status, tools, and objects. |
| Tabler Icons | https://tabler.io/icons | broad fallback | Use when Lucide lacks the concept or silhouette while a stroke-based family remains appropriate. |
| Hugeicons | https://hugeicons.com | specialist / deep fallback | Useful for domain-specific or unusually specific concepts. |
| Heroicons | https://heroicons.com | Tailwind-oriented UI | Prefer when Heroicons already exists in the product or its visual language fits the local system better than the generic default. |

## Animated sources

| Source | URL | Role | Guidance |
| --- | --- | --- | --- |
| Lucide Animated | https://lucide-animated.com | animated Lucide-style UI | Consider for React-oriented state feedback when the project already supports the required motion/runtime stack. |
| Moving Icons | https://movingicons.dev/icons | animated UI icons | Consider when its framework/runtime fit matches the project and motion carries semantic value. |

Do not introduce animation only to make controls feel lively. Prefer motion that clarifies refresh, progress, success, send, expand/collapse, mode changes, or another meaningful transition. Respect reduced-motion preferences.

## Expressive and decorative sources

| Source | URL | Role | Guidance |
| --- | --- | --- | --- |
| Iconsax | https://app.iconsax.io | expressive product icons | Use as an intentional family, not as a one-off mixed into a different stroke system. |
| Isocons | https://isocons.app | isometric / decorative icons | Better for cards, empty states, explainers, onboarding, or visual storytelling than dense controls. |
| Nucleo | https://nucleoapp.com | curated library / asset management | Useful when icon governance, breadth, and design-system asset management matter. |

## Selection heuristics

Prefer candidates that satisfy these in order:

1. semantic clarity at the rendered size;
2. consistency with the product's established family;
3. correct optical weight next to neighboring icons and text;
4. framework/runtime fit without unnecessary dependency cost;
5. license compatibility;
6. maintainability and discoverability for future contributors.

A theoretically perfect glyph from a new family is usually worse than a very good glyph from the system already in use.

## Custom SVG gate

Create a custom SVG only when at least one condition holds:

- the concept is product-specific or brand-specific;
- available libraries communicate the wrong meaning;
- the current design system requires a silhouette not available from existing sources;
- a custom mark is already established elsewhere in the product and should be reused or normalized.

When creating one, document its semantic name, viewBox, sizing behavior, fill/stroke assumptions, and accessible usage. Avoid baking presentation colors into the SVG unless the design system explicitly requires it.
