// Tiny synthesized 8-bit style SFX via WebAudio -- no external sound files.
var CY = CY || {};
CY.Audio = (function () {
    var actx = null;
    function ctx() {
        if (!actx) {
            var AC = window.AudioContext || window.webkitAudioContext;
            actx = new AC();
        }
        return actx;
    }

    function tone(freq, start, dur, type, gain) {
        var a = ctx();
        var osc = a.createOscillator();
        var g = a.createGain();
        osc.type = type || 'square';
        osc.frequency.setValueAtTime(freq, a.currentTime + start);
        g.gain.setValueAtTime(0, a.currentTime + start);
        g.gain.linearRampToValueAtTime(gain || 0.15, a.currentTime + start + 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + start + dur);
        osc.connect(g).connect(a.destination);
        osc.start(a.currentTime + start);
        osc.stop(a.currentTime + start + dur + 0.02);
    }

    function noise(start, dur, gain) {
        var a = ctx();
        var bufferSize = a.sampleRate * dur;
        var buffer = a.createBuffer(1, bufferSize, a.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        var src = a.createBufferSource();
        src.buffer = buffer;
        var g = a.createGain();
        g.gain.setValueAtTime(gain || 0.2, a.currentTime + start);
        src.connect(g).connect(a.destination);
        src.start(a.currentTime + start);
    }

    return {
        unlock: function () {
            var a = ctx();
            if (a.state === 'suspended') a.resume();
        },
        select: function () { tone(440, 0, 0.06, 'square', 0.12); },
        confirm: function () { tone(523, 0, 0.08, 'square', 0.14); tone(659, 0.08, 0.1, 'square', 0.14); },
        tick: function () { tone(880, 0, 0.03, 'square', 0.08); },
        tickUrgent: function () { tone(1046, 0, 0.05, 'square', 0.12); },
        correct: function () {
            tone(523, 0, 0.09, 'square', 0.15);
            tone(659, 0.09, 0.09, 'square', 0.15);
            tone(784, 0.18, 0.16, 'square', 0.16);
        },
        wrong: function () {
            tone(220, 0, 0.14, 'sawtooth', 0.15);
            tone(160, 0.1, 0.2, 'sawtooth', 0.15);
        },
        rumble: function () {
            noise(0, 0.4, 0.18);
            tone(80, 0, 0.4, 'sawtooth', 0.1);
        },
        fanfare: function () {
            var notes = [523, 659, 784, 1046];
            for (var i = 0; i < notes.length; i++) tone(notes[i], i * 0.13, 0.18, 'square', 0.16);
        },
        sad: function () {
            var notes = [392, 349, 311, 261];
            for (var i = 0; i < notes.length; i++) tone(notes[i], i * 0.16, 0.22, 'triangle', 0.14);
        },
        roar: function () {
            noise(0, 0.5, 0.22);
            tone(90, 0, 0.5, 'sawtooth', 0.14);
            tone(60, 0.05, 0.5, 'sawtooth', 0.12);
        }
    };
})();
