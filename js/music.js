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
}
