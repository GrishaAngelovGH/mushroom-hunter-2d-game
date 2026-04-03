import { musicEnabled, musicVolume, musicEngine, audioCtx } from './audio.js';
import {
    vibrationsEnabled, setVibrationsEnabled, dynamicUIEnabled, setDynamicUIEnabled,
    setCurrentPalette, currentPalette
} from './state.js';
import { PALETTES, ENV_SHIFT_MILESTONE } from './config.js';
import { vibrate } from './gamepad.js';

export function addLog(message, type = 'info') {
    const eventPanel = document.getElementById('event-panel');
    if (!eventPanel) return;

    const entry = document.createElement('div');
    entry.className = 'log-entry';

    const colors = {
        info: '#FFF',
        coin: '#F1C40F',
        stomp: '#FFF',
        win: '#2ECC71',
        powerup: '#FF8C00',
        stone: '#A0A0A0'
    };

    entry.style.color = colors[type] || '#FFF';
    const time = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    entry.innerHTML = `> [${time}] ${message}`;
    eventPanel.appendChild(entry);

    // Prune history to last 3 entries
    if (eventPanel.children.length > 3) {
        eventPanel.removeChild(eventPanel.firstChild);
    }
}

export function clearLog() {
    const eventPanel = document.getElementById('event-panel');
    if (eventPanel) eventPanel.innerHTML = '';
}

export function toggleLog() {
    const panel = document.getElementById('log-panel');
    const container = document.getElementById('game-container');
    const isHidden = panel.classList.toggle('hidden');
    container.classList.toggle('log-open', !isHidden);
}

export function showSettings() {
    const modal = document.getElementById('settings-modal');
    if (modal) modal.style.display = 'flex';
    syncSettingsUI();
}

export function hideSettings() {
    const modal = document.getElementById('settings-modal');
    if (modal) modal.style.display = 'none';
}

export function toggleSettings() {
    const modal = document.getElementById('settings-modal');
    if (modal && modal.style.display === 'flex') {
        hideSettings();
    } else {
        showSettings();
    }
}

export function showRules() {
    const modal = document.getElementById('rules-modal');
    if (modal) modal.style.display = 'flex';
}

export function hideRules() {
    const modal = document.getElementById('rules-modal');
    if (modal) modal.style.display = 'none';
}

export function toggleRules() {
    const modal = document.getElementById('rules-modal');
    if (modal && modal.style.display === 'flex') {
        hideRules();
    } else {
        showRules();
    }
}

export function checkFirstTime() {
    if (!localStorage.getItem('mushroomPlayedBefore')) {
        showRules();
        localStorage.setItem('mushroomPlayedBefore', 'true');
    }
}

export function toggleVibration() {
    const newVal = !vibrationsEnabled;
    setVibrationsEnabled(newVal);
    localStorage.setItem('mushroomVibrationsEnabled', newVal);
    syncSettingsUI();
    if (newVal) vibrate(150, 0.2, 0.5, true); // Confirmation buzz
    addLog(newVal ? "Haptics Enabled" : "Haptics Disabled", 'info');
}

export function toggleDynamicUI() {
    const newVal = !dynamicUIEnabled;
    setDynamicUIEnabled(newVal);
    localStorage.setItem('mushroomDynamicUIEnabled', newVal);

    if (!newVal) {
        // Reset to classic emerald when disabled
        setCurrentPalette(PALETTES.EMERALD);
        addLog("Dynamic UI Disabled (Emerald theme set)", 'info');
    } else {
        addLog("Dynamic UI Enabled", 'info');
    }

    syncSettingsUI();
}

export function syncSettingsUI() {
    // Music
    const musicIcon = document.getElementById('music-icon');
    const musicVol = document.getElementById('music-volume');
    if (musicIcon) {
        musicIcon.style.opacity = musicEnabled ? '1' : '0.4';
        musicIcon.style.filter = musicEnabled ? 'none' : 'grayscale(1)';
    }
    if (musicVol) {
        musicVol.value = musicVolume;
        const gain = musicVolume / 100;
        musicEngine.targetVolume = gain;
        // Push immediately to the gain node if music is already running
        if (musicEngine.nodes.masterGain) {
            musicEngine.nodes.masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
            musicEngine.nodes.masterGain.gain.setValueAtTime(gain, audioCtx.currentTime);
        }
    }

    // Haptics
    const vibBtn = document.getElementById('vibration-toggle');
    if (vibBtn) {
        vibBtn.textContent = vibrationsEnabled ? 'ENABLED' : 'DISABLED';
        vibBtn.style.opacity = vibrationsEnabled ? '1' : '0.5';
    }

    // Dynamic UI
    const dynBtn = document.getElementById('dynamic-ui-toggle');
    if (dynBtn) {
        dynBtn.textContent = dynamicUIEnabled ? 'ON' : 'OFF';
        dynBtn.style.opacity = dynamicUIEnabled ? '1' : '0.5';
    }
}

