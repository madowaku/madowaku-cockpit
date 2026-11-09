# M0.1: SF auto-door first-playable acceptance

## M0.1 included

One usable automatic SF door, clearly distinct decorative door, locked/unlocked state, safe obstruction response, and understandable feedback. Reuse existing NPC systems only if present.

## Deferred

Co-op state and level streaming. Do not create these systems without fresh project context and human review.

## Required checks

1. Human: a first-time player distinguishes usable, locked and decorative doors without instructions or color alone.
2. Automated: close -> opening -> open -> closing -> close, lock, cancel, repeated command and reset never leave an invalid state.
3. Automated: blocked closure does not clip, trap or soft-lock player/NPC.
4. Human: a first-time player describes tension/curiosity close to the intended moment. Record contrary feelings as learning signals.
5. Integration: a real Godot build/scene was actually run. The generator alone does not satisfy this criterion.

## Evidence artifacts in the GAME repo (after review)

- feature_problem/<feature_id>.input.json
- feature_problem/<feature_id>.audit.md
- feature_problem/<feature_id>.handoff.txt
- feature_problem/<feature_id>.trace.md

Only declare a playable success when the implementation, tests, evidence links, and human observations are reviewed. A regression replay becomes a GOLDEN case.
