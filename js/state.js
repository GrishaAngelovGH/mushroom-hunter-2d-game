import { Player } from './entities/Player.js';
import { addLog } from './ui.js';
import { PALETTES, ENV_SHIFT_MILESTONE } from './config.js';
import { sounds } from './audio.js';

export let gameActive = true;
export let vibrationsEnabled = localStorage.getItem('mushroomVibrationsEnabled') !== 'false';
export let currentPalette = PALETTES.EMERALD;

export function setCurrentPalette(palette) {
    currentPalette = palette;
}

function checkEnvironmentShift() {
    const paletteKeys = Object.keys(PALETTES);
    const index = Math.floor(coinsCount / ENV_SHIFT_MILESTONE) % paletteKeys.length;
    const newPalette = PALETTES[paletteKeys[index]];

    if (currentPalette !== newPalette) {
        setCurrentPalette(newPalette);
        sounds.shift();
        addLog(`Environment shift: ${paletteKeys[index]} theme!`, 'win');
        setChatBubble("The world is changing...", 120);
    }
}
export let platforms = [];
export let coins = [];
export let enemies = [];
export let powerups = [];
export let stones = [];
export let totalStonesThrown = 0;
export const STONE_COST = 25;
export const STONES_PER_BUY = 10;
export let player = new Player();
export let chatBubble = { text: '', timer: 0 };

export let notificationQueue = [];
export let currentNotification = null;

export function setCurrentNotification(notif) {
    currentNotification = notif;
}

export function clearCurrentNotification() {
    currentNotification = null;
}

export function addNotification(title, reward) {
    notificationQueue.push({
        title,
        reward,
        timer: 180, // 3 seconds at 60fps
        alpha: 0,
        y: -100
    });
    sounds.powerup();
    addLog(`🌟 Achievement Milestone: ${title}! Reward: ${reward}`, 'win');
}

export let score = 0;
export let highScore = parseInt(localStorage.getItem('mushroomHighScore')) || 0;
export let coinsCount = 0;
export let stoneAmmo = 0;

export function consumeStoneAmmo() { stoneAmmo--; }
export function addStoneAmmo(amount) { stoneAmmo += amount; }
export function deductCoins(amount) { coinsCount -= amount; }

export function incrementTotalStonesThrown() {
    totalStonesThrown++;
    checkAchievements();
}

export function resetTotalStonesThrown() {
    totalStonesThrown = 0;
}

/** Regular stomps toward Elite Hunt (every 20th respawns as elite). */
export let enemiesStompedCount = 0;

export let totalStomps = 0;
export let totalCoinsAllTime = 0;
export let achievementsUnlocked = {};

export function checkAchievements() {
    // 1. Mushroom Hunter: Every 25 Stomps
    const stompMilestones = Math.floor(totalStomps / 25);
    if (stompMilestones > (achievementsUnlocked.stompMilestone || 0)) {
        achievementsUnlocked.stompMilestone = stompMilestones;
        addLog("🌟 Achievement: Mushroom Hunter! (+50 Coins)", "win");
        addNotification("Mushroom Hunter", "+50 Coins Reward!");
        giveReward(50);
    }

    // 2. Treasure Seeker: Every 200 Total Coins
    const coinMilestones = Math.floor(totalCoinsAllTime / 200);
    if (coinMilestones > (achievementsUnlocked.coinMilestone || 0)) {
        achievementsUnlocked.coinMilestone = coinMilestones;
        addLog("🌟 Achievement: Treasure Seeker! (+50 Coins)", "win");
        addNotification("Treasure Seeker", "+50 Coins Reward!");
        giveReward(50);
    }

    // 3. Stone Slinger: Every 50 Stones Thrown
    const stoneMilestones = Math.floor(totalStonesThrown / 50);
    if (stoneMilestones > (achievementsUnlocked.stoneMilestone || 0)) {
        achievementsUnlocked.stoneMilestone = stoneMilestones;
        addLog("🌟 Achievement: Stone Slinger! (+50 Coins)", "win");
        addNotification("Stone Slinger", "+50 Coins Reward!");
        giveReward(50);
    }
}

