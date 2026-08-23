// Peak Performance: Last Delivery -- Atari 2600 / Enduro-modelled
// soundscape via the Web Audio API (see README.md sec 7). Everything is
// synthesized, nothing is sampled -- a continuous pitch-shifting square
// wave for the engine, short square/noise bursts for events, and one
// sparse chiptune sting for the menus. No voice.
PPLD.Audio = {
    ctx: null,
    master: null,
    engineOsc: null,
    engineGain: null,
    weatherSource: null,
    weatherGain: null,
    weatherFilter: null,
    unlocked: false,

    unlock: function () {
        if (!this.ctx) {
            var AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return;
            this.ctx = new AC();
            this.master = this.ctx.createGain();
            this.master.gain.value = 0.55;
            this.master.connect(this.ctx.destination);
            this.noiseBuffer = this.makeNoiseBuffer(2);
            this.buildEngine();
            this.buildWeatherBed();
        }
        if (this.ctx.state === 'suspended') this.ctx.resume();
        this.unlocked = true;
    },

    makeNoiseBuffer: function (seconds) {
        var rate = this.ctx.sampleRate;
        var buf = this.ctx.createBuffer(1, rate * seconds, rate);
        var data = buf.getChannelData(0);
        for (var i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        return buf;
    },

    noiseSource: function () {
        var src = this.ctx.createBufferSource();
        src.buffer = this.noiseBuffer;
        src.loop = true;
        return src;
    },

    // --- continuous engine drone: the single most important sound ---
    buildEngine: function () {
        var ctx = this.ctx;
        this.engineOsc = ctx.createOscillator();
        this.engineOsc.type = 'square';
        this.engineOsc.frequency.value = 70;
        this.engineGain = ctx.createGain();
        this.engineGain.gain.value = 0;
        this.engineOsc.connect(this.engineGain);
        this.engineGain.connect(this.master);
        this.engineOsc.start();
    },

    setEngine: function (speedFrac, running) {
        if (!this.engineOsc) return;
        var t = this.ctx.currentTime;
        var freq = 60 + Math.max(0, Math.min(1, speedFrac)) * 210;
        this.engineOsc.frequency.setTargetAtTime(freq, t, 0.06);
        this.engineGain.gain.setTargetAtTime(running ? 0.10 : 0, t, 0.15);
    },

    // --- weather noise bed ---
    buildWeatherBed: function () {
        var ctx = this.ctx;
        this.weatherSource = this.noiseSource();
        this.weatherFilter = ctx.createBiquadFilter();
        this.weatherFilter.type = 'bandpass';
        this.weatherFilter.frequency.value = 900;
        this.weatherFilter.Q.value = 0.7;
        this.weatherGain = ctx.createGain();
        this.weatherGain.gain.value = 0;
        this.weatherSource.connect(this.weatherFilter);
        this.weatherFilter.connect(this.weatherGain);
        this.weatherGain.connect(this.master);
        this.weatherSource.start();
    },

    setWeather: function (intensity, freq) {
        if (!this.weatherGain) return;
        var t = this.ctx.currentTime;
        this.weatherGain.gain.setTargetAtTime(intensity * 0.09, t, 0.4);
        this.weatherFilter.frequency.setTargetAtTime(freq || 900, t, 0.6);
    },

    // --- one-shot events ---
    playCollision: function (big) {
        if (!this.ctx) return;
        var ctx = this.ctx, t = ctx.currentTime;
        var osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(big ? 90 : 140, t);
        osc.frequency.exponentialRampToValueAtTime(big ? 35 : 60, t + 0.22);
        var g = ctx.createGain();
        g.gain.setValueAtTime(big ? 0.5 : 0.32, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + (big ? 0.32 : 0.2));
        osc.connect(g); g.connect(this.master);
        osc.start(t); osc.stop(t + 0.35);
    },

    playPassBlip: function () {
        if (!this.ctx) return;
        var ctx = this.ctx, t = ctx.currentTime;
        this.tone(660, t, 0.06, 0.18);
        this.tone(880, t + 0.06, 0.08, 0.16);
    },

    playMilestoneChime: function () {
        if (!this.ctx) return;
        var t = this.ctx.currentTime;
        var notes = [523.25, 659.25, 783.99, 1046.5];
        for (var i = 0; i < notes.length; i++) {
            this.tone(notes[i], t + i * 0.09, 0.12, 0.2);
        }
    },

    playRadioSting: function () {
        if (!this.ctx) return;
        var ctx = this.ctx, t = ctx.currentTime;
        var src = this.noiseSource();
        var filt = ctx.createBiquadFilter();
        filt.type = 'bandpass';
        filt.frequency.value = 1800;
        filt.Q.value = 1.4;
        var g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.22, t + 0.03);
        g.gain.setTargetAtTime(0.05, t + 0.05, 0.05);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
        src.connect(filt); filt.connect(g); g.connect(this.master);
        src.start(t); src.stop(t + 0.32);
    },

    tone: function (freq, startTime, dur, vol) {
        var ctx = this.ctx;
        var osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.value = freq;
        var g = ctx.createGain();
        g.gain.setValueAtTime(vol, startTime);
        g.gain.exponentialRampToValueAtTime(0.001, startTime + dur);
        osc.connect(g); g.connect(this.master);
        osc.start(startTime); osc.stop(startTime + dur + 0.02);
    },

    // --- sparse two-square-channel + noise-percussion title jingle ---
    playTitleJingle: function () {
        if (!this.ctx) return;
        var ctx = this.ctx, t = ctx.currentTime + 0.05;
        var beat = 0.22;
        var E = 659.25, G = 783.99, C = 1046.5, D = 1174.66;
        var melody = [E, E, E, E, E, E, E, G, C, D, E];
        var i, when = t;
        for (i = 0; i < melody.length; i++) {
            this.tone(melody[i], when, beat * 0.85, 0.14);
            if (i % 2 === 0) this.percussionTick(when);
            when += beat;
        }
    },

    percussionTick: function (when) {
        var ctx = this.ctx;
        var src = this.noiseSource();
        var filt = ctx.createBiquadFilter();
        filt.type = 'highpass';
        filt.frequency.value = 4000;
        var g = ctx.createGain();
        g.gain.setValueAtTime(0.12, when);
        g.gain.exponentialRampToValueAtTime(0.001, when + 0.06);
        src.connect(filt); filt.connect(g); g.connect(this.master);
        src.start(when); src.stop(when + 0.08);
    }
};
