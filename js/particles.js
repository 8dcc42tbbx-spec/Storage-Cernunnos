// Postie Run - Particle System
PR.Particles = {
    pool: [],
    MAX_PARTICLES: 500,
    stampMarks: [],

    init: function() {
        this.pool = [];
        this.stampMarks = [];
        for (var i = 0; i < this.MAX_PARTICLES; i++) {
            this.pool.push({
                alive: false, x: 0, y: 0, vx: 0, vy: 0,
                life: 0, maxLife: 0, size: 1,
                color: '#FFFFFF', gravity: 0, friction: 1,
                rotation: 0, rotSpeed: 0, type: 'circle', score: 0
            });
        }
    },

    _getParticle: function() {
        for (var i = 0; i < this.pool.length; i++) {
            if (!this.pool[i].alive) return this.pool[i];
        }
        return null;
    },

    emit: function(x, y, preset) {
        var presets = {
            explosion: { count: 16, speed: [1, 3.5], angle: [0, Math.PI * 2],
                life: [10, 25], size: [1, 3], colors: ['#FF2200','#FF6600','#FFCC00','#FFFFFF'],
                gravity: 0.1, friction: 0.96, type: 'circle' },
            spark: { count: 6, speed: [2, 5], angle: [0, Math.PI * 2],
                life: [4, 10], size: [1, 1], colors: ['#FFFFFF','#FFEE44'],
                gravity: 0, friction: 0.92, type: 'line' },
            dust: { count: 4, speed: [0.3, 1], angle: [-Math.PI, -Math.PI * 0.2],
                life: [12, 24], size: [1, 2], colors: ['#C8B090','#A89070'],
                gravity: -0.02, friction: 0.98, type: 'circle' },
            letter_confetti: { count: 10, speed: [1, 3], angle: [0, Math.PI * 2],
                life: [20, 40], size: [2, 3], colors: ['#F0F0F0','#DDDDFF','#EEEEFF'],
                gravity: 0.05, friction: 0.97, type: 'rect', rotSpeed: 0.2 },
            water_splash: { count: 8, speed: [1, 2.5], angle: [-Math.PI * 0.8, -Math.PI * 0.2],
                life: [10, 20], size: [1, 2], colors: ['#44AAFF','#66CCFF','#88DDFF'],
                gravity: 0.15, friction: 0.98, type: 'circle' },
            smoke: { count: 5, speed: [0.2, 0.8], angle: [-Math.PI * 0.8, -Math.PI * 0.2],
                life: [20, 40], size: [2, 4], colors: ['#888888','#666666','#999999'],
                gravity: -0.03, friction: 0.99, type: 'circle' },
            stamp_burst: { count: 12, speed: [1.5, 3], angle: [0, Math.PI * 2],
                life: [10, 20], size: [1, 2], colors: ['#CC0000','#FF0000','#880000','#FFFFFF'],
                gravity: 0.08, friction: 0.95, type: 'rect', rotSpeed: 0.3 },
            delivery: { count: 20, speed: [1, 4], angle: [0, Math.PI * 2],
                life: [30, 60], size: [2, 4], colors: ['#FFD700','#FF6600','#FFFFFF','#CC2200'],
                gravity: 0.05, friction: 0.97, type: 'rect', rotSpeed: 0.15 }
        };

        var p = presets[preset];
        if (!p) return;

        for (var i = 0; i < p.count; i++) {
            var part = this._getParticle();
            if (!part) break;
            var angle = PR.Utils.randFloat(p.angle[0], p.angle[1]);
            var speed = PR.Utils.randFloat(p.speed[0], p.speed[1]);
            part.alive = true;
            part.x = x;
            part.y = y;
            part.vx = Math.cos(angle) * speed;
            part.vy = Math.sin(angle) * speed;
            part.life = PR.Utils.randInt(p.life[0], p.life[1]);
            part.maxLife = part.life;
            part.size = PR.Utils.randFloat(p.size[0], p.size[1]);
            part.color = PR.Utils.randChoice(p.colors);
            part.gravity = p.gravity || 0;
            part.friction = p.friction || 1;
            part.rotation = Math.random() * Math.PI * 2;
            part.rotSpeed = (p.rotSpeed || 0) * (Math.random() > 0.5 ? 1 : -1);
            part.type = p.type || 'circle';
            part.score = 0;
        }
    },

    emitScore: function(x, y, score) {
        var part = this._getParticle();
        if (!part) return;
        part.alive = true;
        part.x = x;
        part.y = y;
        part.vx = 0;
        part.vy = -0.5;
        part.life = 50;
        part.maxLife = 50;
        part.size = 1;
        part.color = '#FFD700';
        part.gravity = 0;
        part.friction = 1;
        part.type = 'score';
        part.score = score;
    },

    emitStampMark: function(x, y) {
        this.stampMarks.push({ x: x, y: y, life: 60, maxLife: 60 });
        this.emit(x + 7, y + 4, 'stamp_burst');
    },

    update: function() {
        for (var i = 0; i < this.pool.length; i++) {
            var p = this.pool[i];
            if (!p.alive) continue;
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.vx *= p.friction;
            p.vy *= p.friction;
            p.rotation += p.rotSpeed;
            p.life--;
            if (p.life <= 0) p.alive = false;
        }
        for (var j = this.stampMarks.length - 1; j >= 0; j--) {
            this.stampMarks[j].life--;
            if (this.stampMarks[j].life <= 0) this.stampMarks.splice(j, 1);
        }
    },

    render: function(ctx) {
        for (var j = 0; j < this.stampMarks.length; j++) {
            var sm = this.stampMarks[j];
            ctx.globalAlpha = sm.life / sm.maxLife;
            PR.SpriteCache.draw(ctx, 'stamp_mark', sm.x, sm.y);
        }
        ctx.globalAlpha = 1;

        for (var i = 0; i < this.pool.length; i++) {
            var p = this.pool[i];
            if (!p.alive) continue;
            var alpha = p.life / p.maxLife;
            ctx.globalAlpha = alpha;

            if (p.type === 'score') {
                PR.Utils.drawText(ctx, '' + p.score, Math.round(p.x), Math.round(p.y), p.color, 1);
            } else if (p.type === 'line') {
                ctx.strokeStyle = p.color;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x - p.vx * 2, p.y - p.vy * 2);
                ctx.stroke();
            } else if (p.type === 'rect') {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                ctx.restore();
            } else {
                ctx.fillStyle = p.color;
                var s = Math.ceil(p.size * alpha);
                ctx.fillRect(Math.round(p.x) - s / 2, Math.round(p.y) - s / 2, s, s);
            }
        }
        ctx.globalAlpha = 1;
    }
};
