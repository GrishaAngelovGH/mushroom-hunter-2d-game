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

    // Prune history to last 5 entries
    if (eventPanel.children.length > 5) {
        eventPanel.removeChild(eventPanel.firstChild);
    }
}

export function toggleLog() {
    const panel = document.getElementById('log-panel');
    const container = document.getElementById('game-container');
    const isHidden = panel.classList.toggle('hidden');
    container.classList.toggle('log-open', !isHidden);
}
