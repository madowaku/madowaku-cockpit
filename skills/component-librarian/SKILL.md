---
name: component-librarian
description: Find, reuse, adapt, and review UI components and primitives before creating new ones. Use when implementing controls, overlays, navigation, forms, data display, layout primitives, or other reusable interface patterns.
metadata:
  short-description: Reuse-first UI component selection and integration
---

# Component Librarian

Treat component work as system composition before custom construction. Search the project and its established design system first, then adapt the smallest suitable primitive while preserving semantics and interaction behavior.

## Establish the local component system first

Inspect the target project for:

- local component directories and design-system packages;
- installed UI or headless-component libraries;
- primitives for buttons, inputs, dialogs, menus, popovers, tabs, lists, tables, cards, navigation, and layout;
- styling and token conventions;
- form and validation infrastructure;
- accessibility helpers and focus-management utilities;
- responsive and state-management patterns;
- nearby components solving similar jobs.

Local components and established design-system conventions outrank generic library preferences.

## Selection loop

1. **Name the interaction job.** Define what the user must be able to do and what states the component must represent.
2. **Search local primitives.** Reuse an existing component or compose existing primitives before introducing a new abstraction.
3. **Search established dependencies.** If the project already uses a component or headless library, prefer its compatible primitive when local components are insufficient.
4. **Choose semantic fit over visual resemblance.** A component that looks right but lacks correct keyboard, focus, or state behavior is not an adequate substitute.
5. **Adapt before duplicating.** Prefer a variant, composition, wrapper, or extension when it preserves a clear API and avoids parallel implementations.
6. **Add a new dependency only when justified.** Do not import a whole UI framework for one control if the existing stack can express it safely.
7. **Create a custom component only when the behavior or product language is genuinely specific.** Keep the API narrow and compatible with local patterns.
8. **Verify real states.** Check default, hover/focus, active/selected, disabled, loading, empty, error, overflow, and responsive states relevant to the component.

## Reuse hierarchy

Prefer, in order:

```text
existing local component
  -> composition of local primitives
    -> established design-system / installed library primitive
      -> small local adapter around an established primitive
        -> justified new dependency
          -> custom implementation
```

This is a decision order, not a prohibition. Skip levels when they cannot satisfy semantics or product requirements.

## Accessibility and interaction contract

Preserve native semantics where possible. Keyboard operation, focus order, focus trapping/restoration, labeling, disabled states, validation messages, escape/outside-click behavior, and touch target size must match the interaction pattern and local product conventions.

Do not rebuild complex primitives such as dialogs, comboboxes, menus, or tooltips from visual divs when an established accessible primitive already exists in the project.

## Dependency discipline

Before adding a UI package, determine whether:

- an installed library already exposes the needed primitive;
- a dependency duplicates existing capabilities;
- the framework/runtime integration fits the codebase;
- styling can be integrated without fighting the existing token system;
- the licensing and maintenance profile are acceptable for the project;
- the dependency cost is proportionate to the behavior gained.

## Output expectations

When implementing or reviewing component work, report compactly:

- interaction job;
- local components/primitives discovered;
- component or primitive reused/adapted/created;
- dependencies added or avoided;
- semantic and accessibility behavior preserved;
- states and responsive behavior verified.

Do not claim behavior is correct from static markup alone when keyboard, focus, overlay, drag, or asynchronous states materially affect the component.