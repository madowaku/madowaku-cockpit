'use strict';

// Tiny deterministic canary game: zero network access and no shared Godot assets.
// Follow LittleJS's global-script API rather than ES module imports.
debugWatermark = false;
let labPlayer = vec2(2, 2);
let labTarget = vec2(6, 2);
let labScore = 0;
let labTicks = 0;

function gameInit() {
    cameraPos = vec2(4, 2);
}
function gameUpdate() {
    const direction = keyDirection();
    if (direction.x || direction.y) {
        labPlayer = labPlayer.add(direction.scale(0.10));
    }
    if (labPlayer.distance(labTarget) < 0.55) {
        labScore++;
        labTarget = vec2(6, 5);
    }
    labTicks++;
}
function gameUpdatePost() {}
function gameRender() {
    drawRect(vec2(4, 2), vec2(16, 12), new Color(0.07, 0.11, 0.17));
    drawRect(labTarget, vec2(0.8), new Color(0.20, 0.9, 0.45));
    drawRect(labPlayer, vec2(0.8), new Color(1, 0.7, 0.2));
}
function gameRenderPost() {
    drawTextScreen('MGSF LAB  |  SCORE ' + labScore, vec2(200, 40), 28, new Color(1, 1, 1));
}

// Explicit, read-only test seam. The browser test still performs real keyboard input.
Object.defineProperty(window, '__littlejsLab', {
    value: Object.freeze({
        snapshot: () => Object.freeze({
            x: labPlayer.x, y: labPlayer.y, score: labScore, ticks: labTicks
        })
    })
});
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost);
