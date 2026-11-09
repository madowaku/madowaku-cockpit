---
name: feature-problem-intelligence
description: Find the design questions, system interactions, edge cases, and verification evidence needed to turn a game feature into an intentional player experience. Use with doors, windows, puzzles, enemies, level transitions, and other mechanics.
metadata:
  short-description: Gameplay intent to evidence-aware verification
---

# MGSF Feature Problem Intelligence M0.1

Inspired by Liz England's The Door Problem (2014): https://lizengland.com/blog/the-door-problem/

## Principle

A feature that animates or compiles is not necessarily a feature that works for the player. Work through intent, affordance, interaction, state, system interactions, edge cases, and actual player observation. Generate the *important* questions, not every imaginable question.

## Workflow

1. Write the player_intent as a concrete desired moment, not a technical specification.
2. Select only applicable scopes: door, npc, coop, streaming, or window. List deferred scopes explicitly.
3. Run the local generator with --format=markdown for a prioritized question matrix.
4. Address P0 (progression/safety/soft-lock or severe comprehension issue) first, P1 (core feel/feedback) second, P2 (polish) last.
5. Run --format=creole to create a review-first Codex handoff. Inspect the actual game project before touching paths.
6. Collect deterministic replays/logs for state and collision tests. For feel, clarity and fun, collect human or Game Test Player observations with explicit provenance.
7. Record evidence in the input JSON checks map, regenerate the audit, and store a reviewed short trace in Shared Brain.

From the cockpit repository root:

    node skills/feature-problem-intelligence/scripts/audit.mjs skills/feature-problem-intelligence/examples/sf-door.json --format=markdown
    node skills/feature-problem-intelligence/scripts/audit.mjs skills/feature-problem-intelligence/examples/sf-door.json --format=creole
    npm test

No API calls, new packages, network access or file mutation. The generator prints to stdout.

## Role routing (integration targets, not connected services)

- Creative Intent Engine: intended player moment and what success means.
- Codex: minimal implementation from an AI Creole packet.
- Godot MCP: runtime/scene validation once reviewed and connected in the game repo.
- Game Test Player: reproduction logs and actual comprehension/behavior.
- Sound Identity Lab / animation systems: feedback only if it serves player experience.
- Living Moment Intelligence: player moment analysis.
- Shared Brain: human-reviewed decisions, trace, replay and GOLDEN case.

## Safety and completion gate

Keep the cockpit MCP bridge read-only. Never add write, shell, auth, deploy or secret reading. No runtime test has run merely because the audit was generated. An evidence note does not automatically establish correctness; review the original replay or observation. Scope creep into multiplayer and streaming requires a new decision. A CANDIDATE result means review evidence and run the game, not approval to ship.

See references/acceptance.md for the SF door first-playable gate.
