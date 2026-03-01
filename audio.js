// ── Audio System — Procedural Sounds + Voice + Music ──
const Audio = {
    ctx: null,
    masterGain: null,
    musicGain: null,
    droneOsc: null,
    droneGain: null,
    musicPlaying: false,
    musicInterval: null,
    voiceSynth: null,
    voiceQueue: [],
    speaking: false,

    init() {
        if (this.ctx) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.3;
        this.masterGain.connect(this.ctx.destination);

        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = 0.15;
        this.musicGain.connect(this.ctx.destination);

        // Init voice
        this.voiceSynth = window.speechSynthesis;
    },

    // ── Voice-Over System ──
    speak(text, voiceType = 'narrator') {
        if (!this.voiceSynth) return;
        // Cancel any ongoing speech
        this.voiceSynth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Different voice settings per character
        switch (voiceType) {
            case 'narrator':
                utterance.rate = 0.9;
                utterance.pitch = 0.8;
                utterance.volume = 1.0;
                break;
            case 'villager':
                utterance.rate = 1.0;
                utterance.pitch = 1.1;
                utterance.volume = 0.9;
                break;
            case 'merchant':
                utterance.rate = 1.1;
                utterance.pitch = 0.9;
                utterance.volume = 0.9;
                break;
            case 'elder':
                utterance.rate = 0.8;
                utterance.pitch = 0.6;
                utterance.volume = 1.0;
                break;
            case 'child':
                utterance.rate = 1.2;
                utterance.pitch = 1.5;
                utterance.volume = 0.85;
                break;
            case 'guard':
                utterance.rate = 1.0;
                utterance.pitch = 0.7;
                utterance.volume = 1.0;
                break;
            case 'urgent':
                utterance.rate = 1.1;
                utterance.pitch = 1.0;
                utterance.volume = 1.0;
                break;
        }

        // Try to pick a system voice
        const voices = this.voiceSynth.getVoices();
        if (voices.length > 0) {
            // Prefer English voices
            const english = voices.filter(v => v.lang.startsWith('en'));
            if (english.length > 0) {
                // Pick different voice index based on type for variety
                const typeIndex = { narrator: 0, villager: 1, merchant: 2, elder: 3, child: 4, guard: 5, urgent: 0 };
                const idx = (typeIndex[voiceType] || 0) % english.length;
                utterance.voice = english[idx];
            }
        }

        this.voiceSynth.speak(utterance);
    },

    stopSpeaking() {
        if (this.voiceSynth) {
            this.voiceSynth.cancel();
        }
    },

    // ── Briefing Narration ──
    narrateBriefing(phase) {
        if (phase === 'intro') {
            this.speak('Agent. Something stirs beneath this town. A breach in the dimensional fault is widening. If it reaches the surface, the town will not survive.', 'narrator');
        } else if (phase === 'mission') {
            this.speak('Find five Dimensional Keys hidden in the town. Open the portal to The Below. Navigate three deadly trials. Retrieve the Sword of Seal.', 'narrator');
        } else if (phase === 'finale') {
            this.speak('Return the Sword to the Townhall before time runs out. The town doesn\'t know what you\'re about to do. They never will. Good luck, Agent.', 'narrator');
        }
    },

    // ── Core Tone Generator ──
    tone(freq, duration, type = 'sine', volume = 0.3) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.value = volume;
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },

    // ── SFX ──
    keyPickup() {
        this.tone(523, 0.1, 'sine', 0.4);
        setTimeout(() => this.tone(659, 0.1, 'sine', 0.3), 80);
        setTimeout(() => this.tone(784, 0.15, 'sine', 0.3), 160);
        setTimeout(() => this.tone(1047, 0.2, 'sine', 0.25), 240);
    },

    interact() {
        this.tone(440, 0.05, 'sine', 0.2);
        setTimeout(() => this.tone(550, 0.08, 'sine', 0.15), 50);
    },

    damage() {
        this.tone(150, 0.15, 'sawtooth', 0.3);
        this.tone(100, 0.2, 'square', 0.2);
    },

    step() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = 80 + Math.random() * 30;
        gain.gain.value = 0.04;
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    },

    mazeWarning() {
        this.tone(200, 0.3, 'square', 0.2);
        setTimeout(() => this.tone(200, 0.3, 'square', 0.2), 400);
        setTimeout(() => this.tone(200, 0.3, 'square', 0.2), 800);
    },

    mazeShift() {
        this.tone(80, 0.5, 'sawtooth', 0.3);
        this.tone(60, 0.6, 'square', 0.2);
    },

    timerTick(urgency) {
        const freq = 800 + urgency * 400;
        this.tone(freq, 0.05, 'sine', 0.15 + urgency * 0.1);
    },

    successSound() {
        const notes = [523, 659, 784, 1047, 1319];
        notes.forEach((n, i) => {
            setTimeout(() => this.tone(n, 0.3, 'sine', 0.3), i * 150);
        });
    },

    failureSound() {
        this.tone(200, 0.5, 'sawtooth', 0.3);
        setTimeout(() => this.tone(150, 0.5, 'sawtooth', 0.25), 300);
        setTimeout(() => this.tone(100, 0.8, 'sawtooth', 0.2), 600);
        setTimeout(() => this.tone(60, 1.0, 'square', 0.15), 900);
    },

    // Portal opening — deep resonant boom
    portalOpen() {
        this.tone(80, 1.0, 'sine', 0.4);
        this.tone(120, 0.8, 'triangle', 0.3);
        setTimeout(() => this.tone(60, 1.5, 'sawtooth', 0.2), 200);
        setTimeout(() => this.tone(200, 0.5, 'sine', 0.15), 500);
    },

    // Key inserted into portal slot — metallic click
    keyInsert() {
        this.tone(600, 0.1, 'square', 0.3);
        setTimeout(() => this.tone(800, 0.08, 'sine', 0.2), 60);
        setTimeout(() => this.tone(1000, 0.15, 'sine', 0.15), 120);
    },

    // Sword retrieved — triumphant chord
    swordRetrieved() {
        this.tone(440, 0.4, 'sine', 0.3);
        setTimeout(() => this.tone(554, 0.4, 'sine', 0.3), 100);
        setTimeout(() => this.tone(659, 0.4, 'sine', 0.3), 200);
        setTimeout(() => this.tone(880, 0.6, 'sine', 0.25), 300);
        setTimeout(() => this.tone(1108, 0.8, 'sine', 0.2), 500);
    },

    // Return phase — urgent rising tones
    startReturnMusic() {
        this.stopMusic();
        const returnNotes = [
            { freq: 220, dur: 0.3 },
            { freq: 262, dur: 0.25 },
            { freq: 294, dur: 0.3 },
            { freq: 330, dur: 0.25 },
            { freq: 294, dur: 0.3 },
            { freq: 262, dur: 0.25 },
            { freq: 220, dur: 0.4 },
            { freq: 196, dur: 0.3 },
        ];
        let idx = 0;
        this.musicPlaying = true;
        const playNote = () => {
            if (!this.musicPlaying) return;
            const note = returnNotes[idx % returnNotes.length];
            this.tone(note.freq, note.dur * 0.6, 'sawtooth', 0.05);
            this.tone(note.freq * 2, note.dur * 0.3, 'sine', 0.03);
            // Urgent percussion
            if (idx % 2 === 0) {
                this.tone(60, 0.05, 'square', 0.1);
            }
            idx++;
            this.musicInterval = setTimeout(playNote, note.dur * 800);
        };
        this.musicInterval = setTimeout(playNote, 300);
    },

    // ── Ambient Drones / Background Music ──
    startSurfaceAmbience() {
        this.stopDrone();
        if (!this.ctx) return;

        // Warm pad drone
        this.droneOsc = this.ctx.createOscillator();
        this.droneGain = this.ctx.createGain();
        this.droneOsc.type = 'sine';
        this.droneOsc.frequency.value = 220;
        this.droneGain.gain.value = 0.04;
        this.droneOsc.connect(this.droneGain);
        this.droneGain.connect(this.ctx.destination);
        this.droneOsc.start();

        // Gentle surface melody loop
        this.startSurfaceMusic();
    },

    startSurfaceMusic() {
        this.stopMusic();
        const surfaceNotes = [
            { freq: 330, dur: 0.4 },
            { freq: 392, dur: 0.3 },
            { freq: 440, dur: 0.5 },
            { freq: 392, dur: 0.3 },
            { freq: 349, dur: 0.4 },
            { freq: 330, dur: 0.5 },
            { freq: 294, dur: 0.3 },
            { freq: 330, dur: 0.6 },
        ];
        let idx = 0;
        this.musicPlaying = true;
        const playNote = () => {
            if (!this.musicPlaying) return;
            const note = surfaceNotes[idx % surfaceNotes.length];
            this.tone(note.freq, note.dur * 0.8, 'sine', 0.06);
            // Harmony
            this.tone(note.freq * 1.5, note.dur * 0.6, 'triangle', 0.03);
            idx++;
            this.musicInterval = setTimeout(playNote, note.dur * 1000 + 200);
        };
        this.musicInterval = setTimeout(playNote, 1000);
    },

    startBelowDrone() {
        this.stopDrone();
        if (!this.ctx) return;

        // Dark ominous drone
        this.droneOsc = this.ctx.createOscillator();
        this.droneGain = this.ctx.createGain();
        this.droneOsc.type = 'sawtooth';
        this.droneOsc.frequency.value = 55;
        this.droneGain.gain.value = 0.06;
        this.droneOsc.connect(this.droneGain);
        this.droneGain.connect(this.ctx.destination);
        this.droneOsc.start();

        // Second oscillator for unsettling chord
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.value = 82.5; // Tritone - unsettling
        gain2.gain.value = 0.03;
        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.start();

        // Below tension music
        this.startBelowMusic();
    },

    startBelowMusic() {
        this.stopMusic();
        const belowNotes = [
            { freq: 110, dur: 0.6 },
            { freq: 130, dur: 0.4 },
            { freq: 98, dur: 0.8 },
            { freq: 116, dur: 0.5 },
            { freq: 82, dur: 0.7 },
            { freq: 110, dur: 0.4 },
            { freq: 146, dur: 0.3 },
            { freq: 98, dur: 0.9 },
        ];
        let idx = 0;
        this.musicPlaying = true;
        const playNote = () => {
            if (!this.musicPlaying) return;
            const note = belowNotes[idx % belowNotes.length];
            this.tone(note.freq, note.dur * 0.7, 'square', 0.04);
            this.tone(note.freq * 2, note.dur * 0.3, 'triangle', 0.02);
            // Random percussive hits for tension
            if (Math.random() < 0.3) {
                this.tone(40 + Math.random() * 30, 0.1, 'sawtooth', 0.08);
            }
            idx++;
            this.musicInterval = setTimeout(playNote, note.dur * 1000 + 100);
        };
        this.musicInterval = setTimeout(playNote, 500);
    },

    stopMusic() {
        this.musicPlaying = false;
        if (this.musicInterval) {
            clearTimeout(this.musicInterval);
            this.musicInterval = null;
        }
    },

    stopDrone() {
        this.stopMusic();
        if (this.droneOsc) {
            try { this.droneOsc.stop(); } catch (e) { }
            this.droneOsc = null;
        }
        if (this.droneGain) {
            this.droneGain = null;
        }
    },
};
