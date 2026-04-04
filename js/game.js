// Postie Run - Main Game Loop & State Machine (Enhanced with JUICE)
PR.Game = {
    state: 0,
    canvas: null,
    ctx: null,
    lastTime: 0,
    accumulator: 0,
    TICK: 1000 / 48,
    frameCount: 0,

    // === JUICE SYSTEMS ===
    hitstopTimer: 0,
    slowmoTimer: 0,
    flashColor: '#FFFFFF',
    flashAlpha: 0,
    flashTimer: 0,
    announceText: '',
    announceTimer: 0,
    announceColor: '#FFD700',
    announceScale: 2,
    lastCombo: 0,

    // Weather
    weatherParticles: [],

    init: function(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;

        PR.Input.init();
        PR.Particles.init();
        PR.Level.init();
        PR.HUD.init();
        PR.Menu.init();
        PR.SpriteCache.init();
        PR.Player.init();

        // Try loading image sprites
        if (PR.ImageSprites) PR.ImageSprites.init();

        this.state = PR.CONST.STATE_MENU;
        PR.Menu.timer = 0;
        this.weatherParticles = [];

        this.lastTime = performance.now();
        this._loop = this._loop.bind(this);
        requestAnimationFrame(this._loop);
    },

    _loop: function(timestamp) {
        var dt = timestamp - this.lastTime;
        this.lastTime = timestamp;
        this.accumulator += dt;
        if (this.accumulator > 200) this.accumulator = 200;

        while (this.accumulator >= this.TICK) {
            this._update();
            this.accumulator -= this.TICK;
        }

        this._render();
        this.frameCount++;
        requestAnimationFrame(this._loop);
    },

    _update: function() {
        PR.Input.poll();

        // Hitstop: freeze game for dramatic impact
        if (this.hitstopTimer > 0) {
            this.hitstopTimer--;
            // Still update flash/announce during hitstop
            if (this.flashTimer > 0) { this.flashTimer--; this.flashAlpha = this.flashTimer / 12; }
            if (this.announceTimer > 0) this.announceTimer--;
            return;
        }

        // Slowmo: run at half speed
        if (this.slowmoTimer > 0) {
            this.slowmoTimer--;
            if (this.frameCount % 2 !== 0) return; // skip every other frame
        }

        // Flash timer
        if (this.flashTimer > 0) { this.flashTimer--; this.flashAlpha = this.flashTimer / 12; }
        if (this.announceTimer > 0) this.announceTimer--;

        switch (this.state) {
            case PR.CONST.STATE_MENU:
                var titleResult = PR.Menu.updateTitle();
                if (titleResult === 'start') {
                    PR.Audio.init();
                    PR.Player.init();
                    this._startLevel(0);
                }
                break;

            case PR.CONST.STATE_LEVEL_INTRO:
                var introResult = PR.Menu.updateLevelIntro();
                if (introResult === 'play') {
                    this.state = PR.CONST.STATE_PLAYING;
                    PR.Audio.playMusic(PR.Level.data.theme);
                }
                break;

            case PR.CONST.STATE_PLAYING:
                if (PR.Input.justPressed('pause')) {
                    this.state = PR.CONST.STATE_PAUSED;
                    PR.Audio.stopMusic();
                    break;
                }

                PR.Player.update();
                PR.Enemies.update();
                PR.Projectiles.update();
                PR.Pickups.update();
                PR.Particles.update();
                PR.Level.update();
                PR.Camera.update(PR.Player.x, PR.Player.y);
                PR.HUD.update();

                this._checkPlayerCollisions();
                this._checkComboAnnouncer();
                this._updateWeather();

                // Check delivery
                if (PR.Level.deliveryReached) {
                    this.state = PR.CONST.STATE_LEVEL_COMPLETE;
                    PR.Menu.levelCompleteTimer = 0;
                    PR.Audio.stopMusic();
                    PR.Audio.play('level_complete');
                    var timeBonus = Math.max(0, 5000 - PR.Level.levelTimer * 2);
                    PR.Player.score += timeBonus;
                    this.flashColor = '#FFD700';
                    this.flashAlpha = 0.5;
                    this.flashTimer = 20;
                    PR.Camera.shake(4, 15);
                }

                // Check death
                if (PR.Player.state === 'dead' && PR.Player.deadTimer > 90) {
                    if (PR.Player.lives <= 0) {
                        this.state = PR.CONST.STATE_GAME_OVER;
                        PR.Menu.gameOverTimer = 0;
                        PR.Audio.stopMusic();
                        PR.Audio.play('death');
                    }
                }
                break;

            case PR.CONST.STATE_PAUSED:
                if (PR.Input.justPressed('pause')) {
                    this.state = PR.CONST.STATE_PLAYING;
                    PR.Audio.playMusic(PR.Level.data.theme);
                }
                break;

            case PR.CONST.STATE_LEVEL_COMPLETE:
                var completeResult = PR.Menu.updateLevelComplete();
                PR.Particles.update();
                if (completeResult === 'next') {
                    if (PR.Level.current >= 19) {
                        this.state = PR.CONST.STATE_LEVEL_COMPLETE;
                        PR.Menu.levelCompleteTimer = 0;
                        this._showWinScreen = true;
                    } else {
                        this._startLevel(PR.Level.current + 1);
                    }
                }
                if (this._showWinScreen) {
                    if (PR.Menu.levelCompleteTimer > 240 &&
                        (PR.Input.justPressed('start') || PR.Input.justPressed('jump'))) {
                        this._showWinScreen = false;
                        this.state = PR.CONST.STATE_MENU;
                        PR.Menu.timer = 0;
                    }
                }
                break;

            case PR.CONST.STATE_GAME_OVER:
                var overResult = PR.Menu.updateGameOver();
                if (overResult === 'continue') {
                    PR.Player.continues--;
                    PR.Player.lives = PR.CONST.PLAYER_LIVES;
                    PR.Player.respawn();
                    this._startLevel(PR.Level.current);
                } else if (overResult === 'title') {
                    this.state = PR.CONST.STATE_MENU;
                    PR.Menu.timer = 0;
                }
                break;
        }
    },

    // Combo announcer - triggers on combo thresholds
    _checkComboAnnouncer: function() {
        var combo = PR.Player.combo;
        if (combo > this.lastCombo) {
            if (combo === 3) this._announce('NICE!', '#FFD700', 2);
            else if (combo === 5) this._announce('GREAT!', '#FF8800', 2);
            else if (combo === 8) this._announce('AWESOME!', '#FF2200', 2);
            else if (combo === 12) this._announce('POSTAL LEGEND!', '#FFD700', 3);
            else if (combo === 20) this._announce('SPECIAL DELIVERY!!!', '#FF00FF', 3);
        }
        this.lastCombo = combo;
    },

    _announce: function(text, color, scale) {
        this.announceText = text;
        this.announceColor = color;
        this.announceScale = scale;
        this.announceTimer = 90;
        PR.Camera.shake(scale, 10);
    },

    // Trigger hitstop (freeze frames)
    hitstop: function(frames) {
        this.hitstopTimer = Math.max(this.hitstopTimer, frames);
    },

    // Trigger screen flash
    flash: function(color, alpha) {
        this.flashColor = color || '#FFFFFF';
        this.flashAlpha = alpha || 0.6;
        this.flashTimer = 12;
    },

    _checkPlayerCollisions: function() {
        if (PR.Player.state === 'dead' || PR.Player.invTimer > 0) return;
        if (PR.Player.rolling) return; // invulnerable during roll
        var pb = PR.Player.getBounds();

        for (var i = 0; i < PR.Enemies.list.length; i++) {
            var e = PR.Enemies.list[i];
            if (!e.alive || e.dying || e.contactDamage <= 0) continue;

            var eb = e.getBounds();
            if (PR.Utils.aabb(pb, eb)) {
                if (PR.Player.inVehicle) {
                    // eDV smashes enemies - dramatic!
                    e.takeDamage(5, false);
                    PR.Camera.shake(3, 8);
                    this.hitstop(3);
                    this.flash('#FFFFFF', 0.3);
                    PR.Particles.emit(e.x + e.w / 2, e.y + e.h / 2, 'spark');
                } else if (e.canBeStomped && PR.Player.vy > 0 &&
                           PR.Player.y + PR.Player.h < e.y + e.h / 2) {
                    // STOMP! Satisfying bounce
                    e.takeDamage(2, false);
                    PR.Player.vy = -5;
                    PR.Player.addScore(e.scoreValue);
                    PR.Particles.emit(e.x + e.w / 2, e.y, 'dust');
                    PR.Camera.shake(2, 6);
                    this.hitstop(4);
                } else {
                    // Player takes damage
                    PR.Player.takeDamage(e.contactDamage);
                    this.flash('#FF0000', 0.4);
                    this.hitstop(5);
                }
            }
        }
    },

    _startLevel: function(levelIndex) {
        PR.Level.load(levelIndex);
        PR.Menu.levelIntroTimer = 0;
        this.state = PR.CONST.STATE_LEVEL_INTRO;
        PR.Audio.stopMusic();
        this._showWinScreen = false;
        this.weatherParticles = [];
        this.lastCombo = 0;
        this.announceTimer = 0;
    },

    // Weather system per theme
    _updateWeather: function() {
        if (!PR.Level.data) return;
        var theme = PR.Level.data.theme;
        var wp = this.weatherParticles;
        var vw = PR.Camera.viewW;
        var vh = PR.Camera.viewH;

        // Cap weather particles
        if (wp.length > 60) wp.splice(0, wp.length - 60);

        switch (theme) {
            case PR.CONST.THEME_SUBURBAN:
                if (this.frameCount % 90 === 0) {
                    wp.push({
                        type: 'butterfly', x: PR.Camera.x + vw + 10,
                        y: PR.Camera.y + PR.Utils.randInt(10, Math.floor(vh * 0.7)),
                        vx: -PR.Utils.randFloat(0.3, 0.8),
                        vy: 0, timer: 300, color: PR.Utils.randChoice(['#FFAA00','#FF44AA','#44AAFF','#AAFF44']),
                        phase: Math.random() * Math.PI * 2
                    });
                }
                break;
            case PR.CONST.THEME_URBAN:
                if (this.frameCount % 2 === 0) {
                    wp.push({
                        type: 'rain', x: PR.Camera.x + PR.Utils.randInt(0, Math.floor(vw)),
                        y: PR.Camera.y - 5, vx: -1, vy: PR.Utils.randFloat(4, 7), timer: 80,
                        color: '#8899CC'
                    });
                }
                break;
            case PR.CONST.THEME_REGIONAL:
                if (this.frameCount % 30 === 0) {
                    wp.push({
                        type: 'mote', x: PR.Camera.x + PR.Utils.randInt(0, Math.floor(vw)),
                        y: PR.Camera.y + PR.Utils.randInt(10, Math.floor(vh * 0.8)),
                        vx: PR.Utils.randFloat(-0.2, 0.3),
                        vy: PR.Utils.randFloat(-0.1, 0.1), timer: 200,
                        color: '#D4C890', phase: Math.random() * Math.PI * 2
                    });
                }
                break;
            case PR.CONST.THEME_COASTAL:
                if (this.frameCount % 8 === 0) {
                    wp.push({
                        type: 'spray', x: PR.Camera.x + vw + 5,
                        y: PR.Camera.y + PR.Utils.randInt(Math.floor(vh * 0.7), Math.floor(vh)),
                        vx: -PR.Utils.randFloat(1, 3),
                        vy: PR.Utils.randFloat(-1, -0.2), timer: 60,
                        color: PR.Utils.randChoice(['#88DDFF','#AAEEFF','#FFFFFF'])
                    });
                }
                break;
            case PR.CONST.THEME_OUTBACK:
                if (this.frameCount % 300 === 0) {
                    wp.push({
                        type: 'tumbleweed', x: PR.Camera.x + vw + 10,
                        y: PR.Level.data.groundY * PR.CONST.TILE_SIZE - 8,
                        vx: -PR.Utils.randFloat(1, 2.5), vy: 0, timer: 400,
                        color: '#8B6914', phase: 0, size: PR.Utils.randInt(4, 8)
                    });
                }
                break;
        }

        // Update weather particles
        for (var i = wp.length - 1; i >= 0; i--) {
            var p = wp[i];
            p.x += p.vx;
            p.y += p.vy;
            p.timer--;
            if (p.type === 'butterfly') {
                p.phase += 0.08;
                p.vy = Math.sin(p.phase) * 0.5;
            } else if (p.type === 'tumbleweed') {
                p.phase += 0.15;
                p.vy = Math.sin(p.phase) * 0.3 - 0.1;
            } else if (p.type === 'mote') {
                p.phase += 0.03;
                p.vx = Math.sin(p.phase) * 0.15;
            }
            if (p.timer <= 0 || p.y > PR.Camera.y + vh + 20) {
                wp.splice(i, 1);
            }
        }
    },

    _render: function() {
        var ctx = this.ctx;
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, PR.CONST.CANVAS_W, PR.CONST.CANVAS_H);

        switch (this.state) {
            case PR.CONST.STATE_MENU:
                PR.Menu.renderTitle(ctx);
                break;
            case PR.CONST.STATE_LEVEL_INTRO:
                this._renderGame(ctx);
                PR.Menu.renderLevelIntro(ctx);
                break;
            case PR.CONST.STATE_PLAYING:
                this._renderGame(ctx);
                this._renderWeather(ctx);
                this._renderSpeedLines(ctx);
                this._renderAnnouncer(ctx);
                PR.HUD.render(ctx);
                this._renderFlash(ctx);
                break;
            case PR.CONST.STATE_PAUSED:
                this._renderGame(ctx);
                PR.HUD.render(ctx);
                PR.Menu.renderPause(ctx);
                break;
            case PR.CONST.STATE_LEVEL_COMPLETE:
                this._renderGame(ctx);
                if (this._showWinScreen) {
                    PR.Menu.renderWin(ctx);
                } else {
                    PR.Menu.renderLevelComplete(ctx);
                }
                break;
            case PR.CONST.STATE_GAME_OVER:
                this._renderGame(ctx);
                PR.Menu.renderGameOver(ctx);
                break;
        }
    },

    _renderGame: function(ctx) {
        PR.Camera.apply(ctx);
        PR.Level.render(ctx);
        PR.Pickups.render(ctx);
        PR.Enemies.render(ctx);
        PR.Player.render(ctx);
        PR.Projectiles.render(ctx);
        PR.Particles.render(ctx);
        PR.Camera.restore(ctx);
    },

    // Speed lines when moving fast
    _renderSpeedLines: function(ctx) {
        var spd = Math.abs(PR.Player.vx);
        if (spd < 1.8 && !PR.Player.inVehicle) return;
        var count = PR.Player.inVehicle ? 8 : 4;
        ctx.globalAlpha = PR.Player.inVehicle ? 0.25 : 0.12;
        ctx.strokeStyle = '#FFFFFF';
        for (var i = 0; i < count; i++) {
            var y = (i * 37 + this.frameCount * 7) % PR.CONST.CANVAS_H;
            var len = PR.Utils.randInt(20, 60);
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(len, y);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    },

    // Flash overlay
    _renderFlash: function(ctx) {
        if (this.flashAlpha <= 0) return;
        ctx.globalAlpha = this.flashAlpha;
        ctx.fillStyle = this.flashColor;
        ctx.fillRect(0, 0, PR.CONST.CANVAS_W, PR.CONST.CANVAS_H);
        ctx.globalAlpha = 1;
    },

    // Combo announcer text
    _renderAnnouncer: function(ctx) {
        if (this.announceTimer <= 0) return;
        var t = this.announceTimer;
        var alpha = t > 70 ? (90 - t) / 20 : t / 70; // fade in/out
        ctx.globalAlpha = Math.min(1, alpha);

        // Scale animation: pop in then settle
        var scale = this.announceScale;
        if (t > 80) scale *= 1.5;
        else if (t > 70) scale *= 1.0 + (t - 70) * 0.05;

        var color = this.announceColor;
        // Rainbow cycle for SPECIAL DELIVERY
        if (this.announceText === 'SPECIAL DELIVERY!!!') {
            var colors = ['#FF0000','#FF8800','#FFFF00','#00FF00','#0088FF','#FF00FF'];
            color = colors[Math.floor(this.frameCount / 3) % colors.length];
        }

        // Shake at high scales
        var ox = scale >= 3 ? PR.Utils.randInt(-1, 1) : 0;
        var oy = scale >= 3 ? PR.Utils.randInt(-1, 1) : 0;

        PR.Utils.drawTextCentered(ctx, this.announceText, 100 + oy, color, Math.round(scale));
        ctx.globalAlpha = 1;
    },

    // Weather rendering (screen space)
    _renderWeather: function(ctx) {
        var wp = this.weatherParticles;
        PR.Camera.apply(ctx);
        for (var i = 0; i < wp.length; i++) {
            var p = wp[i];
            var alpha = Math.min(1, p.timer / 30);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;

            if (p.type === 'rain') {
                ctx.strokeStyle = p.color;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x + p.vx * 2, p.y + p.vy * 2);
                ctx.stroke();
            } else if (p.type === 'tumbleweed') {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size || 5, 0, Math.PI * 2);
                ctx.stroke();
                // Cross lines
                ctx.beginPath();
                ctx.moveTo(p.x - 3, p.y); ctx.lineTo(p.x + 3, p.y);
                ctx.moveTo(p.x, p.y - 3); ctx.lineTo(p.x, p.y + 3);
                ctx.stroke();
            } else if (p.type === 'butterfly') {
                // Tiny wing flap
                var wingW = Math.abs(Math.sin(p.phase * 3)) * 3;
                ctx.fillRect(p.x - wingW, p.y, wingW, 1);
                ctx.fillRect(p.x, p.y, wingW, 1);
                ctx.fillRect(p.x, p.y - 1, 1, 3);
            } else {
                var s = p.size || 1;
                ctx.fillRect(Math.round(p.x), Math.round(p.y), s, s);
            }
        }
        ctx.globalAlpha = 1;
        PR.Camera.restore(ctx);
    },

    _showWinScreen: false
};
