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
        // Bright, long-ringing, high harmonic ratio -- a music-box / celesta
        // voice. This is the game's core "magic" timbre: melodies, twinkles,
        // and sparkle cascades all lean on it.
        chime: { ratio: 4.2,  index: 3.0, indexDecay: 0.03, iDec: 0.5,  atk: 0.001, dec: 0.6,  sus: 0.06, rel: 0.9,  gain: 0.24 },
        // Plucked, warm, quicker decay than chime -- the waltz's "oom-pah"
        // harmony and quick magical flourishes.
        harp:  { ratio: 2.0,  index: 1.8, indexDecay: 0.08, iDec: 0.25, atk: 0.002, dec: 0.35, sus: 0.08, rel: 0.5,  gain: 0.30 },
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

    // A quick burst of high-passed noise -- fairy-dust "sparkle" texture
    // layered under bells/chimes on delightful moments.
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

    // A soft, quickly-muffled noise puff -- a gentle "poof" of fizzled fairy
    // dust for a wrong answer, instead of a harsh buzzer. Kid-friendly: reads
    // clearly as "not quite" without ever sounding like a punishment.
    function poof(t, vel, bus) {
        var a = ctx();
        var s = a.createBufferSource(); s.buffer = noise();
        var lp = a.createBiquadFilter(); lp.type = 'lowpass';
        lp.frequency.setValueAtTime(2000, t);
        lp.frequency.exponentialRampToValueAtTime(280, t + 0.22);
        var g = a.createGain();
        g.gain.setValueAtTime(Math.max((vel || 0.3) * 0.4, 0.0001), t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
        s.connect(lp); lp.connect(g); g.connect(bus || sfxGain);
        s.start(t); s.stop(t + 0.26);
    }

    // A quick ascending or descending run of tiny chime grace-notes -- the
    // "twinkle" flourish used throughout (title sparkles, correct-answer
    // dings, win cascades). dir: 1 = ascending, -1 = descending.
    function sparkleRun(t, notes, step, vel, bus) {
        for (var i = 0; i < notes.length; i++) {
            playNote('chime', notes[i], t + i * step, step * 3, vel, bus);
        }
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

    // TITLE -- "Trixie's Waltz": a full 24-bar fairy-tale waltz in D major,
    // written in 3-beat bars (oom-pah-pah: bass on beat 1, harp chord-plucks
    // on beats 2 and 3). Form is AABA: two identical 8-bar verses (the second
    // gains a soft pad underneath for lift), then an 8-bar bridge that swells
    // with a fuller pad and a higher melodic peak before resolving back to
    // the top of the loop.
    (function () {
        var n = [];
        var BAR = 3; // beats per bar

        // chord per bar: [bass note, harp note 1, harp note 2]
        var CHORDS = [
            // verse A1 (bars 0-7): I - V - vi - IV - I - V - IV - I
            ['D2', 'F#4', 'A4'], ['A1', 'C#4', 'E4'], ['B1', 'D4', 'F#4'], ['G1', 'B3', 'D4'],
            ['D2', 'F#4', 'A4'], ['A1', 'C#4', 'E4'], ['G1', 'B3', 'D4'], ['D2', 'F#4', 'A4'],
            // verse A2 (bars 8-15): repeat, pad enters underneath
            ['D2', 'F#4', 'A4'], ['A1', 'C#4', 'E4'], ['B1', 'D4', 'F#4'], ['G1', 'B3', 'D4'],
            ['D2', 'F#4', 'A4'], ['A1', 'C#4', 'E4'], ['G1', 'B3', 'D4'], ['D2', 'F#4', 'A4'],
            // bridge (bars 16-23): vi - IV - I - V - vi - IV - V - I
            ['B1', 'D4', 'F#4'], ['G1', 'B3', 'D4'], ['D2', 'F#4', 'A4'], ['A1', 'C#4', 'E4'],
            ['B1', 'D4', 'F#4'], ['G1', 'B3', 'D4'], ['A1', 'C#4', 'E4'], ['D2', 'F#4', 'A4']
        ];
        for (var bar = 0; bar < CHORDS.length; bar++) {
            var beat = bar * BAR, ch = CHORDS[bar];
            seq(n, beat, 1.5, 'bass', ch[0], 0.42);
            seq(n, beat + 1, 0.9, 'harp', [ch[1], ch[2]], 0.26);
            seq(n, beat + 2, 0.9, 'harp', [ch[1], ch[2]], 0.24);
        }

        // melody (music-box "chime" voice) -- one flowing phrase across all
        // three sections, echoed verbatim in A2, then lifted higher in the
        // bridge before settling back down to loop cleanly.
        var MEL = [
            // [bar, beatOffsetInBar, durationBeats, note]
            [0, 0, 3, 'A4'],
            [1, 0, 1.5, 'G4'], [1, 1.5, 1.5, 'F#4'],
            [2, 0, 3, 'F#4'],
            [3, 0, 1.5, 'G4'], [3, 1.5, 1.5, 'A4'],
            [4, 0, 3, 'D5'],
            [5, 0, 1.5, 'C#5'], [5, 1.5, 1.5, 'B4'],
            [6, 0, 3, 'A4'],
            [7, 0, 3, 'D5'],

            [8, 0, 3, 'A4'],
            [9, 0, 1.5, 'G4'], [9, 1.5, 1.5, 'F#4'],
            [10, 0, 3, 'F#4'],
            [11, 0, 1.5, 'G4'], [11, 1.5, 1.5, 'A4'],
            [12, 0, 3, 'D5'],
            [13, 0, 1.5, 'C#5'], [13, 1.5, 1.5, 'B4'],
            [14, 0, 3, 'A4'],
            [15, 0, 3, 'D5'],

            [16, 0, 3, 'D5'],
            [17, 0, 1.5, 'B4'], [17, 1.5, 1.5, 'D5'],
            [18, 0, 3, 'F#5'],
            [19, 0, 1.5, 'E5'], [19, 1.5, 1.5, 'C#5'],
            [20, 0, 3, 'D5'],
            [21, 0, 3, 'B4'],
            [22, 0, 1.5, 'C#5'], [22, 1.5, 1.5, 'B4'],
            [23, 0, 3, 'A4']
        ];
        MEL.forEach(function (m) {
            seq(n, m[0] * BAR + m[1], m[2] * 0.92, 'chime', m[3], 0.34);
        });

        // pad swell: absent in A1 (keeps the opening light, like a music box),
        // enters under A2, fuller still under the bridge.
        seq(n, 24, 23.5, 'pad', ['D3', 'A3'], 0.15);
        seq(n, 48, 23.5, 'pad', ['D3', 'F#3', 'A3'], 0.19);

        // tiny ascending twinkle flourish at the start of each 8-bar phrase,
        // layered on top of that bar's downbeat as a decorative grace-note run
        [0, 24, 48].forEach(function (beat) {
            run(n, beat, 0.06, 'chime', ['D6', 'F#6', 'A6', 'D7'], 0.16, 0.18);
        });

        MUSIC.title = { bpm: 138, len: 72, loop: true, notes: n };
    })();

    // QUESTION -- soft, friendly anticipation bed. Deliberately quiet and
    // uneventful so it never feels like a countdown-to-doom for a kid, with
    // one small twinkle per loop to keep a touch of magic in the air.
    (function () {
        var n = [];
        seq(n, 0, 7.6, 'pad', ['D3', 'A3'], 0.12);
        run(n, 0, 2, 'pluck', ['D4', 'F#4', 'A4', 'F#4'], 0.14, 0.4);
        seq(n, 6, 0.6, 'chime', 'A5', 0.10);
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

        // A tiny two-note twinkle for button taps.
        click: function () {
            var t = now(0.003); if (!t) return;
            playNote('chime', 'A5', t, 0.08, 0.26, sfxGain);
            playNote('chime', 'D6', t + 0.03, 0.1, 0.2, sfxGain);
        },

        // A quick, quiet, randomly-pitched blip used to sync with Trixie's
        // dialogue as it types out -- the classic Animal Crossing-style
        // "chattering" voice, without any actual recorded/synthesized speech.
        talkBlip: function () {
            var t = now(0.001); if (!t) return;
            var freqHz = 640 + Math.random() * 260;
            playNote('pluck', freqHz, t, 0.045, 0.13, sfxGain);
        },

        // A bright bell+chime "ding-ding-ding" landing on a major triad, then
        // a quick upward sparkle flourish -- much more of a "magic happened"
        // moment than a plain three-note bell run.
        correct: function () {
            var t = now(0.005); if (!t) return;
            playNote('bell', 'C5', t, 0.14, 0.7, sfxGain);
            playNote('chime', 'C5', t, 0.3, 0.4, sfxGain);
            playNote('bell', 'E5', t + 0.08, 0.14, 0.72, sfxGain);
            playNote('chime', 'E5', t + 0.08, 0.3, 0.4, sfxGain);
            playNote('bell', 'G5', t + 0.16, 0.35, 0.78, sfxGain);
            playNote('chime', 'G5', t + 0.16, 0.5, 0.45, sfxGain);
            sparkleRun(t + 0.24, ['A5', 'B5', 'C#6'], 0.05, 0.28, sfxGain);
            shimmer(t + 0.05, 0.5, sfxGain);
        },

        // A gentle "poof" of fizzled fairy dust plus a soft descending pluck
        // -- clearly reads as "not quite," but never harsh or punishing.
        wrong: function () {
            var t = now(0.005); if (!t) return;
            playNote('pluck', 'A4', t, 0.18, 0.4, sfxGain);
            playNote('pluck', 'F#4', t + 0.1, 0.22, 0.38, sfxGain);
            poof(t + 0.05, 0.35, sfxGain);
        },

        // A magic wand "whoosh" (fast ascending harp run) landing on a big
        // bright chord, then a sparkle cascade trailing off like falling
        // fairy dust -- a proper celebratory fanfare, not just four notes.
        win: function () {
            var t = now(0.005); if (!t) return;
            var runNotes = ['D5', 'E5', 'F#5', 'G5', 'A5', 'B5', 'C#6', 'D6'];
            for (var i = 0; i < runNotes.length; i++) {
                playNote('harp', runNotes[i], t + i * 0.045, 0.12, 0.5, sfxGain);
            }
            var landT = t + runNotes.length * 0.045 + 0.05;
            ['D5', 'F#5', 'A5', 'D6'].forEach(function (note) {
                playNote('brass', note, landT, 0.5, 0.7, sfxGain);
                playNote('chime', note, landT, 0.9, 0.45, sfxGain);
            });
            kick(landT, 0.6, sfxGain);
            sparkleRun(landT + 0.15, ['D6', 'C#6', 'B5', 'A5', 'G5', 'F#5', 'E5', 'D5'], 0.09, 0.32, sfxGain);
            shimmer(landT + 0.05, 0.6, sfxGain);
            shimmer(landT + 0.3, 0.5, sfxGain);
            shimmer(landT + 0.55, 0.4, sfxGain);
        },

        // Warm and gentle, resolving on a major chord (never minor/somber)
        // -- encouraging, not a "failure" sound.
        tryAgain: function () {
            var t = now(0.005); if (!t) return;
            playNote('pad', 'A3', t, 0.6, 0.35, sfxGain);
            playNote('pluck', 'F#4', t, 0.3, 0.45, sfxGain);
            playNote('pluck', 'D4', t + 0.18, 0.35, 0.42, sfxGain);
            playNote('chime', 'A4', t + 0.32, 0.6, 0.3, sfxGain);
            shimmer(t + 0.4, 0.35, sfxGain);
        }
    };
})();
