// Postie Run - Main Game Loop & State Machine
PR.Game = {
    state: 0, // PR.CONST.STATE_MENU
    canvas: null,
    ctx: null,
    lastTime: 0,
    accumulator: 0,
    TICK: 1000 / 60,
    frameCount: 0,

    init: function(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;

        // Init subsystems
        PR.Input.init();
        PR.Particles.init();
        PR.Level.init();
        PR.HUD.init();
        PR.Menu.init();

        // Pre-render all sprites
        PR.SpriteCache.init();

        // Init player
        PR.Player.init();

        // Start on title screen
        this.state = PR.CONST.STATE_MENU;
        PR.Menu.timer = 0;

        // Start loop
        this.lastTime = performance.now();
        this._loop = this._loop.bind(this);
        requestAnimationFrame(this._loop);
    },

    _loop: function(timestamp) {
        var dt = timestamp - this.lastTime;
        this.lastTime = timestamp;
        this.accumulator += dt;

        // Cap to prevent spiral of death
        if (this.accumulator > 200) this.accumulator = 200;

        // Fixed timestep updates
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
                // Pause
                if (PR.Input.justPressed('pause')) {
                    this.state = PR.CONST.STATE_PAUSED;
                    PR.Audio.stopMusic();
                    break;
                }

                // Update game
                PR.Player.update();
                PR.Enemies.update();
                PR.Projectiles.update();
                PR.Pickups.update();
                PR.Particles.update();
                PR.Level.update();
                PR.Camera.update(PR.Player.x);
                PR.HUD.update();

                // Player-enemy collision
                this._checkPlayerCollisions();

                // Check delivery
                if (PR.Level.deliveryReached) {
                    this.state = PR.CONST.STATE_LEVEL_COMPLETE;
                    PR.Menu.levelCompleteTimer = 0;
                    PR.Audio.stopMusic();
                    PR.Audio.play('level_complete');
                    // Add time bonus
                    var timeBonus = Math.max(0, 5000 - PR.Level.levelTimer * 2);
                    PR.Player.score += timeBonus;
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
                        // Game won!
                        this.state = PR.CONST.STATE_LEVEL_COMPLETE;
                        PR.Menu.levelCompleteTimer = 0;
                        // Stay on win screen until they press start
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

    _checkPlayerCollisions: function() {
        if (PR.Player.state === 'dead' || PR.Player.invTimer > 0) return;
        var pb = PR.Player.getBounds();

        for (var i = 0; i < PR.Enemies.list.length; i++) {
            var e = PR.Enemies.list[i];
            if (!e.alive || e.contactDamage <= 0) continue;

            var eb = e.getBounds();
            if (PR.Utils.aabb(pb, eb)) {
                if (PR.Player.inVehicle) {
                    // eDV runs over enemies
                    e.takeDamage(5, false);
                    PR.Camera.shake(2, 6);
                } else if (e.canBeStomped && PR.Player.vy > 0 && PR.Player.y + PR.Player.h < e.y + e.h / 2) {
                    // Stomp!
                    e.takeDamage(2, false);
                    PR.Player.vy = -4;
                    PR.Player.addScore(e.scoreValue);
                } else {
                    PR.Player.takeDamage(e.contactDamage);
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
    },

    _render: function() {
        var ctx = this.ctx;

        // Clear
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
                PR.HUD.render(ctx);
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
        // Apply camera transform
        PR.Camera.apply(ctx);

        // Background & tilemap
        PR.Level.render(ctx);

        // Pickups
        PR.Pickups.render(ctx);

        // Enemies
        PR.Enemies.render(ctx);

        // Player
        PR.Player.render(ctx);

        // Projectiles
        PR.Projectiles.render(ctx);

        // Particles (on top)
        PR.Particles.render(ctx);

        // Restore camera
        PR.Camera.restore(ctx);
    },

    _showWinScreen: false
};
