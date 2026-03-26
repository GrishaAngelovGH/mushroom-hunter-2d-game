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

export function toggleLog() {
    const panel = document.getElementById('log-panel');
    const container = document.getElementById('game-container');
    const isHidden = panel.classList.toggle('hidden');
    container.classList.toggle('log-open', !isHidden);
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
