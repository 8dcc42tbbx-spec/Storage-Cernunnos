// Trivia Trixie - synthesized chiptune audio. No audio files -- everything is
// generated at runtime with 2-operator FM (a sine modulator driving a sine
// carrier's frequency), the same voice model at the heart of the Sega Genesis'
// YM2612 chip. That's what gives the stings and loops a bright, bell-like
// "16-bit adventure game" character instead of flat NES-style square bleeps.
var TT = TT || {};
TT.Audio = (function () {
    var actx = null;
    var masterGain, musicGain, sfxGain;
    var noiseBuf = null;
    var musicBus = null;
    var musicTimer = null;
    var musicGen = 0;
    var currentTrack = null;
    var pendingTrack = null;
    var muted = false;

    function ctx() {
        if (!actx) {
            var AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return null;
            actx = new AC();
            masterGain = actx.createGain();
            masterGain.gain.value = 0.85;
            masterGain.connect(actx.destination);

            musicGain = actx.createGain();
            musicGain.gain.value = 0.5;
            musicGain.connect(masterGain);

            sfxGain = actx.createGain();
            sfxGain.gain.value = 1.0;
            sfxGain.connect(masterGain);
        }
        return actx;
    }

    // ---- note names -> frequency ---------------------------------------
    var SEMI = {
        C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5,
        'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11
    };
    function freq(name) {
        var m = /^([A-G][b#]?)(-?\d+)$/.exec(name);
        if (!m) return 440;
        var midi = (parseInt(m[2], 10) + 1) * 12 + SEMI[m[1]];
        return 440 * Math.pow(2, (midi - 69) / 12);
    }

    function noise() {
        var a = ctx();
        if (!noiseBuf) {
            var n = a.sampleRate * 1;
            noiseBuf = a.createBuffer(1, n, a.sampleRate);
            var d = noiseBuf.getChannelData(0);
            for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
        }
        return noiseBuf;
    }

    // ratio: modulator freq / carrier freq. index/indexDecay: modulation
    // depth envelope, which is what actually makes FM sound like FM instead
    // of a plain detuned sine.
    var INST = {
        bell:  { ratio: 3.5,  index: 2.4, indexDecay: 0.04, iDec: 0.4,  atk: 0.002, dec: 0.45, sus: 0.10, rel: 0.55, gain: 0.30 },
        pluck: { ratio: 2.0,  index: 2.0, indexDecay: 0.05, iDec: 0.16, atk: 0.002, dec: 0.20, sus: 0.05, rel: 0.20, gain: 0.32 },
        brass: { ratio: 1.0,  index: 1.6, indexDecay: 0.35, iDec: 0.20, atk: 0.02,  dec: 0.12, sus: 0.72, rel: 0.14, gain: 0.32, spread: 6 },
        bass:  { ratio: 1.0,  index: 1.2, indexDecay: 0.12, iDec: 0.14, atk: 0.004, dec: 0.10, sus: 0.55, rel: 0.10, gain: 0.46 },
        pad:   { ratio: 1.005, index: 0.6, indexDecay: 0.6, iDec: 1.1,  atk: 0.35,  dec: 0.6,  sus: 0.70, rel: 1.1,  gain: 0.18, spread: 9 }
    };

    function fmNote(inst, f, t, dur, vel, bus) {
        var a = ctx();
        if (!a) return;
        var p = INST[inst] || INST.pluck;
        var amp = (vel === undefined ? 1 : vel) * p.gain;

        var car = a.createOscillator();
        var mod = a.createOscillator();
        var modGain = a.createGain();
        var vca = a.createGain();

        car.frequency.setValueAtTime(f, t);
        mod.frequency.setValueAtTime(f * p.ratio, t);

        var i0 = Math.max(p.index * f, 0.001);
        var i1 = Math.max(p.index * f * p.indexDecay, 0.001);
        modGain.gain.setValueAtTime(i0, t);
        modGain.gain.exponentialRampToValueAtTime(i1, t + p.iDec);
        mod.connect(modGain);
        modGain.connect(car.frequency);

        var susLvl = Math.max(amp * p.sus, 0.0001);
        vca.gain.setValueAtTime(0.0001, t);
        vca.gain.exponentialRampToValueAtTime(Math.max(amp, 0.0002), t + p.atk);
        vca.gain.exponentialRampToValueAtTime(susLvl, t + p.atk + p.dec);
        var relStart = Math.max(t + dur, t + p.atk + p.dec + 0.01);
        vca.gain.setValueAtTime(susLvl, relStart);
        vca.gain.exponentialRampToValueAtTime(0.0001, relStart + p.rel);

        car.connect(vca);
        vca.connect(bus || sfxGain);

        var stopAt = relStart + p.rel + 0.03;
        car.start(t); car.stop(stopAt);
        mod.start(t); mod.stop(stopAt);
    }

    function playNote(inst, note, t, dur, vel, bus) {
        var p = INST[inst] || INST.pluck;
        var f = typeof note === 'number' ? note : freq(note);
        if (p.spread) {
            var d = Math.pow(2, p.spread / 1200);
            fmNote(inst, f * d, t, dur, (vel || 1) * 0.55, bus);
            fmNote(inst, f / d, t, dur, (vel || 1) * 0.55, bus);
        } else {
            fmNote(inst, f, t, dur, vel, bus);
        }
    }

    function kick(t, vel, bus) {
        var a = ctx();
        var o = a.createOscillator(), g = a.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(150, t);
        o.frequency.exponentialRampToValueAtTime(48, t + 0.08);
        g.gain.setValueAtTime(Math.max(vel || 0.8, 0.0001), t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);
        o.connect(g); g.connect(bus || sfxGain);
        o.start(t); o.stop(t + 0.28);
    }

    function shimmer(t, vel, bus) {
        var a = ctx();
        var s = a.createBufferSource(); s.buffer = noise();
        var hp = a.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 8000;
        var g = a.createGain();
        g.gain.setValueAtTime(Math.max((vel || 0.3) * 0.3, 0.0001), t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
        s.connect(hp); hp.connect(g); g.connect(bus || sfxGain);
        s.start(t); s.stop(t + 0.2);
    }

    // ---- track building helpers -----------------------------------------
    function seq(out, beat, dur, inst, pitches, vel) {
        (typeof pitches === 'string' ? [pitches] : pitches).forEach(function (p) {
            out.push([beat, dur, inst, p, vel === undefined ? 1 : vel]);
        });
        return out;
    }
    function run(out, beat, step, inst, pitches, vel, dur) {
        pitches.forEach(function (p, i) {
            if (p) out.push([beat + i * step, dur || step, inst, p, vel === undefined ? 1 : vel]);
        });
        return out;
    }

    // ---- TRACKS -----------------------------------------------------------
    var MUSIC = {};

    // TITLE -- a short, dreamy, sparkly loop. F major pentatonic-ish: bright
    // and simple, never tense, sets the "friendly game show" tone.
    (function () {
        var n = [];
        seq(n, 0, 7.6, 'pad', ['F3', 'C4'], 0.28);
        seq(n, 8, 7.6, 'pad', ['G3', 'D4'], 0.26);
        run(n, 0, 2, 'bell', ['F5', 'A5', 'C6', 'A5'], 0.30);
        run(n, 8, 2, 'bell', ['G5', 'Bb5', 'D6', 'Bb5'], 0.28);
        run(n, 0, 4, 'bass', ['F2', 'C3', 'G2', 'D3'], 0.4, 3.6);
        MUSIC.title = { bpm: 96, len: 16, loop: true, notes: n };
    })();

    // QUESTION -- soft, friendly anticipation bed. Deliberately quiet and
    // uneventful so it never feels like a countdown-to-doom for a kid.
    (function () {
        var n = [];
        seq(n, 0, 7.6, 'pad', ['C3', 'G3'], 0.14);
        run(n, 0, 2, 'pluck', ['C5', 'C5', 'C5', 'C5'], 0.12, 0.3);
        MUSIC.question = { bpm: 100, len: 8, loop: true, notes: n };
    })();

    function scheduleIteration(track, startTime, gen, bus) {
        var beat = 60 / track.bpm;
        track.notes.forEach(function (ev) {
            var t = startTime + ev[0] * beat;
            var dur = ev[1] * beat;
            playNote(ev[2], ev[3], t, dur, ev[4], bus);
        });
        if (track.loop) {
            var loopDur = track.len * beat;
            var next = startTime + loopDur;
            var a = ctx();
            var waitMs = (next - a.currentTime - 0.3) * 1000;
            musicTimer = setTimeout(function () {
                if (gen !== musicGen) return;
                scheduleIteration(track, next, gen, bus);
            }, Math.max(20, waitMs));
        }
    }

    function stopMusic() {
        musicGen++;
        currentTrack = null;
        pendingTrack = null;
        if (musicTimer) { clearTimeout(musicTimer); musicTimer = null; }
        if (musicBus) {
            var a = ctx(), b = musicBus;
            try {
                b.gain.cancelScheduledValues(a.currentTime);
                b.gain.setValueAtTime(b.gain.value, a.currentTime);
                b.gain.linearRampToValueAtTime(0, a.currentTime + 0.2);
            } catch (e) { /* bus already torn down */ }
            setTimeout(function () { try { b.disconnect(); } catch (e) {} }, 400);
            musicBus = null;
        }
    }

    function startTrackNow(name) {
        stopMusic();
        var a = ctx();
        if (!a) return;
        currentTrack = name;
        musicBus = a.createGain();
        musicBus.gain.value = 1;
        musicBus.connect(musicGain);
        scheduleIteration(MUSIC[name], a.currentTime + 0.05, musicGen, musicBus);
    }

    function flushPending() {
        var a = ctx();
        if (pendingTrack && a && a.state === 'running') {
            var t = pendingTrack;
            pendingTrack = null;
            startTrackNow(t);
        }
    }

    function playMusic(name) {
        if (!MUSIC[name]) return;
        if (currentTrack === name) return;
        var a = ctx();
        if (!a) return;
        if (a.state !== 'running') {
            pendingTrack = name;
            a.resume().then(flushPending, function () {});
            return;
        }
        startTrackNow(name);
    }

    function now(offset) { var a = ctx(); return a ? a.currentTime + (offset || 0) : 0; }

    return {
        unlock: function () {
            var a = ctx();
            if (!a) return;
            if (a.state !== 'running') a.resume().then(flushPending, function () {});
            else flushPending();
        },
        // kept for callers that used to call TT.Audio.init() explicitly
        init: function () { this.unlock(); },
        isMuted: function () { return muted; },
        toggleMute: function () {
            muted = !muted;
            var a = ctx();
            if (a) masterGain.gain.setTargetAtTime(muted ? 0 : 0.85, a.currentTime, 0.02);
            return muted;
        },
        playMusic: playMusic,
        stopMusic: stopMusic,

        click: function () { if (!now()) return; playNote('pluck', 'A4', now(0.005), 0.08, 0.5, sfxGain); },

        correct: function () {
            var t = now(0.005); if (!t) return;
            playNote('bell', 'C5', t, 0.16, 0.75, sfxGain);
            playNote('bell', 'E5', t + 0.09, 0.16, 0.75, sfxGain);
            playNote('bell', 'G5', t + 0.18, 0.42, 0.8, sfxGain);
            shimmer(t + 0.05, 0.5, sfxGain);
        },

        wrong: function () {
            var t = now(0.005); if (!t) return;
            playNote('brass', 'Eb3', t, 0.26, 0.55, sfxGain);
            playNote('brass', 'A2', t, 0.26, 0.5, sfxGain);
            playNote('bass', 'D3', t + 0.14, 0.32, 0.5, sfxGain);
        },

        win: function () {
            var t = now(0.005); if (!t) return;
            var notes = ['C5', 'E5', 'G5', 'C6'];
            for (var i = 0; i < notes.length; i++) {
                playNote('brass', notes[i], t + i * 0.13, 0.28, 0.8, sfxGain);
                playNote('bell', notes[i], t + i * 0.13, 0.35, 0.5, sfxGain);
            }
            kick(t, 0.7, sfxGain);
            kick(t + 0.26, 0.6, sfxGain);
            shimmer(t + 0.4, 0.6, sfxGain);
            shimmer(t + 0.55, 0.5, sfxGain);
        },

        tryAgain: function () {
            var t = now(0.005); if (!t) return;
            playNote('pad', 'A3', t, 0.5, 0.4, sfxGain);
            playNote('pluck', 'F4', t, 0.3, 0.5, sfxGain);
            playNote('pluck', 'D4', t + 0.22, 0.4, 0.45, sfxGain);
        }
    };
})();
