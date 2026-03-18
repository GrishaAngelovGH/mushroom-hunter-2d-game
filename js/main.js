import { CANVAS_WIDTH, CANVAS_HEIGHT } from './config.js';
import { gameActive, setGameActive, platforms, resetState, lastGeneratedX, setLastGeneratedX } from './state.js';
import { keys } from './input.js';
import { toggleLog } from './ui.js';
import { generateWorld } from './world.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

function initLevel() {
    resetState();
    // Seed initial level (first 2000px)
    generateWorld(0, 2000);
    setLastGeneratedX(2000);
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
        
        // Update and Draw Entities
        // Draw Platforms (scrollOffset is 0 for now)
        platforms.forEach(p => p.draw(ctx, 0));

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
