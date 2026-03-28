// Postie Run - Audio System
// Metal Slug-style chiptune with Australian musical references
// All sounds synthesized via Web Audio API - no audio files needed
PR.Audio = {
    ctx: null,
    masterGain: null,
    musicGain: null,
    sfxGain: null,
    musicPlaying: false,
    currentMusic: null,
    musicNodes: [],
    enabled: true,
    initialized: false,

    init: function() {
        // Lazily init on first user gesture (autoplay policy)
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.5;
            this.masterGain.connect(this.ctx.destination);

            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.value = 0.6;
            this.sfxGain.connect(this.masterGain);

            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.value = 0.3;
            this.musicGain.connect(this.masterGain);

            this.initialized = true;
        } catch (e) {
            this.enabled = false;
        }
    },

    _ensureInit: function() {
        if (!this.initialized) this.init();
        if (!this.ctx || !this.enabled) return false;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        return true;
    },

    // ============================================================
    // SOUND EFFECTS
    // ============================================================
    play: function(name) {
        if (!this._ensureInit()) return;

        var sfx = this._sfx[name];
        if (sfx) sfx.call(this);
    },

    _sfx: {
        // Jump - quick ascending sine chirp
        jump: function() {
            var o = this.ctx.createOscillator();
            var g = this.ctx.createGain();
            o.type = 'sine';
            o.frequency.setValueAtTime(300, this.ctx.currentTime);
            o.frequency.linearRampToValueAtTime(600, this.ctx.currentTime + 0.1);
            g.gain.setValueAtTime(0.3, this.ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
            o.connect(g);
            g.connect(this.sfxGain);
            o.start(this.ctx.currentTime);
            o.stop(this.ctx.currentTime + 0.15);
        },

        // Shoot parcel - thud/pop
        shoot: function() {
            var o = this.ctx.createOscillator();
            var g = this.ctx.createGain();
            o.type = 'square';
            o.frequency.setValueAtTime(200, this.ctx.currentTime);
            o.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.08);
            g.gain.setValueAtTime(0.25, this.ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
            o.connect(g);
            g.connect(this.sfxGain);
            o.start(this.ctx.currentTime);
            o.stop(this.ctx.currentTime + 0.1);
        },

        // Cannon fire - deeper thud with more punch
        cannon: function() {
            var o = this.ctx.createOscillator();
            var g = this.ctx.createGain();
            o.type = 'sawtooth';
            o.frequency.setValueAtTime(150, this.ctx.currentTime);
            o.frequency.linearRampToValueAtTime(40, this.ctx.currentTime + 0.12);
            g.gain.setValueAtTime(0.4, this.ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
            o.connect(g);
            g.connect(this.sfxGain);
            o.start(this.ctx.currentTime);
            o.stop(this.ctx.currentTime + 0.15);
            // Add noise burst
            this._noiseBurst(0.08, 0.15);
        },

        // Letter spray - high pitched scatter
        spray: function() {
            for (var i = 0; i < 3; i++) {
                var o = this.ctx.createOscillator();
                var g = this.ctx.createGain();
                o.type = 'square';
                var t = this.ctx.currentTime + i * 0.02;
                o.frequency.setValueAtTime(800 + i * 200, t);
                o.frequency.linearRampToValueAtTime(400, t + 0.06);
                g.gain.setValueAtTime(0.15, t);
                g.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
                o.connect(g);
                g.connect(this.sfxGain);
                o.start(t);
                o.stop(t + 0.08);
            }
        },

        // Ninja stamp throw - whoosh with a sharp "thwack"
        stamp_throw: function() {
            // Whoosh
            var n = this._createNoise(0.15);
            var f = this.ctx.createBiquadFilter();
            f.type = 'bandpass';
            f.frequency.setValueAtTime(2000, this.ctx.currentTime);
            f.frequency.linearRampToValueAtTime(500, this.ctx.currentTime + 0.12);
            f.Q.value = 2;
            var g = this.ctx.createGain();
            g.gain.setValueAtTime(0.2, this.ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
            n.connect(f);
            f.connect(g);
            g.connect(this.sfxGain);
            n.start(this.ctx.currentTime);
            n.stop(this.ctx.currentTime + 0.15);
            // Thwack
            var o = this.ctx.createOscillator();
            var g2 = this.ctx.createGain();
            o.type = 'square';
            o.frequency.setValueAtTime(300, this.ctx.currentTime);
            o.frequency.linearRampToValueAtTime(100, this.ctx.currentTime + 0.05);
            g2.gain.setValueAtTime(0.3, this.ctx.currentTime);
            g2.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
            o.connect(g2);
            g2.connect(this.sfxGain);
            o.start(this.ctx.currentTime);
            o.stop(this.ctx.currentTime + 0.08);
        },

        // Explosion - white noise burst + low boom
        explosion: function() {
            this._noiseBurst(0.25, 0.3);
            var o = this.ctx.createOscillator();
            var g = this.ctx.createGain();
            o.type = 'sine';
            o.frequency.setValueAtTime(80, this.ctx.currentTime);
            o.frequency.linearRampToValueAtTime(20, this.ctx.currentTime + 0.3);
            g.gain.setValueAtTime(0.4, this.ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);
            o.connect(g);
            g.connect(this.sfxGain);
            o.start(this.ctx.currentTime);
            o.stop(this.ctx.currentTime + 0.35);
        },

        // Hit - crunch
        hit: function() {
            this._noiseBurst(0.15, 0.08);
            var o = this.ctx.createOscillator();
            var g = this.ctx.createGain();
            o.type = 'square';
            o.frequency.setValueAtTime(200, this.ctx.currentTime);
            o.frequency.linearRampToValueAtTime(50, this.ctx.currentTime + 0.06);
            g.gain.setValueAtTime(0.25, this.ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
            o.connect(g);
            g.connect(this.sfxGain);
            o.start(this.ctx.currentTime);
            o.stop(this.ctx.currentTime + 0.08);
        },

        // Enemy hit
        enemy_hit: function() {
            var o = this.ctx.createOscillator();
            var g = this.ctx.createGain();
            o.type = 'square';
            o.frequency.setValueAtTime(400, this.ctx.currentTime);
            o.frequency.linearRampToValueAtTime(150, this.ctx.currentTime + 0.06);
            g.gain.setValueAtTime(0.2, this.ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
            o.connect(g);
            g.connect(this.sfxGain);
            o.start(this.ctx.currentTime);
            o.stop(this.ctx.currentTime + 0.08);
        },

        // Pickup - ascending arpeggio
        pickup: function() {
            var notes = [523, 659, 784]; // C5, E5, G5
            for (var i = 0; i < notes.length; i++) {
                var o = this.ctx.createOscillator();
                var g = this.ctx.createGain();
                o.type = 'sine';
                var t = this.ctx.currentTime + i * 0.06;
                o.frequency.setValueAtTime(notes[i], t);
                g.gain.setValueAtTime(0.2, t);
                g.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
                o.connect(g);
                g.connect(this.sfxGain);
                o.start(t);
                o.stop(t + 0.15);
            }
        },

        // Weapon pickup - triumphant arpeggio
        pickup_weapon: function() {
            var notes = [392, 494, 587, 784]; // G4, B4, D5, G5
            for (var i = 0; i < notes.length; i++) {
                var o = this.ctx.createOscillator();
                var g = this.ctx.createGain();
                o.type = 'square';
                var t = this.ctx.currentTime + i * 0.05;
                o.frequency.setValueAtTime(notes[i], t);
                g.gain.setValueAtTime(0.15, t);
                g.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
                o.connect(g);
                g.connect(this.sfxGain);
                o.start(t);
                o.stop(t + 0.2);
            }
        },

        // eDV pickup - engine rev sound
        pickup_edv: function() {
            var o = this.ctx.createOscillator();
            var g = this.ctx.createGain();
            o.type = 'sawtooth';
            o.frequency.setValueAtTime(60, this.ctx.currentTime);
            o.frequency.linearRampToValueAtTime(200, this.ctx.currentTime + 0.3);
            o.frequency.linearRampToValueAtTime(150, this.ctx.currentTime + 0.5);
            g.gain.setValueAtTime(0.2, this.ctx.currentTime);
            g.gain.setValueAtTime(0.2, this.ctx.currentTime + 0.3);
            g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.6);
            o.connect(g);
            g.connect(this.sfxGain);
            o.start(this.ctx.currentTime);
            o.stop(this.ctx.currentTime + 0.6);
        },

        // Van horn - two-tone horn (very Metal Slug)
        van_horn: function() {
            var freqs = [350, 440];
            for (var i = 0; i < 2; i++) {
                var o = this.ctx.createOscillator();
                var g = this.ctx.createGain();
                o.type = 'square';
                o.frequency.value = freqs[i];
                g.gain.setValueAtTime(0.15, this.ctx.currentTime);
                g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
                o.connect(g);
                g.connect(this.sfxGain);
                o.start(this.ctx.currentTime);
                o.stop(this.ctx.currentTime + 0.3);
            }
        },

        // Dog bark - noise through resonant filter
        dog_bark: function() {
            var n = this._createNoise(0.12);
            var f = this.ctx.createBiquadFilter();
            f.type = 'bandpass';
            f.frequency.setValueAtTime(800, this.ctx.currentTime);
            f.Q.value = 5;
            var g = this.ctx.createGain();
            g.gain.setValueAtTime(0.2, this.ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
            n.connect(f);
            f.connect(g);
            g.connect(this.sfxGain);
            n.start(this.ctx.currentTime);
            n.stop(this.ctx.currentTime + 0.12);
        },

        // Enemy throw
        throw: function() {
            var o = this.ctx.createOscillator();
            var g = this.ctx.createGain();
            o.type = 'triangle';
            o.frequency.setValueAtTime(500, this.ctx.currentTime);
            o.frequency.linearRampToValueAtTime(200, this.ctx.currentTime + 0.1);
            g.gain.setValueAtTime(0.15, this.ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
            o.connect(g);
            g.connect(this.sfxGain);
            o.start(this.ctx.currentTime);
            o.stop(this.ctx.currentTime + 0.12);
        },

        // Death - descending sad tones
        death: function() {
            var notes = [440, 370, 311, 220];
            for (var i = 0; i < notes.length; i++) {
                var o = this.ctx.createOscillator();
                var g = this.ctx.createGain();
                o.type = 'sine';
                var t = this.ctx.currentTime + i * 0.15;
                o.frequency.setValueAtTime(notes[i], t);
                g.gain.setValueAtTime(0.2, t);
                g.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
                o.connect(g);
                g.connect(this.sfxGain);
                o.start(t);
                o.stop(t + 0.25);
            }
        },

        // Level complete - victory jingle with Waltzing Matilda nod
        // (first four notes of the melody: G A B G)
        level_complete: function() {
            var notes = [392, 440, 494, 392, 523, 587, 659, 784];
            for (var i = 0; i < notes.length; i++) {
                var o = this.ctx.createOscillator();
                var g = this.ctx.createGain();
                o.type = 'square';
                var t = this.ctx.currentTime + i * 0.12;
                o.frequency.setValueAtTime(notes[i], t);
                g.gain.setValueAtTime(0.18, t);
                g.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
                o.connect(g);
                g.connect(this.sfxGain);
                o.start(t);
                o.stop(t + 0.2);
            }
        }
    },

    // ============================================================
    // HELPER FUNCTIONS
    // ============================================================
    _noiseBurst: function(volume, duration) {
        var bufferSize = Math.floor(this.ctx.sampleRate * duration);
        var buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1);
        }
        var source = this.ctx.createBufferSource();
        source.buffer = buffer;
        var g = this.ctx.createGain();
        g.gain.setValueAtTime(volume, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        source.connect(g);
        g.connect(this.sfxGain);
        source.start(this.ctx.currentTime);
    },

    _createNoise: function(duration) {
        var bufferSize = Math.floor(this.ctx.sampleRate * duration);
        var buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        var source = this.ctx.createBufferSource();
        source.buffer = buffer;
        return source;
    },

    // ============================================================
    // MUSIC SYSTEM - Australian-flavoured Metal Slug chiptune
    // ============================================================
    playMusic: function(theme) {
        if (!this._ensureInit()) return;
        this.stopMusic();
        this.musicPlaying = true;
        this.currentMusic = theme;
        this._startMusicLoop(theme);
    },

    stopMusic: function() {
        this.musicPlaying = false;
        for (var i = 0; i < this.musicNodes.length; i++) {
            try { this.musicNodes[i].stop(); } catch(e) {}
        }
        this.musicNodes = [];
    },

    _startMusicLoop: function(theme) {
        if (!this.musicPlaying) return;

        var self = this;
        var t = this.ctx.currentTime;
        var bpm = 140;
        var beat = 60 / bpm;
        var bar = beat * 4;

        // Each theme has a different musical flavour
        var patterns = this._getMusicPattern(theme);
        var totalDuration = 0;

        // BASS LINE (square wave - punchy Metal Slug bass)
        if (patterns.bass) {
            for (var i = 0; i < patterns.bass.length; i++) {
                var note = patterns.bass[i];
                if (note.freq > 0) {
                    var o = this.ctx.createOscillator();
                    var g = this.ctx.createGain();
                    o.type = 'square';
                    o.frequency.setValueAtTime(note.freq, t + note.time);
                    g.gain.setValueAtTime(0.12, t + note.time);
                    g.gain.setValueAtTime(0.12, t + note.time + note.dur * 0.8);
                    g.gain.linearRampToValueAtTime(0.0, t + note.time + note.dur);
                    o.connect(g);
                    g.connect(this.musicGain);
                    o.start(t + note.time);
                    o.stop(t + note.time + note.dur);
                    this.musicNodes.push(o);
                }
                totalDuration = Math.max(totalDuration, note.time + note.dur);
            }
        }

        // MELODY (triangle/square wave)
        if (patterns.melody) {
            for (var j = 0; j < patterns.melody.length; j++) {
                var mn = patterns.melody[j];
                if (mn.freq > 0) {
                    var om = this.ctx.createOscillator();
                    var gm = this.ctx.createGain();
                    om.type = 'triangle';
                    om.frequency.setValueAtTime(mn.freq, t + mn.time);
                    gm.gain.setValueAtTime(0.1, t + mn.time);
                    gm.gain.setValueAtTime(0.1, t + mn.time + mn.dur * 0.7);
                    gm.gain.linearRampToValueAtTime(0.0, t + mn.time + mn.dur);
                    om.connect(gm);
                    gm.connect(this.musicGain);
                    om.start(t + mn.time);
                    om.stop(t + mn.time + mn.dur);
                    this.musicNodes.push(om);
                }
                totalDuration = Math.max(totalDuration, mn.time + mn.dur);
            }
        }

        // DRUMS (noise-based)
        if (patterns.drums) {
            for (var k = 0; k < patterns.drums.length; k++) {
                var dn = patterns.drums[k];
                this._scheduleHit(t + dn.time, dn.type, dn.dur || 0.05);
            }
        }

        // DIDGERIDOO DRONE (outback & regional themes) - low oscillating sine
        if (patterns.didgeridoo) {
            var didge = this.ctx.createOscillator();
            var dg = this.ctx.createGain();
            var df = this.ctx.createBiquadFilter();
            didge.type = 'sawtooth';
            didge.frequency.setValueAtTime(65, t); // Low Bb
            // Wobble the frequency for that authentic drone
            var lfo = this.ctx.createOscillator();
            var lfoGain = this.ctx.createGain();
            lfo.type = 'sine';
            lfo.frequency.value = 3; // Subtle wobble
            lfoGain.gain.value = 8;
            lfo.connect(lfoGain);
            lfoGain.connect(didge.frequency);
            df.type = 'lowpass';
            df.frequency.value = 200;
            df.Q.value = 8;
            dg.gain.setValueAtTime(0.08, t);
            dg.gain.setValueAtTime(0.08, t + totalDuration - 0.5);
            dg.gain.linearRampToValueAtTime(0.0, t + totalDuration);
            didge.connect(df);
            df.connect(dg);
            dg.connect(this.musicGain);
            lfo.start(t);
            lfo.stop(t + totalDuration);
            didge.start(t);
            didge.stop(t + totalDuration);
            this.musicNodes.push(didge);
            this.musicNodes.push(lfo);
        }

        // KOOKABURRA LAUGH (regional/outback - synthesized descending laugh)
        if (patterns.kookaburra) {
            var kTime = t + totalDuration * 0.5;
            for (var kl = 0; kl < 6; kl++) {
                var ko = this.ctx.createOscillator();
                var kg = this.ctx.createGain();
                ko.type = 'sine';
                var kt = kTime + kl * 0.08;
                ko.frequency.setValueAtTime(2000 - kl * 150, kt);
                ko.frequency.linearRampToValueAtTime(1500 - kl * 100, kt + 0.06);
                kg.gain.setValueAtTime(0.04, kt);
                kg.gain.exponentialRampToValueAtTime(0.001, kt + 0.07);
                ko.connect(kg);
                kg.connect(this.musicGain);
                ko.start(kt);
                ko.stop(kt + 0.07);
                this.musicNodes.push(ko);
            }
        }

        // Loop the music
        setTimeout(function() {
            if (self.musicPlaying && self.currentMusic === theme) {
                self.musicNodes = [];
                self._startMusicLoop(theme);
            }
        }, totalDuration * 1000);
    },

    _scheduleHit: function(time, type, dur) {
        var bufferSize = Math.floor(this.ctx.sampleRate * (dur || 0.05));
        var buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        var source = this.ctx.createBufferSource();
        source.buffer = buffer;
        var g = this.ctx.createGain();
        var f = this.ctx.createBiquadFilter();

        if (type === 'kick') {
            f.type = 'lowpass';
            f.frequency.value = 200;
            g.gain.setValueAtTime(0.2, time);
            g.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
        } else if (type === 'snare') {
            f.type = 'highpass';
            f.frequency.value = 1000;
            g.gain.setValueAtTime(0.12, time);
            g.gain.exponentialRampToValueAtTime(0.01, time + 0.08);
        } else if (type === 'hihat') {
            f.type = 'highpass';
            f.frequency.value = 5000;
            g.gain.setValueAtTime(0.06, time);
            g.gain.exponentialRampToValueAtTime(0.01, time + 0.03);
        }

        source.connect(f);
        f.connect(g);
        g.connect(this.musicGain);
        source.start(time);
        this.musicNodes.push(source);
    },

    _getMusicPattern: function(theme) {
        var beat = 60 / 140;
        var bar = beat * 4;
        var patterns = {};

        // Helper to create note sequences
        function seq(notes, startTime, durEach) {
            var result = [];
            for (var i = 0; i < notes.length; i++) {
                result.push({ freq: notes[i], time: startTime + i * durEach, dur: durEach * 0.9 });
            }
            return result;
        }

        // Standard drum pattern (boom-tish style)
        function standardDrums(bars) {
            var d = [];
            for (var b = 0; b < bars; b++) {
                var bt = b * bar;
                d.push({ time: bt, type: 'kick' });
                d.push({ time: bt + beat, type: 'hihat' });
                d.push({ time: bt + beat * 2, type: 'snare' });
                d.push({ time: bt + beat * 3, type: 'hihat' });
                // Offbeats
                d.push({ time: bt + beat * 0.5, type: 'hihat' });
                d.push({ time: bt + beat * 1.5, type: 'hihat' });
                d.push({ time: bt + beat * 2.5, type: 'hihat' });
                d.push({ time: bt + beat * 3.5, type: 'hihat' });
            }
            return d;
        }

        switch (theme) {
            case 0: // SUBURBAN - Upbeat march, hints of Waltzing Matilda
                // G A B G melody (Waltzing Matilda opening interval nod)
                patterns.melody = seq([392, 440, 494, 392, 330, 392, 440, 494], 0, beat)
                    .concat(seq([523, 494, 440, 392, 440, 494, 392, 330], bar * 2, beat))
                    .concat(seq([294, 330, 392, 440, 494, 523, 587, 523], bar * 4, beat))
                    .concat(seq([440, 392, 330, 294, 330, 392, 440, 392], bar * 6, beat));
                // Bouncy bass
                patterns.bass = seq([196, 196, 262, 262, 220, 220, 196, 196], 0, beat)
                    .concat(seq([175, 175, 220, 220, 262, 262, 220, 220], bar * 2, beat))
                    .concat(seq([147, 147, 196, 196, 220, 220, 262, 262], bar * 4, beat))
                    .concat(seq([196, 196, 220, 220, 175, 175, 196, 196], bar * 6, beat));
                patterns.drums = standardDrums(8);
                break;

            case 1: // URBAN - Faster, more aggressive, jazz-influenced
                patterns.melody = seq([523, 587, 659, 587, 523, 440, 523, 587], 0, beat * 0.75)
                    .concat(seq([659, 698, 784, 698, 659, 587, 523, 440], bar * 1.5, beat * 0.75))
                    .concat(seq([440, 523, 587, 659, 587, 523, 440, 392], bar * 3, beat * 0.75))
                    .concat(seq([523, 587, 659, 784, 659, 587, 523, 587], bar * 4.5, beat * 0.75));
                patterns.bass = seq([131, 131, 165, 165, 147, 147, 175, 175], 0, beat)
                    .concat(seq([165, 165, 196, 196, 175, 175, 147, 147], bar * 2, beat))
                    .concat(seq([131, 131, 175, 175, 196, 196, 165, 165], bar * 4, beat))
                    .concat(seq([147, 147, 131, 131, 165, 165, 175, 175], bar * 6, beat));
                patterns.drums = standardDrums(8);
                break;

            case 2: // REGIONAL - Country feel, didgeridoo undertone, kookaburra
                patterns.melody = seq([330, 392, 440, 392, 330, 294, 330, 392], 0, beat)
                    .concat(seq([440, 494, 523, 494, 440, 392, 330, 294], bar * 2, beat))
                    .concat(seq([262, 294, 330, 392, 440, 392, 330, 294], bar * 4, beat))
                    .concat(seq([330, 392, 440, 523, 494, 440, 392, 330], bar * 6, beat));
                patterns.bass = seq([110, 110, 147, 147, 131, 131, 110, 110], 0, beat)
                    .concat(seq([98, 98, 131, 131, 147, 147, 131, 131], bar * 2, beat))
                    .concat(seq([110, 110, 131, 131, 147, 147, 165, 165], bar * 4, beat))
                    .concat(seq([131, 131, 110, 110, 98, 98, 110, 110], bar * 6, beat));
                patterns.drums = standardDrums(8);
                patterns.didgeridoo = true;
                patterns.kookaburra = true;
                break;

            case 3: // COASTAL - Breezy, surf guitar feel
                patterns.melody = seq([659, 587, 523, 440, 523, 587, 659, 784], 0, beat)
                    .concat(seq([659, 587, 523, 587, 659, 784, 880, 784], bar * 2, beat))
                    .concat(seq([523, 587, 659, 587, 523, 440, 392, 440], bar * 4, beat))
                    .concat(seq([523, 587, 659, 784, 880, 784, 659, 587], bar * 6, beat));
                patterns.bass = seq([165, 165, 196, 196, 220, 220, 196, 196], 0, beat)
                    .concat(seq([175, 175, 220, 220, 262, 262, 220, 220], bar * 2, beat))
                    .concat(seq([165, 165, 220, 220, 196, 196, 175, 175], bar * 4, beat))
                    .concat(seq([196, 196, 220, 220, 262, 262, 196, 196], bar * 6, beat));
                patterns.drums = standardDrums(8);
                break;

            case 4: // OUTBACK - Dramatic, sparse, big didgeridoo, Aussie anthem feel
                // Nod to "Down Under" intervals and Waltzing Matilda
                patterns.melody = seq([294, 330, 392, 294, 262, 294, 330, 392], 0, beat * 1.2)
                    .concat(seq([440, 392, 330, 294, 262, 294, 392, 330], bar * 2.4, beat * 1.2))
                    .concat(seq([220, 262, 294, 330, 392, 440, 392, 330], bar * 4.8, beat * 1.2))
                    .concat(seq([294, 330, 392, 440, 392, 330, 294, 262], bar * 7.2, beat * 1.2));
                patterns.bass = seq([73, 73, 98, 98, 110, 110, 98, 98], 0, beat * 1.2)
                    .concat(seq([82, 82, 110, 110, 131, 131, 110, 110], bar * 2.4, beat * 1.2))
                    .concat(seq([73, 73, 82, 82, 98, 98, 110, 110], bar * 4.8, beat * 1.2))
                    .concat(seq([98, 98, 82, 82, 73, 73, 82, 82], bar * 7.2, beat * 1.2));
                patterns.drums = standardDrums(10);
                patterns.didgeridoo = true;
                patterns.kookaburra = true;
                break;

            default: // Title screen music
                patterns.melody = seq([523, 587, 659, 784, 659, 587, 523, 440], 0, beat)
                    .concat(seq([392, 440, 523, 587, 523, 440, 392, 330], bar * 2, beat));
                patterns.bass = seq([131, 131, 165, 165, 175, 175, 165, 165], 0, beat)
                    .concat(seq([131, 131, 147, 147, 165, 165, 131, 131], bar * 2, beat));
                patterns.drums = standardDrums(4);
                break;
        }

        return patterns;
    }
};