function vibrateLocal(duration = 200, strong = 0.5, weak = 0.5) {
    if (!vibrationsEnabled) return;
    const gamepad = navigator.getGamepads()[0];
    if (gamepad && gamepad.vibrationActuator) {
        gamepad.vibrationActuator.playEffect("dual-rumble", {
            startDelay: 0,
            duration: duration,
            weakMagnitude: weak,
            strongMagnitude: strong
        }).catch(() => { });
    }
}

export function giveReward(amount) {
    coinsCount += amount;
    incrementTotalCoinsAllTime(amount);
    checkEnvironmentShift();
    vibrateLocal(150, 0.4, 0.4);
}

export function registerRegularStompForEliteHunt() {
    enemiesStompedCount++;
    return enemiesStompedCount;
}

export let lastPlatX = 100;
export let lastPlatY = 550;
export let lastGeneratedX = 0;
export let scrollOffset = 0;

export function setGameActive(value) {
    gameActive = value;
}

export function setVibrationsEnabled(value) {
    vibrationsEnabled = value;
}

export function setLastPlatX(val) { lastPlatX = val; }
export function setLastPlatY(val) { lastPlatY = val; }
export function setLastGeneratedX(val) { lastGeneratedX = val; }
export function setScrollOffset(val) { scrollOffset = val; }

export function setChatBubble(text, timer) {
    chatBubble.text = text;
    chatBubble.timer = timer;
}

export function addScore(amount) {
    const oldScore = score;
    score += amount;

    if (score > 0 && Math.floor(score / 100) > Math.floor(oldScore / 100)) {
        setChatBubble("Yes, another 100 points reached!", 180);
        addLog(`Great work! ${Math.floor(score / 100) * 100} points!`, 'win');
    }

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('mushroomHighScore', highScore);
    }
}

export function addCoins(amount) {
    const previous = coinsCount;
    coinsCount += amount;

    // Update cumulative total coins
    incrementTotalCoinsAllTime(amount);

    // Trigger palette shift if milestone reached
    checkEnvironmentShift();

    // Stone purchase prompt
    const nextThreshold = Math.floor(coinsCount / STONE_COST) * STONE_COST;
    if (previous < nextThreshold && nextThreshold > 0) {
        setChatBubble(`Press B – buy ${STONES_PER_BUY} 🪨 for ${STONE_COST} 🪙!`, 210);
    }
}

export function updatePlatforms(newList) { platforms.length = 0; platforms.push(...newList); }
export function updateCoins(newList) { coins.length = 0; coins.push(...newList); }
export function updateEnemies(newList) { enemies.length = 0; enemies.push(...newList); }
export function updatePowerups(newList) { powerups.length = 0; powerups.push(...newList); }
export function updateStones(newList) { stones.length = 0; stones.push(...newList); }

export function incrementTotalStomps() {
    totalStomps++;
    localStorage.setItem('mushroomTotalStomps', totalStomps);
    checkAchievements();
}

export function incrementTotalCoinsAllTime(amount) {
    totalCoinsAllTime += amount;
    localStorage.setItem('mushroomTotalCoinsAllTime', totalCoinsAllTime);
    checkAchievements();
}


export function resetState() {
    platforms.length = 0;
    coins.length = 0;
    enemies.length = 0;
    powerups.length = 0;
    stones.length = 0;
    lastPlatX = 100;
    lastPlatY = 550;
    lastGeneratedX = 0;
    scrollOffset = 0;
    score = 0;
    coinsCount = 0;
    stoneAmmo = 0;
    totalStonesThrown = 0;
    totalStomps = 0;
    totalCoinsAllTime = 0;
    enemiesStompedCount = 0;
    // Clear and reset achievementsUnlocked
    Object.keys(achievementsUnlocked).forEach(key => delete achievementsUnlocked[key]);
    localStorage.removeItem('mushroomAchievementsUnlocked');
    localStorage.removeItem('mushroomTotalStomps');
    localStorage.removeItem('mushroomTotalCoinsAllTime');
    localStorage.removeItem('mushroomTotalStonesThrown');

    notificationQueue.length = 0;
    currentNotification = null;
    currentPalette = PALETTES.EMERALD;
    player.reset();
    chatBubble.timer = 0;
}
