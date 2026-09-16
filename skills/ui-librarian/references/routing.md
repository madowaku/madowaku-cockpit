# UI Librarian Routing Guide

Use this guide when a task touches more than one UI asset system or when the correct specialist is unclear.

## Route to icon-librarian

Use `$icon-librarian` when the work primarily concerns:

- selecting or replacing icons;
- icon family consistency;
- icon-only controls and accessible names;
- icon sizing, stroke/fill normalization, or alignment;
- animated icons;
- deciding whether a custom SVG is justified.

## Route to font-librarian

Use `$font-librarian` when the work primarily concerns:

- choosing or replacing a typeface;
- local or web-font reuse;
- fallback stacks and glyph coverage;
- variable-font axes;
- font loading and layout-shift tradeoffs;
- licensing or redistribution constraints;
- integrating a typeface into existing type tokens.

## Route to component-librarian

Use `$component-librarian` when the work primarily concerns:

- finding an existing component or primitive;
- deciding between local, design-system, or third-party components;
- avoiding duplicate implementations;
- choosing a headless vs styled component;
- preserving semantics, keyboard behavior, focus management, and responsive states;
- deciding whether a custom component is actually necessary.

## Route to motion-librarian

Use `$motion-librarian` when the work primarily concerns:

- transitions and state-change animation;
- enter/exit behavior;
- loading, success, error, drag, expand/collapse, or navigation feedback;
- choosing an animation runtime or dependency;
- duration/easing consistency;
- `prefers-reduced-motion` behavior;
- deciding whether motion improves comprehension or only adds decoration.

## Use multiple specialists only when needed

A task can span domains. Examples:

- New icon button: component + icon, and motion only if animated feedback matters.
- New navigation rail: component + icon + typography, possibly motion for collapse/expand.
- Empty-state card: component + typography + icon/illustration. Motion is optional, not automatic.
- Design-system cleanup: parent `$ui-librarian` first, then each specialist only for the affected systems.

Do not invoke every specialist by default. The routing goal is minimum sufficient context.

## Future specialist slots

The architecture intentionally leaves room for additional librarians such as color, illustration, data-visualization, sound, or 3D assets. Add one only when a recurring class of decisions has enough distinct rules to justify a separate skill.