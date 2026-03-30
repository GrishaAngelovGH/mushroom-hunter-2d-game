import { keys } from './input.js';
import { gameActive, vibrationsEnabled } from './state.js';
import { toggleLog } from './ui.js';

let gamepadButtons = {};

export function vibrate(duration = 200, strong = 0.5, weak = 0.5, force = false) {
    if (!vibrationsEnabled && !force) return;
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

    // 4. One-off Actions: Helper to detect "New" presses
    const checkPress = (index, callback) => {
        const btn = gp.buttons[index];
        if (!btn) return;
        const isPressed = btn.pressed;
        if (isPressed && !gamepadButtons[index]) {
            callback();
        }
        gamepadButtons[index] = isPressed;
    };

    // Buy Stones: 'Triangle' (Button 3)
    checkPress(3, () => {
        if (gameActive) {
            window.dispatchEvent(new KeyboardEvent('keydown', { 'key': 'b' }));
        } else {
            document.getElementById('restart-btn')?.click();
        }
    });

    // Throw Stone: 'Square' (Button 2)
    checkPress(2, () => {
        if (gameActive) {
            window.dispatchEvent(new KeyboardEvent('keydown', { 'key': 'z' }));
        }
    });

    // Jump / Confirm: 'Cross' (Button 0)
    checkPress(0, () => {
        if (!gameActive) {
            document.getElementById('restart-btn')?.click();
        }
    });

    // Options: 'Options' (Button 9) - Toggle Fullscreen
    checkPress(9, () => {
        if (gameActive) {
            window.dispatchEvent(new KeyboardEvent('keydown', { 'key': 'f' }));
        } else {
            document.getElementById('restart-btn')?.click();
        }
    });

    // Share: 'Share' (Button 8) - Toggle Log
    checkPress(8, () => {
        if (gameActive) {
            window.dispatchEvent(new KeyboardEvent('keydown', { 'key': 'p' }));
        } else {
            document.getElementById('restart-btn')?.click();
        }
    });

    // L1: 'L1' (Button 4) - Toggle Rules
    checkPress(4, () => {
        window.dispatchEvent(new KeyboardEvent('keydown', { 'key': 'r' }));
    });

    return gp;
}
