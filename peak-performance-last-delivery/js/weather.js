// Peak Performance: Last Delivery -- weather overlays per leg (README.md
// sec 3-4/8: clear -> rain -> fog -> snow -> blizzard, one screen-space
// particle system reused with different tuning per leg, plus a fog-patch
// alpha pulse for leg 3 and full whiteout gusts for leg 5).
PPLD.Weather = {
    particles: [],
    type: 'clear',
    fogAlpha: 0,
    fogT: 0,
    whiteoutTimer: 4,
    whiteoutAlpha: 0,
    whiteoutFiredOnce: false,

    startLeg: function (legIndex) {
        var C = PPLD.CONST;
        var leg = C.LEGS[legIndex];
        this.type = leg.weather;
        this.particles = [];
        this.fogAlpha = 0;
        this.fogT = Math.random() * 10;
        this.whiteoutTimer = 5 + Math.random() * 3;
        this.whiteoutAlpha = 0;
        this.whiteoutFiredOnce = false;

        var count = 0;
        if (this.type === 'rain') count = 60;
        else if (this.type === 'snow') count = 70;
        else if (this.type === 'blizzard') count = 110;

        for (var i = 0; i < count; i++) {
            this.particles.push(this.spawnParticle(true));
        }
    },

    spawnParticle: function (randomY) {
        var C = PPLD.CONST;
        var isRain = this.type === 'rain';
        return {
            x: Math.random() * C.CANVAS_W,
            y: randomY ? Math.random() * C.CANVAS_H : -4,
            speed: isRain ? (220 + Math.random() * 140) : (40 + Math.random() * 70),
            drift: isRain ? -18 : (Math.random() * 40 - 20),
            len: isRain ? 8 + Math.random() * 8 : 0,
            size: isRain ? 1 : (1 + Math.random() * 2)
        };
    },

    // Returns a small events array so game.js can route a first-whiteout
    // sighting into Coach's hazard-sight trigger, same shape as the
    // entities.js events queue.
    update: function (dt) {
        var C = PPLD.CONST;
        var events = [];
        var i, p;
        for (i = 0; i < this.particles.length; i++) {
            p = this.particles[i];
            p.y += p.speed * dt;
            p.x += p.drift * dt;
            if (p.y > C.CANVAS_H) {
                this.particles[i] = this.spawnParticle(false);
            } else if (p.x < -10) p.x = C.CANVAS_W + 10;
            else if (p.x > C.CANVAS_W + 10) p.x = -10;
        }

        if (this.type === 'fog') {
            this.fogT += dt;
            this.fogAlpha = 0.28 + Math.sin(this.fogT * 0.35) * 0.16 +
                Math.sin(this.fogT * 0.9) * 0.06;
        }

        if (this.type === 'blizzard') {
            if (this.whiteoutAlpha > 0.02) {
                this.whiteoutTimer -= dt * 2.2; // fast pulse decay once triggered
                this.whiteoutAlpha = Math.max(0, Math.sin(Math.max(0, this.whiteoutTimer) * 1.6));
                if (this.whiteoutAlpha <= 0.02 && this.whiteoutTimer <= 0) {
                    this.whiteoutTimer = 6 + Math.random() * 5;
                    this.whiteoutAlpha = 0;
                }
            } else {
                this.whiteoutTimer -= dt;
                if (this.whiteoutTimer <= 0) {
                    this.whiteoutTimer = 1.4; // pulse "on" duration marker (see decay branch)
                    this.whiteoutAlpha = 0.05;
                    if (!this.whiteoutFiredOnce) {
                        this.whiteoutFiredOnce = true;
                        events.push({ type: 'hazard-sight', key: 'whiteout' });
                    }
                }
            }
        }

        return events;
    },

    // How hard the weather noise bed should blow, and a rough filter
    // colour for it (see audio.js setWeather).
    intensity: function () {
        if (this.type === 'rain') return 0.55;
        if (this.type === 'fog') return 0.25;
        if (this.type === 'snow') return 0.4;
        if (this.type === 'blizzard') return 0.75 + this.whiteoutAlpha * 0.4;
        return 0;
    },
    filterFreq: function () {
        if (this.type === 'rain') return 1400;
        if (this.type === 'snow' || this.type === 'blizzard') return 2200;
        return 700;
    },

    render: function (ctx) {
        var C = PPLD.CONST;
        var i, p;
        ctx.save();

        if (this.type === 'rain') {
            ctx.strokeStyle = 'rgba(210,225,240,0.55)';
            ctx.lineWidth = 1;
            for (i = 0; i < this.particles.length; i++) {
                p = this.particles[i];
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x + 3, p.y + p.len);
                ctx.stroke();
            }
        } else if (this.type === 'snow' || this.type === 'blizzard') {
            ctx.fillStyle = 'rgba(255,255,255,0.85)';
            for (i = 0; i < this.particles.length; i++) {
                p = this.particles[i];
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        if (this.type === 'fog' && this.fogAlpha > 0) {
            var grd = ctx.createLinearGradient(0, C.CANVAS_H * 0.3, 0, C.CANVAS_H);
            grd.addColorStop(0, 'rgba(220,225,230,0)');
            grd.addColorStop(1, 'rgba(220,225,230,' + this.fogAlpha + ')');
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, C.CANVAS_W, C.CANVAS_H);
        }

        if (this.type === 'blizzard' && this.whiteoutAlpha > 0.01) {
            ctx.fillStyle = 'rgba(255,255,255,' + Math.min(0.92, this.whiteoutAlpha) + ')';
            ctx.fillRect(0, 0, C.CANVAS_W, C.CANVAS_H);
        }

        ctx.restore();
    }
};
