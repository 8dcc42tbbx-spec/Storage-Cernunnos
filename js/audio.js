// Synthesized 16-bit-era soundtrack -- no audio files, everything is generated
// at runtime. The voice model is 2-operator FM (one sine modulator driving a
// sine carrier's frequency), which is the core of the Yamaha YM2612 chip in the
// Sega Genesis. That's why this lands closer to Golden Axe / Streets of Rage
// than to the plain square-wave bleeps of an NES-era 8-bit soundtrack.
//
// The other half of the FM sound is the modulation-index envelope: a bright,
// buzzy attack that decays to a mellower sustain. Without that, FM just sounds
// like a detuned sine. Every instrument below sets it deliberately.
var CY = CY || {};
CY.Audio = (function () {
    var actx = null;
    var masterGain, musicGain, sfxGain;
    var noiseBuf = null;
    var musicBus = null;      // per-track bus so stopping a track kills it cleanly
    var musicTimer = null;
    var musicGen = 0;         // bumped on stop; stale loop callbacks check it
    var currentTrack = null;
    var pendingTrack = null;  // track waiting on the browser's autoplay unlock
    var muted = false;

    function ctx() {
        if (!actx) {
            var AC = window.AudioContext || window.webkitAudioContext;
            actx = new AC();
            masterGain = actx.createGain();
            masterGain.gain.value = 0.85;
            masterGain.connect(actx.destination);

            musicGain = actx.createGain();
            musicGain.gain.value = 0.62;
            musicGain.connect(masterGain);

            sfxGain = actx.createGain();
            sfxGain.gain.value = 1.0;
            sfxGain.connect(masterGain);
        }
        return actx;
    }

    // ---- note names -> frequency -------------------------------------
    var SEMI = {
        'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5,
        'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
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
            var n = a.sampleRate * 2;
            noiseBuf = a.createBuffer(1, n, a.sampleRate);
            var d = noiseBuf.getChannelData(0);
            for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
        }
        return noiseBuf;
    }

    // ---- instruments ---------------------------------------------------
    // ratio: modulator freq / carrier freq (integer ratios = harmonic/brassy,
    //        non-integer = bell-like and metallic)
    // index: modulation depth at attack; indexDecay: what it falls to
    var INST = {
        bell:    { ratio: 3.5,  index: 2.6, indexDecay: 0.03, iDec: 0.45, atk: 0.002, dec: 0.55, sus: 0.12, rel: 0.7,  gain: 0.30 },
        lead:    { ratio: 2.0,  index: 1.9, indexDecay: 0.14, iDec: 0.30, atk: 0.010, dec: 0.30, sus: 0.55, rel: 0.35, gain: 0.30, spread: 5 },
        brass:   { ratio: 1.0,  index: 1.7, indexDecay: 0.40, iDec: 0.22, atk: 0.025, dec: 0.14, sus: 0.78, rel: 0.14, gain: 0.34, spread: 7 },
        bass:    { ratio: 1.0,  index: 1.3, indexDecay: 0.12, iDec: 0.14, atk: 0.004, dec: 0.12, sus: 0.60, rel: 0.10, gain: 0.50 },
        pluck:   { ratio: 2.0,  index: 2.2, indexDecay: 0.04, iDec: 0.18, atk: 0.002, dec: 0.26, sus: 0.04, rel: 0.22, gain: 0.32 },
        pad:     { ratio: 1.005, index: 0.7, indexDecay: 0.55, iDec: 1.30, atk: 0.45, dec: 0.70, sus: 0.72, rel: 1.30, gain: 0.20, spread: 10 },
        organ:   { ratio: 2.0,  index: 0.9, indexDecay: 0.65, iDec: 0.90, atk: 0.06,  dec: 0.35, sus: 0.80, rel: 0.55, gain: 0.26, spread: 4 },
        toll:    { ratio: 1.41, index: 3.4, indexDecay: 0.02, iDec: 1.60, atk: 0.003, dec: 1.70, sus: 0.04, rel: 1.60, gain: 0.42 }
    };

    function fmNote(inst, f, t, dur, vel, bus) {
        var a = ctx();
        var p = INST[inst] || INST.lead;
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

    // Renders one note, doubling it detuned for instruments with `spread`
    // (cents) so leads and pads sit wider than a single bare oscillator.
    function playNote(inst, note, t, dur, vel, bus) {
        var p = INST[inst] || INST.lead;
        var f = typeof note === 'number' ? note : freq(note);
        if (p.spread) {
            var d = Math.pow(2, p.spread / 1200);
            fmNote(inst, f * d, t, dur, (vel || 1) * 0.55, bus);
            fmNote(inst, f / d, t, dur, (vel || 1) * 0.55, bus);
        } else {
            fmNote(inst, f, t, dur, vel, bus);
        }
    }

    // ---- drums ---------------------------------------------------------
    function kick(t, vel, bus) {
        var a = ctx();
        var o = a.createOscillator(), g = a.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(150, t);
        o.frequency.exponentialRampToValueAtTime(45, t + 0.08);
        g.gain.setValueAtTime(Math.max(vel || 0.9, 0.0001), t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
        o.connect(g); g.connect(bus || sfxGain);
        o.start(t); o.stop(t + 0.32);
    }

    function snare(t, vel, bus) {
        var a = ctx();
        var s = a.createBufferSource(); s.buffer = noise();
        var bp = a.createBiquadFilter(); bp.type = 'bandpass';
        bp.frequency.value = 1900; bp.Q.value = 0.8;
        var g = a.createGain();
        g.gain.setValueAtTime(Math.max((vel || 0.7) * 0.8, 0.0001), t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
        s.connect(bp); bp.connect(g); g.connect(bus || sfxGain);
        s.start(t); s.stop(t + 0.2);

        var o = a.createOscillator(), og = a.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(190, t);
        og.gain.setValueAtTime(Math.max((vel || 0.7) * 0.35, 0.0001), t);
        og.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
        o.connect(og); og.connect(bus || sfxGain);
        o.start(t); o.stop(t + 0.12);
    }

    function hat(t, vel, bus, open) {
        var a = ctx();
        var s = a.createBufferSource(); s.buffer = noise();
        var hp = a.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 7500;
        var g = a.createGain();
        var d = open ? 0.22 : 0.05;
        g.gain.setValueAtTime(Math.max((vel || 0.4) * 0.35, 0.0001), t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + d);
        s.connect(hp); hp.connect(g); g.connect(bus || sfxGain);
        s.start(t); s.stop(t + d + 0.02);
    }

    function timpani(t, vel, bus, f) {
        var a = ctx();
        var o = a.createOscillator(), g = a.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(f || 90, t);
        o.frequency.exponentialRampToValueAtTime((f || 90) * 0.75, t + 0.5);
        g.gain.setValueAtTime(Math.max(vel || 0.7, 0.0001), t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
        o.connect(g); g.connect(bus || sfxGain);
        o.start(t); o.stop(t + 0.95);
        var s = a.createBufferSource(); s.buffer = noise();
        var lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 400;
        var ng = a.createGain();
        ng.gain.setValueAtTime(Math.max((vel || 0.7) * 0.5, 0.0001), t);
        ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
        s.connect(lp); lp.connect(ng); ng.connect(bus || sfxGain);
        s.start(t); s.stop(t + 0.14);
    }

    function drum(name, t, vel, bus) {
        if (name === 'kick') kick(t, vel, bus);
        else if (name === 'snare') snare(t, vel, bus);
        else if (name === 'hat') hat(t, vel, bus, false);
        else if (name === 'hatO') hat(t, vel, bus, true);
        else if (name === 'timp') timpani(t, vel, bus, 90);
        else if (name === 'timpLo') timpani(t, vel, bus, 62);
    }

    // ---- track building helpers ---------------------------------------
    // A note is [beat, durationBeats, instrument, pitch, velocity].
    function seq(out, beat, dur, inst, pitches, vel) {
        (typeof pitches === 'string' ? [pitches] : pitches).forEach(function (p) {
            out.push([beat, dur, inst, p, vel === undefined ? 1 : vel]);
        });
        return out;
    }
    // Repeats a pitch pattern as consecutive steps starting at `beat`.
    function run(out, beat, step, inst, pitches, vel, dur) {
        pitches.forEach(function (p, i) {
            if (p) out.push([beat + i * step, dur || step, inst, p, vel === undefined ? 1 : vel]);
        });
        return out;
    }
    // Repeats a drum hit every `every` beats, `count` times.
    function beatline(out, beat, every, count, name, vel) {
        for (var i = 0; i < count; i++) out.push([beat + i * every, 0, 'drum', name, vel]);
        return out;
    }

    // ---- TRACKS ---------------------------------------------------------
    var MUSIC = {};

    // TITLE -- mystical opening credits.
    // D Phrygian dominant (D Eb F# G A Bb C): the raised 3rd over a flat 2nd is
    // the "ancient/eastern" colour, and it keeps the whole cue modal rather than
    // major-key heroic. Slow, sparse, bell-led.
    (function () {
        var n = [];
        var ARP = ['D4', 'A4', 'D5', 'F#5', 'A5', 'F#5', 'D5', 'A4'];
        // bass drone moving i - bVI - bVII - i
        run(n, 0, 4, 'bass', ['D2', 'D2', 'Bb1', 'C2', 'D2', 'D2', 'Bb1', 'A1'], 0.55, 3.8);
        // sustained pad beds
        seq(n, 0, 7.8, 'pad', ['D3', 'A3'], 0.30);
        seq(n, 8, 3.8, 'pad', ['Bb2', 'F3'], 0.30);
        seq(n, 12, 3.8, 'pad', ['C3', 'G3'], 0.30);
        seq(n, 16, 7.8, 'pad', ['D3', 'A3'], 0.30);
        seq(n, 24, 3.8, 'pad', ['Bb2', 'F3'], 0.30);
        seq(n, 28, 3.8, 'pad', ['A2', 'E3'], 0.30);
        // bell arpeggio on bars 1-2 and 5-6, leaving room for the melody
        [0, 4, 16, 20].forEach(function (b) { run(n, b, 0.5, 'bell', ARP, 0.34); });
        // haunting melody, entering bar 3
        run(n, 8, 1, 'lead', [null, null, 'Bb4', 'A4'], 0.5);
        seq(n, 8, 2, 'lead', 'A4', 0.5);
        seq(n, 12, 2, 'lead', 'G4', 0.5);
        seq(n, 14, 2, 'lead', 'F#4', 0.5);
        seq(n, 16, 4, 'lead', 'D4', 0.45);
        run(n, 20, 1, 'lead', ['F#4', 'G4'], 0.5);
        seq(n, 22, 2, 'lead', 'A4', 0.5);
        seq(n, 24, 2, 'lead', 'Bb4', 0.5);
        seq(n, 26, 2, 'lead', 'A4', 0.5);
        // the Eb-D half step home is the signature Phrygian cadence
        run(n, 28, 1, 'lead', ['G4', 'F#4', 'Eb4', 'D4'], 0.5);
        MUSIC.title = { bpm: 84, len: 32, loop: true, notes: n };
    })();

    // QUESTION -- tension bed under the answer window. Deliberately almost
    // featureless: a low drone, a heartbeat pulse and a sparse tick. It has to
    // sit far enough back that the host can talk straight over it, so nothing
    // here carries a melody that would compete for attention.
    (function () {
        var n = [];
        seq(n, 0, 7.6, 'pad', ['D2', 'A2'], 0.18);
        seq(n, 0, 7.6, 'pad', ['D3'], 0.10);
        beatline(n, 0, 2, 4, 'kick', 0.30);       // slow heartbeat
        run(n, 1, 2, 'pluck', ['A4', 'A4', 'A4', 'A4'], 0.10, 0.3);
        MUSIC.question = { bpm: 96, len: 8, loop: true, notes: n };
    })();

    // ENDING: GREAT ESCAPE -- triumphant Genesis-style fanfare.
    // Shifts to D major, the tonal payoff after a whole game in the modal world.
    (function () {
        var n = [];
        run(n, 0, 4, 'bass', ['D2', 'A1', 'B1', 'G1', 'D2', 'A1', 'G1', 'A1'], 0.6, 3.8);
        // brass fanfare, phrase A
        run(n, 0, 0.5, 'brass', ['D4', 'F#4', 'A4'], 0.85);
        seq(n, 1.5, 1.5, 'brass', ['D5', 'F#5'], 0.9);
        run(n, 3, 0.5, 'brass', ['C#5', 'D5'], 0.85);
        seq(n, 4, 2, 'brass', ['A4', 'C#5'], 0.85);
        seq(n, 6, 2, 'brass', ['B4', 'D5'], 0.85);
        seq(n, 8, 1.5, 'brass', ['G4', 'B4'], 0.85);
        run(n, 9.5, 0.5, 'brass', ['A4', 'B4'], 0.8);
        seq(n, 10.5, 1.5, 'brass', ['D5', 'F#5'], 0.9);
        seq(n, 12, 4, 'brass', ['A4', 'D5', 'F#5'], 0.9);
        // phrase B, climbing an octave
        run(n, 16, 0.5, 'brass', ['D5', 'E5', 'F#5', 'G5'], 0.85);
        seq(n, 18, 2, 'brass', ['A5', 'D5'], 0.9);
        seq(n, 20, 2, 'brass', ['F#5', 'A4'], 0.85);
        seq(n, 22, 2, 'brass', ['G5', 'B4'], 0.85);
        run(n, 24, 0.5, 'brass', ['F#5', 'E5'], 0.85);
        seq(n, 25, 1, 'brass', ['D5'], 0.85);
        seq(n, 26, 2, 'brass', ['A4', 'C#5'], 0.85);
        seq(n, 28, 4, 'brass', ['D4', 'F#4', 'A4', 'D5'], 0.95);
        // bell sparkle over the held final chord
        run(n, 28, 0.5, 'bell', ['D5', 'F#5', 'A5', 'D6'], 0.5);
        // drive
        beatline(n, 0, 2, 16, 'kick', 0.9);
        beatline(n, 1, 2, 16, 'snare', 0.6);
        beatline(n, 0, 0.5, 64, 'hat', 0.3);
        MUSIC.endGreat = { bpm: 138, len: 32, loop: true, notes: n };
    })();

    // ENDING: NARROW ESCAPE -- tiptoeing away. Stays in D minor, quiet plucks,
    // resolving up to F major at the end: relief, but not a victory lap.
    (function () {
        var n = [];
        run(n, 0, 4, 'bass', ['D2', 'D2', 'Bb1', 'C2', 'D2', 'F2', 'C2', 'D2'], 0.5, 3.6);
        var fig = ['D4', 'F4', 'A4', 'F4'];
        [0, 2, 4, 6].forEach(function (b) { run(n, b, 0.5, 'pluck', fig, 0.55); });
        [8, 10].forEach(function (b) { run(n, b, 0.5, 'pluck', ['Bb3', 'D4', 'F4', 'D4'], 0.55); });
        [12, 14].forEach(function (b) { run(n, b, 0.5, 'pluck', ['C4', 'E4', 'G4', 'E4'], 0.55); });
        [16, 18].forEach(function (b) { run(n, b, 0.5, 'pluck', fig, 0.55); });
        [20, 22].forEach(function (b) { run(n, b, 0.5, 'pluck', ['F4', 'A4', 'C5', 'A4'], 0.55); });
        [24, 26].forEach(function (b) { run(n, b, 0.5, 'pluck', ['C4', 'G4', 'Bb4', 'G4'], 0.55); });
        [28, 30].forEach(function (b) { run(n, b, 0.5, 'pluck', ['F4', 'A4', 'C5', 'F5'], 0.6); });
        seq(n, 8, 3.6, 'pad', ['Bb2', 'F3'], 0.26);
        seq(n, 12, 3.6, 'pad', ['C3', 'G3'], 0.26);
        seq(n, 20, 3.6, 'pad', ['F2', 'C3'], 0.26);
        seq(n, 28, 3.6, 'pad', ['F2', 'A2', 'C3'], 0.30);
        run(n, 16, 2, 'lead', ['D4', 'F4', 'A4', 'G4'], 0.42);
        run(n, 24, 2, 'lead', ['Bb4', 'A4', 'F4', 'F4'], 0.42);
        beatline(n, 0, 4, 8, 'kick', 0.5);
        beatline(n, 2, 4, 8, 'hat', 0.22);
        MUSIC.endNarrow = { bpm: 104, len: 32, loop: true, notes: n };
    })();

    // ENDING: CAUGHT -- Chopin's Marche funebre (Piano Sonata No. 2, Op. 35,
    // 1839; public domain), rendered on FM organ + tolling bell. Bb minor.
    (function () {
        var n = [];
        var M = 0.9; // melody velocity
        // The famous theme: repeated tonic with the dotted limp, then the
        // Db-C-Bb sigh, then the descent Gb-F.
        n.push([0, 1, 'organ', 'Bb3', M]);
        n.push([1, 0.75, 'organ', 'Bb3', M]);
        n.push([1.75, 0.25, 'organ', 'Bb3', M]);
        n.push([2, 1, 'organ', 'Bb3', M]);
        n.push([3, 1, 'organ', 'Db4', M]);
        n.push([4, 1.5, 'organ', 'C4', M]);
        n.push([5.5, 0.5, 'organ', 'Bb3', M]);
        n.push([6, 1, 'organ', 'Bb3', M]);
        n.push([7, 1, 'organ', 'Ab3', M]);
        n.push([8, 1, 'organ', 'Gb3', M]);
        n.push([9, 1, 'organ', 'F3', M]);
        n.push([10, 0.75, 'organ', 'Gb3', M]);
        n.push([10.75, 0.25, 'organ', 'F3', M]);
        n.push([11, 1, 'organ', 'Gb3', M]);
        n.push([12, 3, 'organ', 'Bb3', M]);
        // harmony underneath
        seq(n, 0, 2.8, 'pad', ['Bb2', 'Db3', 'F3'], 0.34);
        seq(n, 3, 2.8, 'pad', ['Bb2', 'Db3', 'Gb3'], 0.34);
        seq(n, 6, 2.8, 'pad', ['Gb2', 'Bb2', 'Db3'], 0.34);
        seq(n, 9, 2.8, 'pad', ['F2', 'Ab2', 'C3'], 0.34);
        seq(n, 12, 3.6, 'pad', ['Bb2', 'Db3', 'F3'], 0.36);
        // funeral bell + slow drum tread
        run(n, 0, 4, 'toll', ['Bb1', 'Bb1', 'Bb1', 'Bb1'], 0.5, 3.5);
        beatline(n, 0, 2, 8, 'timpLo', 0.55);
        MUSIC.endCaught = { bpm: 56, len: 16, loop: true, notes: n };
    })();

    // ---- music scheduling ----------------------------------------------
    function scheduleIteration(track, startTime, gen, bus) {
        var beat = 60 / track.bpm;
        track.notes.forEach(function (ev) {
            var t = startTime + ev[0] * beat;
            var dur = ev[1] * beat;
            if (ev[2] === 'drum') drum(ev[3], t, ev[4], bus);
            else playNote(ev[2], ev[3], t, dur, ev[4], bus);
        });
        if (track.loop) {
            var loopDur = track.len * beat;
            var next = startTime + loopDur;
            var waitMs = (next - ctx().currentTime - 0.3) * 1000;
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
            // Fade and disconnect the whole bus: already-scheduled notes keep
            // running but are routed nowhere, so they die silently.
            var a = ctx(), b = musicBus;
            try {
                b.gain.cancelScheduledValues(a.currentTime);
                b.gain.setValueAtTime(b.gain.value, a.currentTime);
                b.gain.linearRampToValueAtTime(0, a.currentTime + 0.25);
            } catch (e) { /* bus already torn down */ }
            setTimeout(function () { try { b.disconnect(); } catch (e) {} }, 500);
            musicBus = null;
        }
    }

    function startTrackNow(name) {
        stopMusic();
        var a = ctx();
        currentTrack = name;
        musicBus = a.createGain();
        musicBus.gain.value = 1;
        musicBus.connect(musicGain);
        scheduleIteration(MUSIC[name], a.currentTime + 0.08, musicGen, musicBus);
    }

    // If the browser hasn't allowed audio yet, remember what we wanted to play
    // and start it the moment a real user gesture unlocks the context. Without
    // this, notes get scheduled against a clock that isn't running and then all
    // fire at once on resume.
    function flushPending() {
        if (pendingTrack && ctx().state === 'running') {
            var t = pendingTrack;
            pendingTrack = null;
            startTrackNow(t);
        }
    }

    function playMusic(name) {
        if (!MUSIC[name]) return;
        if (currentTrack === name) return; // already playing, don't restart
        var a = ctx();
        if (a.state !== 'running') {
            pendingTrack = name;
            a.resume().then(flushPending, function () { /* needs a gesture first */ });
            return;
        }
        startTrackNow(name);
    }

    // ---- SFX -------------------------------------------------------------
    function blip(f, t, dur, type, vel) {
        var a = ctx();
        var o = a.createOscillator(), g = a.createGain();
        o.type = type || 'square';
        o.frequency.setValueAtTime(f, a.currentTime + t);
        g.gain.setValueAtTime(0.0001, a.currentTime + t);
        g.gain.exponentialRampToValueAtTime(vel || 0.14, a.currentTime + t + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + t + dur);
        o.connect(g); g.connect(sfxGain);
        o.start(a.currentTime + t); o.stop(a.currentTime + t + dur + 0.02);
    }

    function now(offset) { return ctx().currentTime + (offset || 0); }

    return {
        unlock: function () {
            var a = ctx();
            if (a.state !== 'running') a.resume().then(flushPending, function () {});
            else flushPending();
        },
        isMuted: function () { return muted; },
        nowPlaying: function () { return currentTrack || pendingTrack; },
        toggleMute: function () {
            muted = !muted;
            var a = ctx();
            masterGain.gain.setTargetAtTime(muted ? 0 : 0.85, a.currentTime, 0.02);
            return muted;
        },
        playMusic: playMusic,
        stopMusic: stopMusic,

        // --- interface blips ---
        select: function () { blip(440, 0, 0.06, 'square', 0.12); },
        confirm: function () { blip(523, 0, 0.07, 'square', 0.13); blip(659, 0.07, 0.1, 'square', 0.13); },
        tick: function () { blip(880, 0, 0.03, 'square', 0.06); },
        tickUrgent: function () { blip(1046, 0, 0.05, 'square', 0.1); },

        // --- cyclops reactions ---
        // Pleased: a warm approving rumble under a rising open fifth.
        cyclopsPleased: function () {
            var t = now(0.01);
            playNote('bass', 'D2', t, 0.5, 0.5, sfxGain);
            playNote('brass', 'D4', t + 0.04, 0.22, 0.6, sfxGain);
            playNote('brass', 'A4', t + 0.16, 0.30, 0.6, sfxGain);
            playNote('bell', 'D5', t + 0.30, 0.5, 0.5, sfxGain);
        },
        // Angry: detuned minor-second growl + a downward sub sweep and noise.
        cyclopsAngry: function () {
            var a = ctx(), t = now(0.01);
            playNote('bass', 'C2', t, 0.55, 0.75, sfxGain);
            playNote('bass', 'B1', t, 0.55, 0.75, sfxGain);
            var o = a.createOscillator(), g = a.createGain();
            o.type = 'sawtooth';
            o.frequency.setValueAtTime(150, t);
            o.frequency.exponentialRampToValueAtTime(42, t + 0.5);
            g.gain.setValueAtTime(0.22, t);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
            o.connect(g); g.connect(sfxGain);
            o.start(t); o.stop(t + 0.6);
            var s = a.createBufferSource(); s.buffer = noise();
            var lp = a.createBiquadFilter(); lp.type = 'lowpass';
            lp.frequency.setValueAtTime(1400, t);
            lp.frequency.exponentialRampToValueAtTime(240, t + 0.45);
            var ng = a.createGain();
            ng.gain.setValueAtTime(0.16, t);
            ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
            s.connect(lp); lp.connect(ng); ng.connect(sfxGain);
            s.start(t); s.stop(t + 0.55);
        },
        // Laugh: descending staccato bursts -- a cackle.
        cyclopsLaugh: function () {
            var t = now(0.01);
            var p = ['A3', 'F3', 'A3', 'F3', 'D3'];
            for (var i = 0; i < p.length; i++) {
                playNote('brass', p[i], t + i * 0.13, 0.09, 0.65, sfxGain);
            }
            playNote('bass', 'D2', t, 0.7, 0.45, sfxGain);
        },
        // Roar: full-throated, used when the cyclops first appears.
        cyclopsRoar: function () {
            var a = ctx(), t = now(0.01);
            var o = a.createOscillator(), g = a.createGain();
            o.type = 'sawtooth';
            o.frequency.setValueAtTime(110, t);
            o.frequency.exponentialRampToValueAtTime(58, t + 0.15);
            o.frequency.exponentialRampToValueAtTime(38, t + 0.75);
            g.gain.setValueAtTime(0.0001, t);
            g.gain.exponentialRampToValueAtTime(0.26, t + 0.06);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
            o.connect(g); g.connect(sfxGain);
            o.start(t); o.stop(t + 0.85);
            var s = a.createBufferSource(); s.buffer = noise();
            var bp = a.createBiquadFilter(); bp.type = 'bandpass';
            bp.frequency.setValueAtTime(900, t);
            bp.frequency.exponentialRampToValueAtTime(180, t + 0.7);
            bp.Q.value = 1.2;
            var ng = a.createGain();
            ng.gain.setValueAtTime(0.0001, t);
            ng.gain.exponentialRampToValueAtTime(0.22, t + 0.05);
            ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
            s.connect(bp); bp.connect(ng); ng.connect(sfxGain);
            s.start(t); s.stop(t + 0.85);
            timpani(t, 0.8, sfxGain, 70);
        },
        // Snore: slow comic inhale/exhale.
        cyclopsSnore: function () {
            var a = ctx(), t = now(0.01);
            var s = a.createBufferSource(); s.buffer = noise();
            var lp = a.createBiquadFilter(); lp.type = 'lowpass';
            lp.frequency.setValueAtTime(300, t);
            lp.frequency.linearRampToValueAtTime(900, t + 0.5);
            lp.frequency.linearRampToValueAtTime(260, t + 1.1);
            var g = a.createGain();
            g.gain.setValueAtTime(0.0001, t);
            g.gain.linearRampToValueAtTime(0.2, t + 0.5);
            g.gain.linearRampToValueAtTime(0.0001, t + 1.15);
            s.connect(lp); lp.connect(g); g.connect(sfxGain);
            s.start(t); s.stop(t + 1.2);
            playNote('bass', 'D2', t, 0.9, 0.3, sfxGain);
        },

        // --- verdicts (called alongside the cyclops reaction) ---
        correct: function () {
            var t = now(0.01);
            playNote('bell', 'D5', t, 0.18, 0.7, sfxGain);
            playNote('bell', 'F#5', t + 0.09, 0.18, 0.7, sfxGain);
            playNote('bell', 'A5', t + 0.18, 0.45, 0.75, sfxGain);
        },
        wrong: function () {
            var t = now(0.01);
            playNote('brass', 'Eb3', t, 0.3, 0.6, sfxGain);
            playNote('brass', 'A2', t, 0.3, 0.6, sfxGain);
            playNote('brass', 'D3', t + 0.16, 0.42, 0.55, sfxGain);
        }
    };
})();
