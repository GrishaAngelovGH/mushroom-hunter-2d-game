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
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 12px "Segoe UI", Tahoma, Geneva, Verdana, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`ELITE HUNT [${stompsCount % 20}/20]`, x + 5, y - 6);
}
