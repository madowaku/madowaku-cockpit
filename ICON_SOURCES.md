# ICON_SOURCES.md

madowaku standard icon source map for UI work.

The goal is simple: **search before drawing**. Reuse a coherent icon family whenever possible, avoid one-off SVG invention, and keep the visual language consistent across a screen.

## Default selection order

1. **Lucide** — default for general product UI.
2. **Tabler Icons** — first fallback when Lucide lacks the concept or silhouette.
3. **Hugeicons** — deep fallback for specialist, domain-specific, or unusually specific concepts.
4. **Heroicons** — preferred alternative for Tailwind-heavy interfaces or when its visual language already exists in the product.
5. **Animated libraries** — use only when motion improves state communication or interaction feedback.
6. **Decorative / expressive sets** — Iconsax, Isocons, and Nucleo are candidates when the surface intentionally needs a stronger visual voice.
7. **Custom SVG** — last resort, not the default.

## Source catalog

| Source | URL | Primary role | Notes |
| --- | --- | --- | --- |
| Heroicons | https://heroicons.com | clean product UI | Strong fit for Tailwind-oriented interfaces. |
| Lucide | https://lucide.dev/icons | default UI icon family | First place to search for ordinary actions, navigation, status, tools, and objects. |
| Hugeicons | https://hugeicons.com | large specialist catalog | Useful when a more specific concept is missing from the default family. |
| Tabler Icons | https://tabler.io/icons | broad fallback family | Similar utility to Lucide; useful for coverage gaps. |
| Lucide Animated | https://lucide-animated.com | animated React-friendly UI icons | Reserve for interaction feedback and state transitions. |
| Moving Icons | https://movingicons.dev/icons | animated UI icons | Consider when its framework/runtime fit matches the project. |
| Iconsax | https://app.iconsax.io | expressive product icons | Use intentionally, not as an accidental one-off mixed into another family. |
| Isocons | https://isocons.app | isometric / decorative icons | Best for cards, empty states, explainers, or visual storytelling rather than dense controls. |
| Nucleo | https://nucleoapp.com | managed icon library / design-system asset source | Useful when icon governance and a larger curated asset system matter. |

## Family policy

A screen should normally use **one primary icon family**.

Mixing families is allowed only when one of these is true:

- the secondary icon is an illustration or decorative asset rather than a control icon;
- the primary family does not contain a semantically correct icon and the fallback can be normalized visually;
- the product already defines multiple icon roles in its design system.

Do not mix families merely because a single icon looks prettier in isolation. A set of individually attractive icons can still create a ransom-note interface when stroke, corner radius, optical size, fill, and metaphor drift apart.

## Normalization checklist

When importing a fallback icon, normalize it against the primary family:

- apparent optical size;
- viewBox and bounding-box behavior;
- stroke width;
- line cap and line join character;
- corner roundness;
- fill versus outline treatment;
- baseline / vertical alignment;
- default size tokens;
- hover, active, disabled, and destructive states;
- animation timing if motion is present.

## Semantic rules

Prefer icons that communicate the action or state without forcing the user to decode an obscure metaphor.

For critical or unfamiliar actions:

- pair the icon with a text label;
- do not rely on color alone;
- provide an accessible name when the icon is interactive;
- mark decorative icons as decorative so assistive technology can ignore them.

Do not replace clear text with an icon merely to make a layout feel cleaner.

## Motion policy

Animated icons are for **meaningful feedback**, not ambient decoration.

Good candidates:

- loading / refresh;
- success / completion;
- expand / collapse;
- menu transitions;
- upload / download progress cues;
- recording / playback state;
- a short hover or press response when it helps reveal affordance.

Avoid animation when it creates constant movement, distracts from the main task, or duplicates feedback already communicated clearly elsewhere. Respect reduced-motion preferences.

## Custom SVG gate

Create a custom icon only when all of the following are true:

1. the concept is genuinely absent or semantically wrong in the approved libraries;
2. a text label or existing symbol cannot solve the problem better;
3. the icon is important enough to justify a bespoke asset;
4. the result can be made consistent with the current family;
5. its source and usage rights are clear.

When a custom icon is necessary, record why the existing libraries were rejected.

## Dependency policy

Do not add an icon package merely to obtain one icon unless there is a clear reason to make that family part of the product.

Prefer, in order:

1. an already-installed approved package;
2. a package that will become the primary family;
3. an approved static SVG asset when the library permits that usage and repository policy allows it;
4. a new dependency only when its ongoing value exceeds its maintenance cost.

Avoid shipping several overlapping icon packages without an explicit reason.

## License and terms check

Before production use, verify the current license and usage terms of the exact library, package, asset, and style being adopted. Free and paid tiers can differ, and terms can change over time.

Record any attribution or redistribution requirement that affects the repository or shipped product.

## Recommended madowaku default

For a new interface with no established icon system:

```text
PRIMARY: Lucide
FALLBACK_1: Tabler Icons
FALLBACK_2: Hugeicons
TAILWIND_ALTERNATIVE: Heroicons
MOTION: Lucide Animated / Moving Icons when justified
DECORATIVE: Iconsax / Isocons / Nucleo when intentionally art-directed
CUSTOM_SVG: last resort
```

This is a default, not a prison. If an existing product already has a coherent icon system, preserve it instead of forcing a migration.
