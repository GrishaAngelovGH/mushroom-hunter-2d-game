import { CANVAS_WIDTH, CANVAS_HEIGHT, JUMP_FORCE, STONE_COST, STONES_PER_BUY } from './config.js';
import {
    gameActive, setGameActive, platforms, coins, enemies, powerups, resetState,
    lastGeneratedX, setLastGeneratedX, scrollOffset, setScrollOffset,
    updatePlatforms, updateCoins, updateEnemies, updatePowerups, player, chatBubble, setChatBubble,
    score, highScore, coinsCount, stoneAmmo, addCoins, addScore, enemiesStompedCount,
    stones, updateStones, consumeStoneAmmo, incrementTotalStonesThrown, incrementTotalStomps,
    deductCoins, addStoneAmmo,
    currentNotification, notificationQueue,
    totalStomps, totalCoinsAllTime, totalStonesThrown,
    stompCombo, incrementStompCombo, stompEffects, addStompEffect,
    registerRegularStompForEliteHunt
} from './state.js';
import { Stone } from './entities/Stone.js';
import {
    toggleLog, addLog, clearLog, drawEliteProgressBar, refreshControlHints,
    syncSettingsUI, showSettings, hideSettings, toggleVibration, drawNotifications,
    drawAchievementBars, toggleDynamicUI, showRules, hideRules, toggleRules,
    checkFirstTime
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

// Rules UI Events
document.getElementById('close-rules').addEventListener('click', hideRules);
document.getElementById('rules-back-to-game').addEventListener('click', hideRules);

// UI Toggles
window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();

    if (key === 'p') {
        toggleLog();
    }

    if (key === 'r') {
        toggleRules();
    }

    if (key === 'f') {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

    if (e.key === ' ') {
        if (!gameActive) { // Only reset if game is not active
            resetGame();
            addLog("Game reset via spacebar.", 'info');
            return; // Stop further processing for this key event
        }
    }

    // Original game input handling, only if game is active
    if (!gameActive) return;

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
                    else {
                        sounds.stomp();
                        registerRegularStompForEliteHunt();
                    }
                    incrementTotalStomps();
                    vibrate(e.isElite ? 200 : 120, e.isElite ? 0.8 : 0.5, 0.3);
                    addLog(e.isElite ? "🌟 Elite Stone Hit! +20 Points" : "Stone Hit! +10 Points", 'stone');
                    e.alive = false;
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
                const combo = incrementStompCombo();
                
                // Multi-Stomp Effect
                if (combo > 1) {
                    addStompEffect(player.x + player.width / 2, player.y + player.height / 2, `x${combo} COMBO!`);
                    vibrate(150 + combo * 20, 0.4 + combo * 0.1, 0.4);
                }

                // Base points + Combo Bonus
                const basePoints = e.isElite ? 10 : 5;
                const bonus = (combo > 1) ? (combo === 2 ? 10 : 25) : 0;
                addScore(basePoints + bonus);

                if (e.isElite) sounds.eliteHit();
                else {
                    sounds.stomp();
                    registerRegularStompForEliteHunt();
                }
                incrementTotalStomps();
                vibrate(e.isElite ? 200 : 120, e.isElite ? 0.8 : 0.5, 0.3);
                
                const logLabel = e.isElite ? '🌟 Elite Stomped!' : 'Stomped!';
                const logBonus = bonus > 0 ? ` (+${bonus} Combo Bonus!)` : '';
                addLog(`${logLabel} +${basePoints + bonus} Points${logBonus}`, 'stomp');
                
                e.alive = false;
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
            updateEnemies(enemies.filter(e => e.alive && e.x + e.width > scrollOffset - 800));
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
        drawAchievementBars(ctx, canvas, totalStomps, totalCoinsAllTime, totalStonesThrown, enemiesStompedCount);
        drawNotifications(ctx, canvas, currentNotification, notificationQueue);

        // 9. Draw Special Effects (Combos)
        for (let i = stompEffects.length - 1; i >= 0; i--) {
            const effect = stompEffects[i];
            effect.life--;
            effect.radius += 3;
            
            if (effect.life <= 0) {
                stompEffects.splice(i, 1);
                continue;
            }

            const alpha = effect.life / effect.maxLife;
            const sx = effect.x - scrollOffset;
            const sy = effect.y;

            // Expanding Ring (Shockwave)
            ctx.save();
            ctx.beginPath();
            ctx.arc(sx, sy, effect.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.6})`;
            ctx.lineWidth = 4 * alpha;
            ctx.stroke();
            
            // Outer glow ring
            ctx.beginPath();
            ctx.arc(sx, sy, effect.radius + 10, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(241, 196, 15, ${alpha * 0.3})`;
            ctx.lineWidth = 2 * alpha;
            ctx.stroke();

            // Floating Combo Text
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#F1C40F';
            ctx.font = `bold ${16 + (1.0 - alpha) * 10}px "Segoe UI", Arial, sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText(effect.label, sx, sy - effect.radius - 10);
            ctx.restore();
        }

        requestAnimationFrame(gameLoop);
    } catch (e) {
        console.error("Game loop error:", e);
        setGameActive(false);
        // Show crash alert in log for better visibility
        addLog("Critical Engine Error — attempting hot restart...", 'info');
        setTimeout(() => {
            setGameActive(true);
        }, 1000);
    }
}

// Start
initLevel();
syncSettingsUI();
checkFirstTime();
gameLoop();
