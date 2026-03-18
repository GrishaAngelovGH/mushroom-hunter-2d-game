import { CANVAS_WIDTH, CANVAS_HEIGHT } from './config.js';
import { gameActive, setGameActive } from './state.js';
import { keys } from './input.js';
import { toggleLog } from './ui.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

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
        
        // Future updates and drawing will go here

        requestAnimationFrame(gameLoop);
    } catch (e) {
        console.error("Game loop error:", e);
        setGameActive(false);
        setTimeout(() => {
            setGameActive(true);
        }, 1000);
    }
}

gameLoop();
