# Icon Review Checklist

Use this when reviewing an icon change in context. Keep the review scoped to what changed.

## Meaning

- Does the glyph communicate the intended action, object, status, or destination without relying on guesswork?
- Is the metaphor culturally or product-contextually appropriate?
- Could the icon be confused with a nearby action?
- If the icon is ambiguous, should a text label or tooltip carry the meaning instead?

## Family consistency

- Is the icon from the product's established family when a suitable candidate exists?
- Does stroke/fill style match surrounding icons?
- Does corner language, cap style, and visual density feel consistent?
- Has a one-off foreign family been introduced for a negligible benefit?

## Optical fit

- Is the apparent visual size correct at the actual rendered dimensions?
- Is the icon centered optically, not only mathematically?
- Does its stroke weight look balanced beside neighboring icons and text?
- Are baseline, padding, and button hit area consistent with nearby controls?

## States

Check relevant states only:

- default;
- hover;
- focus-visible;
- active/selected;
- disabled;
- loading/progress;
- light/dark or contrasting surfaces.

The icon should remain legible without becoming the loudest element unless that emphasis is intentional.

## Accessibility

- Does an icon-only control have an accessible name through the project's normal mechanism?
- Is a decorative icon hidden from assistive technology when it would otherwise duplicate nearby text?
- Is critical state communicated by more than color alone where necessary?
- Does animation preserve meaning when reduced motion is requested?

## Motion gate

Animated icons should answer a specific interaction question. Confirm:

- what state transition the motion communicates;
- whether the animation begins and ends in useful static states;
- whether repeated or looping motion is actually necessary;
- whether reduced-motion handling exists;
- whether motion introduces a dependency or runtime cost disproportionate to its value.

## Dependency gate

Before adding an icon package:

- search the packages already installed;
- search local icon components/assets;
- compare the dependency cost against importing or creating a bounded local asset;
- verify framework compatibility and license suitability;
- avoid maintaining two nearly identical icon families without a clear reason.

## Custom SVG gate

If a custom SVG was created, verify:

- no established library or local asset adequately represented the concept;
- semantic filename/component naming;
- predictable `viewBox` and sizing;
- presentation colors are token/theme driven where appropriate;
- fill/stroke inheritance behaves correctly;
- accessibility is handled by the consuming control/component;
- the SVG has been viewed at its real target size.

## Evidence

Visual approval requires rendered evidence. Source code or an isolated SVG file can establish implementation facts, but not final visual balance in the product UI. If rendered inspection is unavailable, report that limitation explicitly.
