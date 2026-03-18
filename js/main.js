import { CANVAS_WIDTH, CANVAS_HEIGHT } from './config.js';
import { 
    gameActive, setGameActive, platforms, resetState, 
    lastGeneratedX, setLastGeneratedX, scrollOffset, setScrollOffset,
    updatePlatforms
} from './state.js';
import { keys } from './input.js';
import { toggleLog } from './ui.js';
import { generateWorld } from './world.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

function initLevel() {
    resetState();
    // Seed initial level
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
        
        // 1. Simulate movement (temporary until player is added)
        setScrollOffset(scrollOffset + 2);

        // 2. Infinite generation: generate world ahead of view
        if (lastGeneratedX < scrollOffset + CANVAS_WIDTH + 1000) {
            generateWorld(lastGeneratedX, 2000);
            setLastGeneratedX(lastGeneratedX + 2000);
        }

        // 3. Entity Pruning: remove off-screen entities for performance
        if (platforms.length > 50) {
            updatePlatforms(platforms.filter(p => p.x + p.width > scrollOffset - 800));
        }

        // 4. Draw Entities
        platforms.forEach(p => p.draw(ctx, scrollOffset));

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
