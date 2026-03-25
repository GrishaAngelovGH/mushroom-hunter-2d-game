import { CANVAS_WIDTH, CANVAS_HEIGHT, JUMP_FORCE } from './config.js';
import { 
    gameActive, setGameActive, platforms, coins, enemies, resetState, 
    lastGeneratedX, setLastGeneratedX, scrollOffset, setScrollOffset,
    updatePlatforms, updateCoins, updateEnemies, player, chatBubble, setChatBubble,
    score, highScore, coinsCount, stoneAmmo, addCoins, addScore
} from './state.js';
import { keys } from './input.js';
import { toggleLog, addLog } from './ui.js';
import { generateWorld } from './world.js';
import { drawBackground } from './background.js';
import { sounds } from './audio.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const coinsElement = document.getElementById('coins');
const stonesElement = document.getElementById('stones');

const gameOverScreen = document.getElementById('game-over');
const statusText = document.getElementById('status-text');
const finalScoreElement = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

export function endGame(win = false) {
    setGameActive(false);
    gameOverScreen.style.display = 'block';
    statusText.innerText = win ? "You Win!" : "Game Over!";
    finalScoreElement.innerText = score;
    addLog(win ? "Victory!" : "Game Over.", win ? 'win' : 'info');
}

function initLevel() {
    resetState();
    // Seed initial level
    generateWorld(0, 2000);
    setLastGeneratedX(2000);
    setChatBubble("Let's hunt!", 180);
    highScoreElement.innerText = highScore;
    addLog("Welcome to Mushroom Hunter!", 'info');
    // Audio context will be initialized by user interaction via event listeners in audio.js
}

function resetGame() {
    gameOverScreen.style.display = 'none';
    initLevel();
    addLog("New Game Started!", 'info');
    setGameActive(true);
}

restartBtn.addEventListener('click', resetGame);

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
        coinsElement.innerText = coinsCount;
        stonesElement.innerText = stoneAmmo;

        // 3. Update camera (Horizontal scrolling follows player)
        if (player.x > scrollOffset + canvas.width / 2) {
            setScrollOffset(player.x - canvas.width / 2);
        }

        // 4. Update Entities
        player.update();
        if (chatBubble.timer > 0) chatBubble.timer--;

        coins.forEach(c => {
            if (!c.collected) c.update();
        });

        enemies.forEach(e => e.update());

        enemies.forEach(e => {
            if (!e.alive) return;
            if (player.x >= e.x + e.width || player.x + player.width <= e.x ||
                player.y >= e.y + e.height || player.y + player.height <= e.y) {
                return;
            }
            const isAbove = player.y + player.height / 2 < e.y;
            const isFalling = player.vy >= 0;
            if (isAbove || (isFalling && player.y + player.height < e.y + e.height * 0.8)) {
                player.vy = JUMP_FORCE / 1.5;
                const points = e.isElite ? 10 : 5;
                addScore(points);
                if (e.isElite) sounds.eliteHit();
                else sounds.stomp();
                addLog(e.isElite ? '🌟 Elite Stomped! +10 Points' : 'Stomped! +5 Points', 'stomp');
                e.respawn();
            }
        });

        coins.forEach(c => {
            if (c.collected || !c.hitsPlayer(player)) return;
            c.collected = true;
            addScore(1);
            addCoins(1);
            sounds.coin();
            addLog(`+1 Coin! Total Coins: ${coinsCount}`, 'coin');
        });

        // 5. Infinite generation: generate world ahead of player
        if (player.x + canvas.width > lastGeneratedX) {
            generateWorld(lastGeneratedX, 2000);
            setLastGeneratedX(lastGeneratedX + 2000);
        }

        // 6. Entity Pruning: remove off-screen entities for performance
        if (platforms.length > 50) {
            updatePlatforms(platforms.filter(p => p.x + p.width > scrollOffset - 800));
            updateCoins(coins.filter(c => c.x > scrollOffset - 800));
            updateEnemies(enemies.filter(e => e.x + e.width > scrollOffset - 800));
        }

        // 7. Draw Entities
        platforms.forEach(p => p.draw(ctx, scrollOffset));
        coins.forEach(c => c.draw(ctx, scrollOffset));
        enemies.forEach(e => e.draw(ctx, scrollOffset));
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
