import { Player } from './entities/Player.js';

export let gameActive = true;
export let platforms = [];
export let coins = [];
export let enemies = [];
export let powerups = [];
export let player = new Player();
export let chatBubble = { text: '', timer: 0 };

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
    player.reset();
    chatBubble.timer = 0;
}
