export let gameActive = true;
export let platforms = [];
export let coins = [];
export let enemies = [];
export let powerups = [];

export let lastPlatX = 100;
export let lastPlatY = 550;

export function setGameActive(value) {
    gameActive = value;
}

export function setLastPlatX(val) { lastPlatX = val; }
export function setLastPlatY(val) { lastPlatY = val; }

export function resetState() {
    platforms.length = 0;
    coins.length = 0;
    enemies.length = 0;
    powerups.length = 0;
    lastPlatX = 100;
    lastPlatY = 550;
}
