import { audioCtx } from './audio.js';

export class MusicEngine {
    constructor() {
        // C Major scale across 3 octaves — warm, bright, familiar
        // C3, E3, G3, A3, C4, E4, G4, A4, C5, E5, G5
        this.melodyScale = [130.81, 164.81, 196.00, 220.00, 261.63, 329.63, 392.00, 440.00, 523.25, 659.25, 783.99];
        // Chord voicings: [root, third, fifth] indices into melodyScale
        this.chords = [
            [0, 2, 4],   // C major  (C3 G3 C4)
            [3, 5, 7],   // Am       (A3 E4 A4)
            [2, 4, 6],   // G        (G3 C4 G4)
            [1, 3, 5],   // Em       (E3 A3 E4)
        ];
        this.chordIndex = 0;
        this.active = false;
        this.nodes = {};
        this.tempo = 72; // Gentle, breathing BPM
        this.beatDuration = 60 / this.tempo;
        this.stepDuration = this.beatDuration / 2; // 8th notes
        this.currentStep = 0;
        this.melodyMotif = [4, 6, 7, 6, 4, 5, 4, 2]; // gentle arc
        this.bassNotes = [0, 3, 2, 1]; // root of each chord, low octave
        this.phraseCount = 0;
    }

    setupNodes() {
        if (this.nodes.masterGain) return;

        // Master output gain — start() handles all scheduling
        const masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(0, audioCtx.currentTime); // start silent; start() will ramp up
        masterGain.connect(audioCtx.destination);

        // Warm lowpass filter on master
        const masterFilter = audioCtx.createBiquadFilter();
        masterFilter.type = 'lowpass';
        masterFilter.frequency.value = 3200;
        masterFilter.Q.value = 0.5;
        masterFilter.connect(masterGain);

        // Simulated reverb: two parallel delays + a soft feedback loop
        const rev1 = audioCtx.createDelay(2.0);
        rev1.delayTime.value = 0.31;
        const rev2 = audioCtx.createDelay(2.0);
        rev2.delayTime.value = 0.47;
        const revFb1 = audioCtx.createGain();
        revFb1.gain.value = 0.22;
        const revFb2 = audioCtx.createGain();
        revFb2.gain.value = 0.18;
        const revMix = audioCtx.createGain();
        revMix.gain.value = 0.38;

        rev1.connect(revFb1); revFb1.connect(rev1);
        rev2.connect(revFb2); revFb2.connect(rev2);
        rev1.connect(revMix);
        rev2.connect(revMix);
        revMix.connect(masterFilter);

        // Slapback delay for melody sparkle
        const melodyDelay = audioCtx.createDelay(1.0);
        melodyDelay.delayTime.value = this.beatDuration * 0.375;
        const melodyDelayFb = audioCtx.createGain();
        melodyDelayFb.gain.value = 0.28;
        const melodyDelayMix = audioCtx.createGain();
        melodyDelayMix.gain.value = 0.30;
        melodyDelay.connect(melodyDelayFb); melodyDelayFb.connect(melodyDelay);
        melodyDelay.connect(melodyDelayMix); melodyDelayMix.connect(masterFilter);

        // Gentle LFO tremolo on the pad layer
        const tremolo = audioCtx.createOscillator();
        const tremoloGain = audioCtx.createGain();
        tremolo.type = 'sine';
        tremolo.frequency.value = 0.12;
        tremoloGain.gain.value = 0.006;
        tremolo.connect(tremoloGain);
        tremolo.start();

        // Pad bus (chord layer)
        const padBus = audioCtx.createGain();
        padBus.gain.value = 0.14;
        tremoloGain.connect(padBus.gain);
        padBus.connect(rev1);
        padBus.connect(masterFilter);

        // Melody bus
        const melodyBus = audioCtx.createGain();
        melodyBus.gain.value = 1.0;
        melodyBus.connect(melodyDelay);
        melodyBus.connect(masterFilter);

        // Bass bus
        const bassBus = audioCtx.createGain();
        bassBus.gain.value = 0.22;
        bassBus.connect(masterFilter);

        // Shimmer / high bell bus
        const shimmerBus = audioCtx.createGain();
        shimmerBus.gain.value = 0.07;
        shimmerBus.connect(rev2);
        shimmerBus.connect(masterFilter);

        this.nodes = { masterGain, masterFilter, rev1, rev2, revMix, melodyDelay, padBus, melodyBus, bassBus, shimmerBus };
    }

    // Soft, barely-audible foundational drone — C + G
    startAmbientDrone() {
        const freqs = [65.41, 98.00, 130.81]; // C2, G2, C3
        freqs.forEach((f, i) => {
            const osc = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            osc.type = i === 0 ? 'sine' : 'triangle';
            osc.frequency.value = f;
            osc.detune.value = (i - 1) * 3;
            g.gain.setValueAtTime(0, audioCtx.currentTime);
            g.gain.linearRampToValueAtTime(i === 0 ? 0.018 : 0.007, audioCtx.currentTime + 6);
            osc.connect(g); g.connect(this.nodes.bassBus);
            osc.start();
        });
    }
}
