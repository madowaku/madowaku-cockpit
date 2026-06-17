# Madowaku Codex Cockpit v0.1

## Objective

Create a small, local-first personal workflow app for madowaku that reduces friction between ChatGPT brainstorming, Codex GPT-5.5 Spec / Plan / Review work, rtk-compressed verification commands, Gemma4 / Qwen3.5 summarization prep, and project-specific creative coding workflows.

This is not a general AI IDE. It is a warm, practical cockpit for managing madowaku's creative coding projects.

## Goal Kind

`specific`

## Product Spec

Madowaku Codex Cockpit v0.1 should help madowaku move from fuzzy creative intent to a reviewable Codex workflow packet without losing context between tools.

The app should support:

- Choosing or creating a project.
- Writing a rough goal in plain language.
- Generating a Codex `/goal-maker` prompt from that goal.
- Generating a `/plan` prompt from the same project context.
- Storing Spec, Plan, and Review notes.
- Pasting Codex results, verification logs, or model summaries.
- Compressing pasted results into a concise next action.
- Tracking a task through idea, planned, in progress, reviewed, and done.

The product tone should be warm, practical, and playful. It should feel like a local cockpit for one person's creative coding practice, not a SaaS dashboard, not a generic AI IDE, and not a command center for cloud automation.

## MVP Scope

The v0.1 MVP is a single local web app using Vite, React, and TypeScript with `localStorage` persistence.

Included:

- Project picker with a small project list stored locally.
- Task workspace for the selected project.
- Rough goal field.
- Status selector: idea, planned, in progress, reviewed, done.
- Notes sections for Spec, Plan, Review, pasted results/logs, and next action.
- Prompt generator for a Codex `/goal-maker` prompt.
- Prompt generator for a `/plan` prompt.
- Local-only save/load behavior using `localStorage`.
- Basic responsive layout that remains usable on desktop and narrow screens.

Excluded from v0.1:

- Cloud sync.
- Login, billing, accounts, or sharing.
- Direct Codex App Server integration.
- Direct filesystem modification.
- Shell command execution from the app.
- Automatic calls to ChatGPT, Codex, Gemma, Qwen, or any remote/local model.
- Multi-user collaboration.
- Plugin marketplace or generalized AI IDE features.

## UX Flow

1. Open the cockpit.
2. Choose an existing project or create a new local project card.
3. Write a rough goal for the current task.
4. Pick the task status.
5. Draft or paste Spec, Plan, Review, and result/log notes.
6. Click a prompt action to generate a copy-ready `/goal-maker` or `/plan` prompt.
7. Paste Codex or verification output into the results/logs area.
8. Use the compression field to write the next action in one tight paragraph.
9. Update the task status as it moves from idea to done.

The first screen should be the actual cockpit, not a landing page.

## Current Tranche

First implementation tranche: build the smallest lovable local cockpit shell that proves the workflow loop.

Enough for the first focused session:

- A Vite + React + TypeScript app scaffold exists.
- The primary cockpit screen supports one selected project and one active task.
- The app persists project/task state with `localStorage`.
- The UI includes fields for rough goal, status, Spec, Plan, Review, results/logs, and next action.
- The UI can generate copy-ready `/goal-maker` and `/plan` prompts from the entered context.
- Basic build verification passes.

Do not expand the tranche into model integration, filesystem access, command execution, auth, sync, or a general IDE surface.

## Non-Negotiable Constraints

- Local-first.
- No cloud sync.
- No login.
- No billing.
- No direct filesystem modification in v0.1.
- No Codex App Server integration in v0.1 unless a later Judge explicitly decides the integration is extremely low-risk.
- Prefer Vite + React + TypeScript.
- Use `localStorage` for v0.1 persistence.
- Keep scope small and lovable.
- Keep the UI playful but practical.
- Do not over-specify exact implementation details before coding starts.

## Risks And Safety Constraints

- Scope creep: the app can easily become a general AI IDE. Keep v0.1 centered on prompt preparation, notes, pasted outputs, compression, and status tracking.
- Unsafe local automation: avoid filesystem writes, shell execution, model invocation, and hidden background actions in v0.1.
- Data loss: `localStorage` is convenient but fragile. Keep the data model simple and make save behavior visible.
- Prompt bloat: generated prompts should be useful and copy-ready, but not so long that they become noisy.
- Ambiguous "compress" behavior: v0.1 should treat compression as a human-authored next-action field or deterministic prompt template, not automatic model summarization.
- UI over-polish: playful does not mean decorative clutter. The cockpit should remain fast to scan and easy to use repeatedly.

## Verification Strategy

For the first implementation tranche:

- Run dependency install only if needed and approved by the owner.
- Run the project build command, expected to be `npm run build` once scaffolded.
- Run lint/typecheck/test commands if the scaffold defines them.
- Manually verify local persistence by refreshing the app and confirming saved project/task fields remain.
- Manually verify generated `/goal-maker` and `/plan` prompts include project, rough goal, status, notes, pasted results/logs, and next action.
- Check responsive layout at desktop and narrow mobile widths if a browser/dev server is used.

## Canonical Board

Machine truth lives at:

`docs/goals/madowaku-codex-cockpit-v0-1/state.yaml`

If this charter and `state.yaml` disagree, `state.yaml` wins for task status, active task, receipts, verification freshness, and completion truth.

## Run Command

```text
/goal Follow docs/goals/madowaku-codex-cockpit-v0-1/goal.md through the first safe verified implementation slice. Do not stop after planning unless blocked.
```

## PM Loop

On every `/goal` continuation:

1. Read this charter.
2. Read `state.yaml`.
3. Work only on the active board task.
4. Assign Scout, Judge, Worker, or PM according to the task.
5. Write a compact task receipt.
6. Update the board.
7. If Judge selected a safe Worker task with `allowed_files`, `verify`, and `stop_if`, activate it and continue unless blocked.
8. Finish only with a Judge/PM audit receipt that maps receipts and verification back to the original user outcome.
