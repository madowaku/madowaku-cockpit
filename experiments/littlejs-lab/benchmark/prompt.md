# MGSF-M1.3 identical-agent benchmark: Collect One

Implement the same small, fully playable LittleJS game for both agents. Do not
build an engine. Use LittleJS's existing global API and the verified engine file
at ../../.vendor/littlejs.min.js. Create a standalone index.html and game.js
in runs/<agent>/, where <agent> is supplied to you as codex or claude.

Requirements:
- Display a player marker and a collectable marker on a canvas.
- ArrowRight moves the player right using keyDirection().
- Start x at 2 and the collectable at x 6, y 2. Holding ArrowRight for about
  1.1 seconds must increase the score from zero to at least one.
- Expose window.__littlejsLab.snapshot() returning numeric x, y, score, ticks.
- Do not require a server, external CDN, external assets, npm, or network at runtime.
- Do not edit any file outside runs/<agent>/.
- Do not read, write, or modify Godot projects or cockpit MCP implementations.
- Keep game source readable, not minified.
- Report actual model identifier, invocation time, any available token and price
  metrics, and the commands used to run the game. Unknown metrics must be null.

Acceptance is automated by:
  LITTLEJS_LAB_CASE=<agent> npm run test:browser
  LITTLEJS_LAB_CASE=<agent> npm run gate

Never claim successful tests or human playability scores without evidence.
