import { platforms, lastPlatX, lastPlatY, setLastPlatX, setLastPlatY, coins, enemies, powerups } from './state.js';
import { Platform } from './entities/Platform.js';
import { Chimney } from './entities/Chimney.js';
import { Coin } from './entities/Coin.js';
import { Enemy } from './entities/Enemy.js';
import { PowerUp } from './entities/PowerUp.js';

export function generateWorld(startX, width) {
    // 1. Ground segment
    const groundPlatform = new Platform(startX, 550, width, 50);
    platforms.push(groundPlatform);
    // Sparse ground coins (was every 60px @ 80% — too dense)
    for (let i = 0; i < width; i += 200) {
        if (Math.random() < 0.35) {
            coins.push(new Coin(startX + i + 100, 550 - 30));
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

        // At most one coin per platform, not guaranteed
        if (Math.random() < 0.3) {
            coins.push(new Coin(currentX + platWidth / 2, platY - 30));
        }

        // ~75% of floating platforms get an enemy (was ~40% via > 0.6)
        if (Math.random() < 0.75) {
            const patrolRange = Math.max(10, platWidth - 50);
            enemies.push(new Enemy(currentX + 10, platY - 40, patrolRange));
        }

        // Rare stone powerup
        if (Math.random() < 0.15) {
            powerups.push(new PowerUp(currentX + platWidth / 2, platY - 36));
        }

        setLastPlatY(platY);
        setLastPlatX(currentX + platWidth);

        // Next platform gap
        currentX += platWidth + 60 + Math.random() * 70;
    }
}
