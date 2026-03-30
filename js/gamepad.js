export function updateGamepadInput() {
    const gamepads = navigator.getGamepads();
    let gp = null;
    for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i] && gamepads[i].connected) {
            gp = gamepads[i];
            break;
        }
    }
    
    if (!gp) return null;
    return gp;
}
