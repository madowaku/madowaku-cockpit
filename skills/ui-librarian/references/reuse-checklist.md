# UI Reuse and Integration Checklist

Use this as a final pass for UI changes that span asset systems.

## Local-system discovery

- Existing design-system or component packages were identified.
- Nearby screens and components were inspected for precedent.
- Existing icon, font, and motion packages were checked before adding alternatives.
- Relevant tokens and conventions were reused when available.

## Reinvention gate

- No local asset already solves the same semantic job adequately.
- A new dependency has a clear benefit beyond a single marginal asset.
- Bespoke UI was not created merely because discovery was skipped.
- Custom visual assets have a documented reason when established libraries were insufficient.

## Coherence

- Visual families do not clash accidentally.
- Spacing, density, typography hierarchy, icon weight, radius, and state treatment fit nearby UI.
- Motion, when present, reinforces the same interaction model as the rest of the product.
- Responsive behavior matches existing layout conventions.

## Accessibility

- Interactive controls retain semantic roles and keyboard operation.
- Focus states remain visible and predictable.
- Icon-only controls have accessible names.
- Color or icon shape is not the only cue for critical state where another cue is needed.
- Motion respects the product's reduced-motion strategy.
- Typography remains legible at supported sizes and zoom levels.

## Dependency and delivery cost

- Existing packages were preferred where adequate.
- New dependencies were checked for framework fit and licensing.
- Loading or bundle cost is proportionate to the value introduced.
- Font or motion additions do not create avoidable layout or runtime regressions.

## Verification

- Relevant states were checked in rendered context.
- At least the default, interactive, and disabled/error states affected by the change were reviewed when applicable.
- Narrow and wide layouts were checked when responsive behavior changed.
- Light/dark or theme variants were checked when the project supports them and the change is theme-sensitive.

Do not mark visual coherence as verified if only source code was inspected.