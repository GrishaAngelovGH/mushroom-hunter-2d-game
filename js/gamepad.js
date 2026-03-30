import { keys } from './input.js';

export function updateGamepadInput() {
    const gamepads = navigator.getGamepads();
    let gp = null;
    for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i] && gamepads[i].connected) {
            gp = gamepads[i];
            break;
        }
    }

    if (!gp || !gp.axes || !gp.buttons) return null;

    // 1. Movement: Left Analog Stick (Axis 0)
    const axisThreshold = 0.2;
    const axisLeft = gp.axes[0] < -axisThreshold;
    const axisRight = gp.axes[0] > axisThreshold;

    // 2. Movement: D-Pad Support (Buttons 12-15)
    const dPadLeft = gp.buttons[14]?.pressed || false;
    const dPadRight = gp.buttons[15]?.pressed || false;
    const dPadUp = gp.buttons[12]?.pressed || false;

    // 3. Jump: 'Cross' (Button 0)
    const buttonJump = gp.buttons[0]?.pressed || false;

    // Map to shared keys object using standard Arrow keys to match Player.js
    keys['ArrowLeft'] = axisLeft || dPadLeft;
    keys['ArrowRight'] = axisRight || dPadRight;
    keys['ArrowUp'] = dPadUp || buttonJump;
    keys[' '] = buttonJump; // Space alias

    return gp;
}
