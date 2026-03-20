import { platforms, lastPlatX, lastPlatY, setLastPlatX, setLastPlatY, coins, addCoins } from './state.js';
import { Platform } from './entities/Platform.js';
import { Chimney } from './entities/Chimney.js';
import { Coin } from './entities/Coin.js'; // Import Coin class

export function generateWorld(startX, width) {
    // 1. Ground segment
    const groundPlatform = new Platform(startX, 550, width, 50);
    platforms.push(groundPlatform);
    // Add coins to the ground segment
    for (let i = 0; i < width; i += 60) { // Spawn coins every 60px on the ground
        if (Math.random() > 0.2) { // 80% chance of a coin
            coins.push(new Coin(startX + i + 30, 550 - 30)); // Position coin above ground
        }
    }

    // 2. Periodic chimneys on the ground
    if (Math.random() > 0.4) {
        const chimneyX = startX + 200 + Math.random() * (width - 400);
        const chimneyH = 40 + Math.random() * 60;
        platforms.push(new Chimney(chimneyX, 550 - chimneyH, 70, chimneyH));
    }

    // 3. Floating platforms
    let currentX = lastPlatX + 60 + Math.random() * 60; // Max gap ~120
    
    while (currentX < startX + width - 150) {
        const platWidth = 100 + Math.random() * 120;

        // Reachable height (125 delta + centering bias)
        let centeringBias = (350 - lastPlatY) * 0.25;
        let deltaY = (Math.random() - 0.5) * 125 + centeringBias;
        let platY = lastPlatY + deltaY;

        // Safety clamps
        if (platY < 180) platY = 180;
        if (platY > 450) platY = 450;

        const plat = new Platform(currentX, platY, platWidth, 20);
        platforms.push(plat);

        // Spawn coins on floating platforms as well
        for (let i = 0; i < platWidth; i += 60) {
            if (Math.random() > 0.3) { // 70% chance of a coin on floating platforms
                coins.push(new Coin(currentX + i + platWidth / 2 - 20, platY - 30)); // Position coin above platform
            }
        }

        setLastPlatY(platY);
        setLastPlatX(currentX + platWidth);

        // Next platform gap
        currentX += platWidth + 60 + Math.random() * 70;
    }
}
