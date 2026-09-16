# icon-librarian

A compact operating rule for Codex, Astra, Claude, ChatGPT, and other coding agents working on madowaku UI.

Use this rule whenever a task adds, replaces, reviews, or animates interface icons.

## Objective

Choose the clearest existing icon with the smallest visual and dependency cost while preserving the product's icon language.

The agent should behave like a librarian before behaving like an illustrator.

## Read first

Before changing icons:

1. inspect the current project for an existing icon package, local icon component, design token, or SVG convention;
2. inspect nearby UI to identify the current primary family, stroke/fill style, size tokens, and interaction states;
3. read `ICON_SOURCES.md` when the project has no stronger local rule.

Existing product conventions outrank the generic default.

## Search ladder

If the project has no established family, search in this order:

```text
Lucide
→ Tabler Icons
→ Hugeicons
→ Heroicons when Tailwind/design context makes it a better fit
→ animated library only when motion has a UX purpose
→ Iconsax / Isocons / Nucleo for intentionally expressive or decorative roles
→ custom SVG only after the gate below passes
```

Do not silently jump to a new family because its individual icon looks better in isolation.

## Decision procedure

For every requested icon:

1. **Name the semantic job.** Example: `delete item`, `open settings`, `sync`, `warning`, `expand panel`.
2. **Search the current family first.** Prefer a semantically correct icon over a merely similar silhouette.
3. **Check interaction context.** Ask whether the icon needs a label, tooltip, state variant, animation, or destructive treatment.
4. **Use a fallback only when necessary.** If a fallback family is used, normalize it to the primary family.
5. **Avoid new dependencies for one symbol.** Reuse what is already installed when reasonable.
6. **Check accessibility.** Interactive icons need an accessible name; decorative icons should not create screen-reader noise.
7. **Check reduced motion.** Motion must degrade cleanly when reduced motion is requested.
8. **Verify terms before shipping.** Never assume a library's current license from memory when production usage depends on it.

## Custom SVG gate

Do not draw or generate a bespoke SVG until you have checked the approved sources.

A custom SVG is justified only if:

- no approved source provides a semantically correct icon;
- adapting an existing symbol would be misleading;
- the product genuinely benefits from a bespoke symbol;
- the icon can match the local visual grammar;
- usage rights are clear.

When creating one, leave a short code comment or implementation note explaining why the standard library was insufficient when that context would otherwise be lost.

## Visual consistency checks

Before considering the task done, compare the new icon with adjacent icons for:

- apparent size, not just numeric width/height;
- stroke width and density;
- fill/outline treatment;
- corner language;
- alignment and baseline;
- spacing to text;
- hover/pressed/focus/disabled behavior;
- destructive or warning semantics;
- dark/light theme behavior if applicable.

A mechanically identical `24px` box does not guarantee optical consistency.

## Motion rules

Use animated icons when the motion explains state change or strengthens feedback.

Preferred examples:

- refresh/sync in progress;
- success completion;
- menu or chevron state changes;
- recording/playback state;
- upload/download feedback;
- concise hover/press feedback.

Reject motion that is permanently active, ornamental without purpose, or likely to compete with primary content.

## Accessibility rules

- Icon-only controls require an accessible label.
- Critical/unfamiliar actions should usually have visible text as well.
- Decorative icons should be hidden from assistive technology where appropriate.
- Do not encode meaning only by color.
- Do not replace an understandable label with an ambiguous glyph just to save space.

## Dependency rules

Before adding a package, check whether the repository already contains a usable icon source.

Avoid installing multiple overlapping libraries unless the design system explicitly assigns them different roles.

If adding a new library, state why the existing one was insufficient and whether the new library is becoming a supported project dependency or is only an isolated asset source.

## Completion report

When icon work materially changes a UI, summarize with this compact form:

```text
ICON_FAMILY: <primary family>
ICON_CHANGES: <what changed>
FALLBACKS: <none or list>
NEW_DEPENDENCY: <none or package + reason>
CUSTOM_SVG: <none or reason>
A11Y: <label / decorative handling>
MOTION: <none or purpose + reduced-motion behavior>
CHECK: <visual consistency / build / relevant test>
```

Keep the report short. The value is traceability, not paperwork.

## Codex handoff snippet

Use this in a task packet when icon quality matters:

```text
ICON_POLICY:
- inspect the existing icon system before adding assets
- follow ICON_SOURCES.md and docs/icon-librarian.md
- preserve one primary family per screen
- search existing approved libraries before drawing custom SVG
- avoid a new dependency for a single icon unless justified
- normalize fallback icons optically, not only numerically
- keep icon-only controls accessible
- use animation only for meaningful state/interaction feedback
- respect reduced-motion preferences
- verify current license/usage terms before production adoption
```
