# madowaku UI Librarian Skills

A reuse-first skill family for UI production. The shared rule is simple: **inspect and curate before inventing**.

## Architecture

```text
$ui-librarian
  ├─ $icon-librarian
  ├─ $font-librarian
  ├─ $component-librarian
  └─ $motion-librarian
```

`$ui-librarian` is the orchestrator for cross-domain work. Use a specialist directly when the task is clearly limited to one domain.

## Skill catalog

| Skill | Use for | Core gate |
| --- | --- | --- |
| `ui-librarian` | cross-domain UI work and routing | inspect the local system, then load only the specialists required |
| `icon-librarian` | icon selection, normalization, animation, custom SVG decisions | search before drawing |
| `font-librarian` | fonts, fallback stacks, font loading, typography asset integration | reuse the existing type system before adding a family |
| `component-librarian` | controls, overlays, forms, navigation, reusable UI patterns | compose existing primitives before building a new component |
| `motion-librarian` | transitions, animation feedback, motion runtime decisions | animate only when motion communicates state or continuity |

## Common operating rule

All librarians should:

1. name the user-facing semantic or interaction job;
2. inspect nearby UI and installed/local assets;
3. prefer established project conventions;
4. reuse before adding dependencies;
5. add a dependency only when its benefit is material and its framework/license fit is acceptable;
6. create bespoke assets or behavior only after the reuse path is exhausted or clearly insufficient;
7. preserve accessibility and responsive behavior;
8. verify visual or interaction claims in rendered context when possible.

## Example prompts

```text
Use $ui-librarian to implement this settings panel without introducing redundant UI dependencies. Route icon, component, typography, and motion decisions to the relevant specialist skills and preserve the existing design language.
```

```text
Use $component-librarian to add an accessible command menu by reusing existing primitives or installed libraries before considering a new dependency.
```

```text
Use $font-librarian to review the current typography stack and determine whether the requested heading treatment can be achieved without adding another font family.
```

```text
Use $motion-librarian to add expand/collapse feedback while preserving the project's motion language and reduced-motion behavior.
```

## Growth rule

Add a new librarian only when a recurring class of UI decisions has enough distinct discovery, integration, accessibility, dependency, or verification rules to justify its own context. Do not split skills merely to create a larger taxonomy.

Likely future candidates include illustration assets, color/theme systems, data visualization, sound feedback, and 3D/web-graphics assets.