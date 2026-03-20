const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

export function playSound(freq, type, duration, volume, sweepFreq = null) {
    if (audioCtx.state === 'suspended') {
        // Attempt to resume on interaction if not already started
        audioCtx.resume().then(() => {
            console.log("Audio resumed!"); // For debugging
        });
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    if (sweepFreq) {
        osc.frequency.exponentialRampToValueAtTime(sweepFreq, audioCtx.currentTime + duration);
    }

    gain.gain.setValueAtTime(volume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

export const sounds = {
    jump: () => playSound(200, 'square', 0.15, 0.1, 600),
    coin: () => {
        playSound(660, 'sine', 0.1, 0.1);
        setTimeout(() => playSound(880, 'sine', 0.1, 0.1), 100);
    },
    stomp: () => playSound(150, 'square', 0.2, 0.15, 50),
    gameOver: () => {
        [400, 300, 200].forEach((f, i) => {
            setTimeout(() => playSound(f, 'triangle', 0.3, 0.1), i * 300);
        });
    },
    win: () => {
        [400, 500, 600, 700, 800, 1000].forEach((f, i) => {
            setTimeout(() => playSound(f, 'sine', 0.5, 0.1), i * 250);
        });
    },
    throw: () => playSound(300, 'sawtooth', 0.08, 0.07, 150),
    powerup: () => {
        [500, 700, 900, 1100].forEach((f, i) => {
            setTimeout(() => playSound(f, 'sine', 0.15, 0.1), i * 80);
        });
    },
    eliteSpawn: () => {
        // Gentle rising magical chord (C-Major)
        [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
            setTimeout(() => playSound(f, 'sine', 0.3, 0.1, f + 50), i * 100);
        });
    },
    eliteHit: () => {
        // Layer 1: Mid-range crunch
        setTimeout(() => playSound(220, 'square', 0.1, 0.2, 110), 50);
        // Layer 2: Victory high-frequency ring
        setTimeout(() => playSound(1046, 'sine', 0.4, 0.15, 1318), 100);
    },
    shift: () => {
        // Magical cascading shimmer (G-Major)
        [392.00, 493.88, 587.33, 783.99, 987.77].forEach((f, i) => {
            setTimeout(() => playSound(f, 'sine', 0.6, 0.08, f + 100), i * 120);
        });
    }
};

// Resume audio on first user interaction
export function initAudio() {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(() => {
            console.log("Audio resumed!"); // For debugging
        });
    }
}

['mousedown', 'keydown', 'touchstart'].forEach(evt => {
    window.addEventListener(evt, initAudio, { once: true });
});
