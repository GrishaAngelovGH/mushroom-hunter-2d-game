import { platforms, lastPlatX, lastPlatY, setLastPlatX, setLastPlatY } from './state.js';
import { Platform } from './entities/Platform.js';
import { Chimney } from './entities/Chimney.js';

export function generateWorld(startX, width) {
    // 1. Ground segment
    platforms.push(new Platform(startX, 550, width, 50));

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

        setLastPlatY(platY);
        setLastPlatX(currentX + platWidth);

        // Next platform gap
        currentX += platWidth + 60 + Math.random() * 70;
    }
}
