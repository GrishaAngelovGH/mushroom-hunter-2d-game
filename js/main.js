import { CANVAS_WIDTH, CANVAS_HEIGHT } from './config.js';
import {
    gameActive, setGameActive, platforms, resetState,
    lastGeneratedX, setLastGeneratedX, scrollOffset, setScrollOffset,
    updatePlatforms, player, chatBubble, setChatBubble,
    score, highScore
} from './state.js';
import { keys } from './input.js';
import { toggleLog } from './ui.js';
import { generateWorld } from './world.js';
import { drawBackground } from './background.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

function initLevel() {
    resetState();
    // Seed initial level
    generateWorld(0, 2000);
    setLastGeneratedX(2000);
    setChatBubble("Let's go!", 180);
    highScoreElement.innerText = highScore;
}

function resetGame() {
    initLevel();
    setGameActive(true);
}

// UI Toggles
window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'p') {
        toggleLog();
    }
});

function gameLoop() {
    if (!gameActive) {
        requestAnimationFrame(gameLoop);
        return;
    }

    try {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. Draw Background (Parallax)
        drawBackground(ctx, canvas, scrollOffset);

        // 2. Update HUD
        scoreElement.innerText = score;
        highScoreElement.innerText = highScore;

        // 3. Update camera (Horizontal scrolling follows player)
        if (player.x > scrollOffset + canvas.width / 2) {
            setScrollOffset(player.x - canvas.width / 2);
        }

        // 4. Update Entities
        player.update();
        if (chatBubble.timer > 0) chatBubble.timer--;

        // 5. Infinite generation: generate world ahead of player
        if (player.x + canvas.width > lastGeneratedX) {
            generateWorld(lastGeneratedX, 2000);
            setLastGeneratedX(lastGeneratedX + 2000);
        }

        // 6. Entity Pruning: remove off-screen entities for performance
        if (platforms.length > 50) {
            updatePlatforms(platforms.filter(p => p.x + p.width > scrollOffset - 800));
        }

        // 7. Draw Entities
        platforms.forEach(p => p.draw(ctx, scrollOffset));
        player.draw(ctx, scrollOffset);

        requestAnimationFrame(gameLoop);
    } catch (e) {
        console.error("Game loop error:", e);
        setGameActive(false);
        setTimeout(() => {
            setGameActive(true);
        }, 1000);
    }
}

// Start
initLevel();
gameLoop();
