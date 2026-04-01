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

    start() {
        if (this.active) return;
        if (!audioCtx || audioCtx.state === 'suspended') return;
        const firstTime = !this.nodes.masterGain;
        this.setupNodes();
        this.active = true;
        // Ramp master gain up — works for first start AND re-enable after stop
        this.nodes.masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
        if (this.targetVolume === 0) {
            // Stay silent
            this.nodes.masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
        } else if (firstTime) {
            // First start: always ramp from 0 to avoid reading the WebAudio default gain of 1.0
            this.nodes.masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
            this.nodes.masterGain.gain.linearRampToValueAtTime(this.targetVolume ?? 0.55, audioCtx.currentTime + 1.5);
        } else {
            // Re-enable after stop(): ramp from wherever the fade-out left off
            this.nodes.masterGain.gain.setValueAtTime(this.nodes.masterGain.gain.value, audioCtx.currentTime);
            this.nodes.masterGain.gain.linearRampToValueAtTime(this.targetVolume ?? 0.55, audioCtx.currentTime + 1.5);
        }
        if (firstTime) {
            this.startAmbientDrone();
        }
        // Always re-kick the sequencers (they stop looping when active = false)
        this.scheduleChordPad();
        this.playMelodyStep();
        this.playBassStep();
    }

    stop() {
        this.active = false;
        if (this.nodes.masterGain) {
            this.nodes.masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
            this.nodes.masterGain.gain.setValueAtTime(this.nodes.masterGain.gain.value, audioCtx.currentTime);
            this.nodes.masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.2);
        }
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

    // Sustained chord pads — change chord every 4 beats
    scheduleChordPad() {
        if (!this.active) return;
        const chord = this.chords[this.chordIndex % this.chords.length];
        const now = audioCtx.currentTime;
        const dur = this.beatDuration * 4;

        chord.forEach((scaleIdx, i) => {
            const freq = this.melodyScale[scaleIdx];
            const osc1 = audioCtx.createOscillator();
            const osc2 = audioCtx.createOscillator();
            const g = audioCtx.createGain();

            osc1.type = 'sine';
            osc2.type = 'triangle';
            osc1.frequency.value = freq;
            osc2.frequency.value = freq;
            osc1.detune.value = -5 + i * 2;
            osc2.detune.value = 8 + i * 3;

            g.gain.setValueAtTime(0, now);
            g.gain.linearRampToValueAtTime(0.042 - i * 0.008, now + 0.6);
            g.gain.setValueAtTime(0.042 - i * 0.008, now + dur - 0.5);
            g.gain.linearRampToValueAtTime(0, now + dur);

            osc1.connect(g); osc2.connect(g);
            g.connect(this.nodes.padBus);

            osc1.start(now); osc2.start(now);
            osc1.stop(now + dur + 0.1); osc2.stop(now + dur + 0.1);
        });

        // Shimmer bell overtone on chord root
        const rootFreq = this.melodyScale[chord[0]] * 4;
        const bell = audioCtx.createOscillator();
        const bellG = audioCtx.createGain();
        bell.type = 'sine';
        bell.frequency.value = rootFreq;
        bellG.gain.setValueAtTime(0, now);
        bellG.gain.linearRampToValueAtTime(0.025, now + 0.08);
        bellG.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
        bell.connect(bellG); bellG.connect(this.nodes.shimmerBus);
        bell.start(now); bell.stop(now + 2.6);

        this.chordIndex++;
        if (this.chordIndex % 4 === 0) this.phraseCount++;

        setTimeout(() => this.scheduleChordPad(), dur * 1000);
    }

    // Gentle, flowing melody notes
    playMelodyStep() {
        if (!this.active) return;
        const now = audioCtx.currentTime;

        const step = this.currentStep;
        const motifLen = this.melodyMotif.length;
        const scaleIdx = this.melodyMotif[step % motifLen];
        const freq = this.melodyScale[scaleIdx];

        // Humanize timing and velocity
        const jitter = (Math.random() - 0.5) * 0.03;
        const vel = 0.028 + Math.random() * 0.022;
        const noteDur = this.stepDuration * (0.7 + Math.random() * 0.5);

        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        // Subtle pitch vibrato
        const vibLfo = audioCtx.createOscillator();
        const vibGain = audioCtx.createGain();
        vibLfo.frequency.value = 5.2 + Math.random() * 0.8;
        vibGain.gain.value = 2.5;
        vibLfo.connect(vibGain); vibGain.connect(osc.frequency);
        vibLfo.start(now + 0.12); vibLfo.stop(now + noteDur + 0.1);

        g.gain.setValueAtTime(0, now + jitter);
        g.gain.linearRampToValueAtTime(vel, now + jitter + 0.06);
        g.gain.exponentialRampToValueAtTime(vel * 0.4, now + jitter + noteDur * 0.6);
        g.gain.exponentialRampToValueAtTime(0.001, now + jitter + noteDur);

        osc.connect(g); g.connect(this.nodes.melodyBus);
        osc.start(now + jitter); osc.stop(now + jitter + noteDur + 0.05);

        // Occasionally add a soft upper octave sparkle
        if (step % 3 === 0 && Math.random() > 0.55) {
            const sparkOsc = audioCtx.createOscillator();
            const sparkG = audioCtx.createGain();
            sparkOsc.type = 'sine';
            sparkOsc.frequency.value = freq * 2;
            sparkG.gain.setValueAtTime(0, now + 0.05);
            sparkG.gain.linearRampToValueAtTime(0.010, now + 0.12);
            sparkG.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
            sparkOsc.connect(sparkG); sparkG.connect(this.nodes.shimmerBus);
            sparkOsc.start(now + 0.05); sparkOsc.stop(now + 0.95);
        }

        // Evolve the motif gently every full phrase
        if (step % motifLen === motifLen - 1) this.evolveMelody();

        this.currentStep++;

        // Swing: odd steps play slightly late
        const swingOffset = (step % 2 === 1) ? this.stepDuration * 0.12 : 0;
        setTimeout(() => this.playMelodyStep(), (this.stepDuration + swingOffset) * 1000);
    }

    // Soft walking bass line, one note per beat
    playBassStep() {
        if (!this.active) return;
        const now = audioCtx.currentTime;
        const chordIdx = Math.floor(this.currentStep / 8) % this.chords.length;
        const chord = this.chords[chordIdx];

        // Alternate between root, fifth, octave
        const bassPattern = [0, 2, 0, 1]; // chord tones
        const toneIdx = chord[bassPattern[Math.floor(this.currentStep / 2) % 4]];
        const freq = this.melodyScale[toneIdx] / 2; // one octave down

        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const bassDur = this.beatDuration * 0.65;

        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.055, now + 0.04);
        g.gain.exponentialRampToValueAtTime(0.001, now + bassDur);

        osc.connect(g); g.connect(this.nodes.bassBus);
        osc.start(now); osc.stop(now + bassDur + 0.05);

        setTimeout(() => this.playBassStep(), this.beatDuration * 1000);
    }

    evolveMelody() {
        // Gently shift one note in the motif, preferring stepwise motion
        const pos = Math.floor(Math.random() * this.melodyMotif.length);
        const cur = this.melodyMotif[pos];
        const delta = Math.random() > 0.5 ? 1 : -1;
        const next = Math.max(2, Math.min(this.melodyScale.length - 2, cur + delta));
        this.melodyMotif[pos] = next;
    }
}
