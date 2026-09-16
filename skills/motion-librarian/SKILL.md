---
name: motion-librarian
description: Reuse, select, integrate, and review UI motion patterns and animation tooling with interaction meaning, performance, and reduced-motion constraints. Use when adding, replacing, auditing, or troubleshooting interface animation and transitions.
metadata:
  short-description: Reuse-first UI motion and animation integration
---

# Motion Librarian

Treat motion as interaction information, not garnish. Reuse the product's existing motion language and runtime before introducing new animation patterns or dependencies.

## Establish the local motion language first

Inspect the target project for:

- existing animation libraries, CSS transitions, Web Animations API usage, or framework-native motion tools;
- duration, easing, delay, spring, and stagger tokens;
- enter/exit, expand/collapse, navigation, loading, success, error, drag, and selection patterns;
- `prefers-reduced-motion` handling and any application-level motion setting;
- nearby components with similar state transitions;
- performance-sensitive surfaces such as long lists, canvas, 3D, or low-powered/mobile targets.

Local motion conventions outrank generic animation preferences.

## Motion decision loop

1. **Name the state change.** Identify what changed in the interface and what the user needs to understand.
2. **Decide whether motion helps.** Use motion when it clarifies continuity, hierarchy, causality, progress, feedback, or spatial change. Skip it when a static state change communicates equally well.
3. **Reuse an existing pattern.** Match established durations, easing, springs, and transition structure before inventing a new signature.
4. **Reuse the existing runtime.** Prefer CSS or the project's installed motion library before adding another animation dependency.
5. **Animate cheap properties when practical.** Prefer transforms and opacity for ordinary transitions; avoid unnecessary layout-thrashing or continuously expensive effects.
6. **Define reduced motion.** Preserve the information carried by animation while shortening, simplifying, or removing nonessential movement according to the project's strategy.
7. **Avoid competing motion.** Do not make several unrelated elements demand attention simultaneously without a clear hierarchy.
8. **Verify at real interaction speed.** Check interruption, repeated triggering, rapid navigation, mount/unmount, loading completion, and responsive behavior relevant to the change.

## Dependency discipline

Before adding a motion package, determine whether:

- CSS transitions/animations already solve the job;
- an installed framework or animation library already exposes the needed primitive;
- adding a second motion runtime creates duplicate concepts or bundle cost;
- the package fits the rendering model and lifecycle of the application;
- the animation can be interrupted or reversed safely where interaction requires it.

Do not add a motion library solely to animate one icon or one simple fade when the current stack is adequate.

## Reduced-motion contract

`prefers-reduced-motion` is not an instruction to remove state feedback. Preserve essential information with shorter transitions, opacity changes, instant state swaps, or another low-motion cue as appropriate. Avoid large spatial movement, parallax, continuous decorative motion, or vestibularly aggressive effects when reduced motion is requested.

## Performance and correctness

Motion must not block input, trap focus, leave invisible interactive elements active, or cause stale overlay state after interrupted transitions. Be cautious with animated height/width, filters, shadows, large blurs, and many simultaneous elements on performance-sensitive surfaces.

## Output expectations

When implementing or reviewing motion work, report compactly:

- state change being communicated;
- existing motion language/runtime discovered;
- pattern reused or added;
- dependency added or avoided;
- reduced-motion behavior;
- performance or interruption considerations;
- interaction verification performed.

Do not claim that animation improves comprehension or feels coherent unless it was reviewed in motion or equivalent supplied evidence.