export function refreshControlHints() {
    const gamepads = navigator.getGamepads();
    let isActive = false;

    for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i] && gamepads[i].connected) {
            isActive = true;
            break;
        }
    }

    const jumpHint = document.getElementById('hint-jump');
    const buyHint = document.getElementById('hint-buy');
    const throwHint = document.getElementById('hint-throw');
    const fsHint = document.getElementById('hint-fs');
    const logHint = document.getElementById('hint-log');
    const rulesHint = document.getElementById('hint-rules');

    if (!buyHint) return;

    const gpIcons = {
        cross: `<svg viewBox="0 0 24 24"><path fill="white" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/></svg>`,
        triangle: `<svg viewBox="0 0 24 24"><path fill="white" d="M12,2L1,21H23L12,2M12,6L19.53,19H4.47L12,6Z"/></svg>`,
        square: `<svg viewBox="0 0 24 24"><path fill="white" d="M3,3V21H21V3H3M5,5H19V19H5V5Z"/></svg>`,
        circle: `<svg viewBox="0 0 24 24"><path fill="white" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4Z"/></svg>`
    };

    if (isActive) {
        if (jumpHint) {
            jumpHint.innerHTML = gpIcons.cross;
            jumpHint.className = 'key-hl gp-btn gp-cross';
        }
        if (buyHint) {
            buyHint.innerHTML = gpIcons.triangle;
            buyHint.className = 'key-hl gp-btn gp-triangle';
        }
        if (throwHint) {
            throwHint.innerHTML = gpIcons.square;
            throwHint.className = 'key-hl gp-btn gp-square';
        }
        if (fsHint) {
            fsHint.innerText = 'OPTIONS';
            fsHint.className = 'key-hl';
        }
        if (logHint) {
            logHint.innerText = 'SHARE';
            logHint.className = 'key-hl';
        }
        if (rulesHint) {
            rulesHint.innerText = 'L1';
            rulesHint.className = 'key-hl';
        }
    } else {
        if (jumpHint) {
            jumpHint.innerText = 'SPACE / ↑';
            jumpHint.className = 'key-hl';
        }
        if (buyHint) {
            buyHint.innerText = 'B';
            buyHint.className = 'key-hl';
        }
        if (throwHint) {
            throwHint.innerText = 'Z/X';
            throwHint.className = 'key-hl';
        }
        if (fsHint) {
            fsHint.innerText = 'F';
            fsHint.className = 'key-hl';
        }
        if (logHint) {
            logHint.innerText = 'P';
            logHint.className = 'key-hl';
        }
        if (rulesHint) {
            rulesHint.innerText = 'R';
            rulesHint.className = 'key-hl';
        }
    }
}

export function drawEliteProgressBar(ctx, stompsCount) {
    const margin = 20;
    const barWidth = 220;
    const barHeight = 10;
    const x = margin;
    const y = 582; // Closer to the bottom edge

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(x, y, barWidth, barHeight);

    // Progress Fill
    const progress = (stompsCount % 20) / 20;
    if (progress > 0) {
        const fillWidth = barWidth * progress;
        const gradient = ctx.createLinearGradient(x, y, x + barWidth, y);
        gradient.addColorStop(0, '#F1C40F');
        gradient.addColorStop(1, '#FFD700');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, fillWidth, barHeight);

        // Subtle glow
        ctx.strokeStyle = '#F1C40F66';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, fillWidth, barHeight);
    }

    // Text
    ctx.fillStyle = "#FFF";
    ctx.font = 'bold 12px "Segoe UI", Tahoma, Geneva, Verdana, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`ELITE HUNT [${stompsCount % 20}/20]`, x + 5, y - 6);
}

import { setCurrentNotification, clearCurrentNotification } from './state.js';

