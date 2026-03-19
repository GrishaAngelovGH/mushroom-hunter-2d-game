import { Player } from './entities/Player.js';
import { addLog } from './ui.js';

export let gameActive = true;
export let platforms = [];
export let coins = [];
export let enemies = [];
export let powerups = [];
export let player = new Player();
export let chatBubble = { text: '', timer: 0 };

export let score = 0;
export let highScore = parseInt(localStorage.getItem('mushroomHighScore')) || 0;
export let coinsCount = 0;
export let stoneAmmo = 0;

export let lastPlatX = 100;
export let lastPlatY = 550;
export let lastGeneratedX = 0;
export let scrollOffset = 0;

export function setGameActive(value) {
    gameActive = value;
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
        setChatBubble("Milestone reached!", 150);
        addLog(`Great work! ${Math.floor(score / 100) * 100} points!`, 'win');
    }

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('mushroomHighScore', highScore);
    }
}

export function addCoins(amount) {
    coinsCount += amount;
}

export function updatePlatforms(newList) { platforms.length = 0; platforms.push(...newList); }
export function updateCoins(newList) { coins.length = 0; coins.push(...newList); }
export function updateEnemies(newList) { enemies.length = 0; enemies.push(...newList); }
export function updatePowerups(newList) { powerups.length = 0; powerups.push(...newList); }

export function resetState() {
    platforms.length = 0;
    coins.length = 0;
    enemies.length = 0;
    powerups.length = 0;
    lastPlatX = 100;
    lastPlatY = 550;
    lastGeneratedX = 0;
    scrollOffset = 0;
    score = 0;
    coinsCount = 0;
    stoneAmmo = 0;
    player.reset();
    chatBubble.timer = 0;
}
