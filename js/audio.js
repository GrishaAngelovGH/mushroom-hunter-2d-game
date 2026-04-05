import { MusicEngine } from './music.js';
import { addLog } from './ui.js';

export let audioCtx = null; // Initialize as null
export const musicEngine = new MusicEngine();
export let musicEnabled = localStorage.getItem('mushroomMusicEnabled') !== 'false'; // Default true
const _savedVol = localStorage.getItem('mushroomMusicVolume');
export let musicVolume = _savedVol !== null ? parseInt(_savedVol) : 55;

let audioInitialized = false;

// Resume audio on first user interaction
export function initAudio() {
    if (audioInitialized) return;
    audioInitialized = true;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();

    if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(() => {
            if (musicEnabled) {
                musicEngine.targetVolume = musicVolume / 100;
                musicEngine.start();
            }
        });
    } else {
        if (musicEnabled) {
            musicEngine.targetVolume = musicVolume / 100;
            musicEngine.start();
        }
    }
}

export function toggleMusic() {
    musicEnabled = !musicEnabled;
    localStorage.setItem('mushroomMusicEnabled', musicEnabled);
    const icon = document.getElementById('music-icon');
    if (icon) {
        icon.style.opacity = musicEnabled ? '1' : '0.4';
        icon.style.filter = musicEnabled ? 'none' : 'grayscale(1)';
    }

    if (musicEnabled) {
        if (!audioCtx || audioCtx.state === 'suspended') {
            addLog("Interaction required for music.", 'info');
        } else {
            musicEngine.start();
        }
    } else {
        musicEngine.stop();
    }
    addLog(musicEnabled ? "Music: ON" : "Music: OFF", 'info');
}

export function setMusicVolume(val) {
    val = parseInt(val);
    musicVolume = val; // Keep in-memory variable in sync
    const gain = val / 100;
    localStorage.setItem('mushroomMusicVolume', val);
    if (musicEngine.nodes.masterGain) {
        musicEngine.nodes.masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
        musicEngine.nodes.masterGain.gain.setValueAtTime(musicEngine.nodes.masterGain.gain.value, audioCtx.currentTime);
        musicEngine.nodes.masterGain.gain.linearRampToValueAtTime(gain, audioCtx.currentTime + 0.05);
    }
    musicEngine.targetVolume = gain;
}

export function playSound(freq, type, duration, volume, sweepFreq = null) {
    // Ensure audioCtx is initialized and running
    if (!audioCtx || audioCtx.state !== 'running') {
        return; // Do not play sound if context is not initialized or running
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type; // 'sine', 'square', 'sawtooth', 'triangle'
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    if (sweepFreq) {
        osc.frequency.exponentialRampToValueAtTime(sweepFreq, audioCtx.currentTime + duration);
    }

    gain.gain.setValueAtTime(volume, audioCtx.currentTime); // Volume parameter
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination); // Connects to the speakers

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

export const sounds = {
    jump: () => playSound(200, 'square', 0.15, 0.1, 600),
    coin: () => {
        playSound(660, 'sine', 0.1, 0.1);
        setTimeout(() => playSound(880, 'sine', 0.1, 0.02), 100);
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
    },
    fanfare: () => {
        // Heroic C-Major triad fanfare (C4, E4, G4, C5)
        // Square gives punch, sine adds shimmer on top
        const notes = [261.63, 329.63, 392.00, 523.25];
        notes.forEach((f, i) => {
            setTimeout(() => {
                playSound(f, 'square', 0.25, 0.12, f * 1.01);
                playSound(f * 2, 'sine', 0.2, 0.05);
            }, i * 130);
        });
        // Final high flourish
        setTimeout(() => playSound(1046.50, 'sine', 0.4, 0.1, 1318.51), notes.length * 130);
    }
};

['mousedown', 'keydown', 'touchstart'].forEach(evt => {
    window.addEventListener(evt, initAudio, { once: true });
});