import { CANVAS_WIDTH, CANVAS_HEIGHT, JUMP_FORCE } from './config.js';
import {
    gameActive, setGameActive, platforms, coins, enemies, powerups, resetState,
    lastGeneratedX, setLastGeneratedX, scrollOffset, setScrollOffset,
    updatePlatforms, updateCoins, updateEnemies, updatePowerups, player, chatBubble, setChatBubble,
    score, highScore, coinsCount, stoneAmmo, addCoins, addScore, enemiesStompedCount,
    stones, updateStones, consumeStoneAmmo, incrementTotalStonesThrown, incrementTotalStomps,
    STONE_COST, STONES_PER_BUY, deductCoins, addStoneAmmo,
    currentNotification, notificationQueue,
    totalStomps, totalCoinsAllTime, totalStonesThrown
} from './state.js';
import { Stone } from './entities/Stone.js';
import {
    toggleLog, addLog, clearLog, drawEliteProgressBar, refreshControlHints,
    syncSettingsUI, showSettings, hideSettings, toggleVibration, drawNotifications,
    drawAchievementBars, toggleDynamicUI
} from './ui.js';
import { generateWorld } from './world.js';
import { drawBackground } from './background.js';
import { sounds, toggleMusic, setMusicVolume } from './audio.js';

import { updateGamepadInput, vibrate } from './gamepad.js';

// Gamepad connection handling
window.addEventListener("gamepadconnected", refreshControlHints);
window.addEventListener("gamepaddisconnected", refreshControlHints);
setInterval(refreshControlHints, 1000);
setTimeout(refreshControlHints, 200);

['mousedown', 'keydown', 'touchstart'].forEach(evt => {
    window.addEventListener(evt, () => {
        refreshControlHints();
    }, { once: false });
});

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
    if (win) {
        sounds.win();
        addLog(`Victory! Final Score: ${score}`, 'win');
        vibrate(400, 0.8, 0.2, true);
    } else {
        sounds.gameOver();
        addLog(`Game Over. Final Score: ${score}`, 'info');
        vibrate(400, 0.8, 0.2, true);
    }
}

function initLevel() {
    resetState();
    clearLog();
    // Seed initial level
    generateWorld(0, 2000);
    setLastGeneratedX(2000);
    setChatBubble("Let's go!", 180);
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

// Settings UI Events
document.getElementById('btn-settings-gear').addEventListener('click', showSettings);
document.getElementById('close-settings').addEventListener('click', hideSettings);
document.getElementById('back-to-game').addEventListener('click', hideSettings);
document.getElementById('music-icon').addEventListener('click', toggleMusic);
document.getElementById('vibration-toggle').addEventListener('click', toggleVibration);
document.getElementById('dynamic-ui-toggle').addEventListener('click', toggleDynamicUI);
document.getElementById('music-volume').addEventListener('input', (e) => setMusicVolume(e.target.value));

// UI Toggles
window.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
        if (!gameActive) { // Only reset if game is not active
            resetGame();
            addLog("Game reset via spacebar.", 'info');
            return; // Stop further processing for this key event
        }
    }

    // Original game input handling, only if game is active
    if (!gameActive) return;
    const key = e.key.toLowerCase();

    // Buy stones with B
    if (key === 'b') {
        if (coinsCount >= STONE_COST) {
            deductCoins(STONE_COST);
            addStoneAmmo(STONES_PER_BUY);
            sounds.powerup();
            addLog(`Bought ${STONES_PER_BUY} stones for ${STONE_COST} coins!`, 'powerup');
            setChatBubble(`-${STONE_COST} 🪙, +${STONES_PER_BUY} 🪨`, 120);
        } else {
            addLog(`Not enough coins! Need ${STONE_COST}.`, 'info');
            setChatBubble(`Need ${STONE_COST} 🪙!`, 60);
        }
    }

    // Throw stone with Z or X
    if ((key === 'z' || key === 'x') && stoneAmmo > 0) {
        consumeStoneAmmo();
        stones.push(new Stone(player.x + player.width / 2, player.y + player.height / 2, canvas.height, player.facing));
        sounds.throw();
        incrementTotalStonesThrown();
    }
});

function gameLoop() {
    updateGamepadInput();
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

        powerups.forEach(pu => {
            if (!pu.collected) {
                const dist = Math.sqrt(Math.pow(player.x + player.width / 2 - pu.x, 2) + Math.pow(player.y + player.height / 2 - pu.y, 2));
                if (dist < player.width / 2 + pu.radius) {
                    pu.collected = true;
                    addStoneAmmo(5);
                    sounds.powerup();
                    addLog("Power Up! +5 Stones collected!", 'powerup');
                }
            }
        });

        enemies.forEach(e => e.update());
        stones.forEach(s => s.update(scrollOffset, canvas.width));

        // Stone-enemy collisions
        stones.forEach(s => {
            if (!s.alive) return;
            enemies.forEach(e => {
                if (s.x > e.x && s.x < e.x + e.width && s.y > e.y && s.y < e.y + e.height && e.alive) {
                    s.alive = false;
                    const points = e.isElite ? 20 : 10;
                    addScore(points);
                    if (e.isElite) sounds.eliteHit();
                    else sounds.stomp();
                    incrementTotalStomps();
                    vibrate(e.isElite ? 200 : 120, e.isElite ? 0.8 : 0.5, 0.3);
                    addLog(e.isElite ? "🌟 Elite Stone Hit! +20 Points" : "Stone Hit! +10 Points", 'stone');
                    e.respawn();
                }
            });
        });

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
                incrementTotalStomps();
                vibrate(e.isElite ? 200 : 120, e.isElite ? 0.8 : 0.5, 0.3);
                addLog(e.isElite ? '🌟 Elite Stomped! +10 Points' : 'Stomped! +5 Points', 'stomp');
                e.respawn();
            } else {
                endGame(false);
            }
        });

        coins.forEach(c => {
            if (c.collected || !c.hitsPlayer(player)) return;
            c.collected = true;
            addScore(1);
            addCoins(1);
            sounds.coin();
            vibrate(50, 0.1, 0.6);
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
            updatePowerups(powerups.filter(pu => pu.x > scrollOffset - 800));
            updateStones(stones.filter(s => s.alive));
        }

        // 7. Draw Entities
        platforms.forEach(p => p.draw(ctx, scrollOffset));
        coins.forEach(c => c.draw(ctx, scrollOffset));
        powerups.forEach(pu => pu.draw(ctx, scrollOffset));
        enemies.forEach(e => e.draw(ctx, scrollOffset));
        stones.forEach(s => s.draw(ctx, scrollOffset));
        player.draw(ctx, scrollOffset);

        // 8. Draw UI Overlays (Canvas HUD)
        drawEliteProgressBar(ctx, enemiesStompedCount);
        drawAchievementBars(ctx, canvas, totalStomps, totalCoinsAllTime, totalStonesThrown);
        drawNotifications(ctx, canvas, currentNotification, notificationQueue);

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
syncSettingsUI();
gameLoop();