export function drawNotifications(ctx, canvas, currentNotification, notificationQueue) {
    let active = currentNotification;

    if (!active && notificationQueue.length > 0) {
        active = notificationQueue.shift();
        setCurrentNotification(active);
    }

    if (active) {
        active.timer--;

        // Slide down
        if (active.timer > 160) {
            active.y += (20 - active.y) * 0.1;
            active.alpha = Math.min(1, active.alpha + 0.1);
        }
        // Slide up
        else if (active.timer < 20) {
            active.y += (-120 - active.y) * 0.1;
            active.alpha = Math.max(0, active.alpha - 0.1);
        }

        ctx.save();
        ctx.globalAlpha = active.alpha;
        const w = 400;
        const h = 60;
        const x = (canvas.width - w) / 2;
        const y = active.y;

        // Shiny Badge Background
        const grad = ctx.createLinearGradient(x, y, x, y + h);
        grad.addColorStop(0, '#2C3E50');
        grad.addColorStop(1, '#000');
        ctx.fillStyle = grad;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#F1C40F';

        // Main Box
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = '#F1C40F';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, w, h);
        ctx.shadowBlur = 0; // Reset shadow for text

        // Text
        ctx.fillStyle = '#F1C40F';
        ctx.font = 'bold 16px "Segoe UI", Tahoma, Geneva, Verdana, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("⭐ " + active.title + " MILESTONE!", canvas.width / 2, y + 25);

        ctx.fillStyle = '#FFF';
        ctx.font = '14px "Segoe UI", Tahoma, Geneva, Verdana, sans-serif';
        ctx.fillText(active.reward, canvas.width / 2, y + 45);

        ctx.restore();

        if (active.timer <= 0) {
            clearCurrentNotification();
        }
    }
}

export function drawAchievementBars(ctx, canvas, totalStomps, totalCoinsAllTime, totalStonesThrown, enemiesStompedCount) {
    const barWidth = 150;
    const barHeight = 10;
    const startX = canvas.width - barWidth - 20;
    let currentY = canvas.height - 500;

    const drawSubBar = (label, current, total, color) => {
        const progress = (current % total) / total;
        const fillWidth = barWidth * progress;
        const isNear = progress > 0.9;
        const glowAlpha = isNear ? (0.5 + Math.sin(Date.now() / 150) * 0.3) : 0;

        // Bar Label
        ctx.fillStyle = currentPalette.uiColor;
        ctx.font = 'bold 11px "Segoe UI", Tahoma, Geneva, Verdana, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`${label} [${current % total}/${total}]`, startX - 5, currentY + 8);

        // Background bar
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(startX, currentY, barWidth, barHeight);

        // Fill bar
        if (progress > 0) {
            ctx.fillStyle = color;
            ctx.fillRect(startX, currentY, fillWidth, barHeight);

            // Milestones near-completion glow
            if (isNear) {
                ctx.save();
                ctx.shadowBlur = 10;
                ctx.shadowColor = color;
                ctx.strokeStyle = `rgba(255, 255, 255, ${glowAlpha})`;
                ctx.strokeRect(startX, currentY, fillWidth, barHeight);
                ctx.restore();
            }
        }

        // Border
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(startX, currentY, barWidth, barHeight);

        currentY -= 20; // Increased spacing by 5px
    };

    ctx.save();

    // New bar for Environment Shift
    if (dynamicUIEnabled) {
        const envShiftProgress = (enemiesStompedCount % ENV_SHIFT_MILESTONE) / ENV_SHIFT_MILESTONE;
        const envShiftFillWidth = barWidth * envShiftProgress;
        const envShiftX = startX;
        const envShiftY = currentY - 15; // Position it above the others, considering the new currentY
        currentY = envShiftY - 20; // Update currentY for subsequent bars, increasing spacing

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(envShiftX, envShiftY, barWidth, barHeight);

        // Fill
        if (envShiftProgress > 0) {
            const gradient = ctx.createLinearGradient(envShiftX, envShiftY, envShiftX + barWidth, envShiftY);
            gradient.addColorStop(0, '#3498DB'); // Light Blue
            gradient.addColorStop(1, '#2980B9'); // Darker Blue
            ctx.fillStyle = gradient;
            ctx.fillRect(envShiftX, envShiftY, envShiftFillWidth, barHeight);
        }

        // Text and Border
        ctx.fillStyle = currentPalette.uiColor;
        ctx.font = 'bold 11px "Segoe UI", Tahoma, Geneva, Verdana, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`ENVIRONMENT [${enemiesStompedCount % ENV_SHIFT_MILESTONE}/${ENV_SHIFT_MILESTONE}]`, envShiftX - 5, envShiftY + 8);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(envShiftX, envShiftY, barWidth, barHeight);
    }


    // Existing bars (shifted up)
    drawSubBar('SLINGER', totalStonesThrown, 50, '#95A5A6'); // Slate grey
    drawSubBar('TREASURE', totalCoinsAllTime, 200, '#F1C40F'); // Gold
    drawSubBar('STOMPER', totalStomps, 25, '#E74C3C');    // Crimson Red
    ctx.restore();
}
