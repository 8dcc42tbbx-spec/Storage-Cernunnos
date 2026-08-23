// Peak Performance: Last Delivery -- main state machine & loop.
PPLD.Game = {
    canvas: null,
    ctx: null,
    state: null,
    legIndex: 0,
    timeLeft: 0,
    timeStart: 0,
    legsCleared: 0,
    totalOvertakes: 0,
    introTimer: 0,
    resultsLine: '',
    prevHorn: false,
    lastT: 0,

    init: function (canvas) {
        var C = PPLD.CONST;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        canvas.width = C.CANVAS_W;
        canvas.height = C.CANVAS_H;

        PPLD.Input.init(canvas);
        PPLD.Road.init();

        this.state = C.STATE_TITLE;

        var self = this;
        requestAnimationFrame(function (t) { self.loop(t); });
    },

    loop: function (t) {
        var self = this;
        var dt = this.lastT ? (t - this.lastT) / 1000 : 1 / 60;
        this.lastT = t;
        dt = Math.min(dt, 1 / 20); // clamp to avoid a huge step after a tab-away

        PPLD.Input.poll();
        this.update(dt);
        this.render();

        requestAnimationFrame(function (t2) { self.loop(t2); });
    },

    update: function (dt) {
        var C = PPLD.CONST;
        PPLD.Menu.update(dt);
        PPLD.Hud.update(dt);

        if (this.state === C.STATE_TITLE) {
            this.updateTitle();
        } else if (this.state === C.STATE_LEG_INTRO) {
            this.updateLegIntro(dt);
        } else if (this.state === C.STATE_PLAYING) {
            this.updatePlaying(dt);
        } else if (this.state === C.STATE_RESULTS_WIN || this.state === C.STATE_RESULTS_LOSE) {
            this.updateResults();
        }
    },

    updateTitle: function () {
        if (PPLD.Input.justPressed('start')) {
            PPLD.Audio.unlock();
            PPLD.Audio.playTitleJingle();
            this.startRun();
        }
    },

    startRun: function () {
        var C = PPLD.CONST;
        this.legIndex = 0;
        this.timeStart = C.TIME_START;
        this.timeLeft = C.TIME_START;
        this.legsCleared = 0;
        this.totalOvertakes = 0;
        PPLD.Entities.resetRun();
        PPLD.Coach.reset();
        this.beginLegIntro(0);
    },

    beginLegIntro: function (legIndex, finishedLegIndex) {
        this.legIndex = legIndex;
        this.state = PPLD.CONST.STATE_LEG_INTRO;
        this.introTimer = 2.4;
        PPLD.Entities.startLeg(legIndex);
        PPLD.Weather.startLeg(legIndex);
        PPLD.Coach.startLeg(legIndex, finishedLegIndex);
        PPLD.Hud.bannerTimer = 0;
    },

    updateLegIntro: function (dt) {
        this.introTimer -= dt;
        if (this.introTimer <= 0 || PPLD.Input.justPressed('start')) {
            this.state = PPLD.CONST.STATE_PLAYING;
        }
    },

    updatePlaying: function (dt) {
        var C = PPLD.CONST;
        var input = PPLD.Input.actions;
        // Captured before handleEvents runs -- a 'leg-clear' event inside
        // it can advance this.legIndex (via onLegClear -> beginLegIntro),
        // and the events below still belong to the leg that just ended.
        var legIndexForEvents = this.legIndex;

        var events = PPLD.Entities.update(dt, this.legIndex, input);
        this.handleEvents(events);
        PPLD.Coach.handleEvents(events, legIndexForEvents);

        var weatherEvents = PPLD.Weather.update(dt);
        if (weatherEvents.length) PPLD.Coach.handleEvents(weatherEvents, legIndexForEvents);

        PPLD.Coach.update(dt, this.legIndex, this.timeLeft, PPLD.Entities.player.z);

        var speedFrac = PPLD.Entities.player.speed / C.MAX_SPEED;
        PPLD.Audio.setEngine(speedFrac, true);
        PPLD.Audio.setWeather(PPLD.Weather.intensity(), PPLD.Weather.filterFreq());

        if (input.horn && !this.prevHorn) this.honk();
        this.prevHorn = input.horn;

        this.timeLeft -= dt;
        if (this.timeLeft <= 0) {
            this.timeLeft = 0;
            this.enterResults(false);
        }
    },

    honk: function () {
        PPLD.Audio.tone(520, PPLD.Audio.ctx ? PPLD.Audio.ctx.currentTime : 0, 0.15, 0.18);
        var p = PPLD.Entities.player, cars = PPLD.Entities.cars;
        for (var i = 0; i < cars.length; i++) {
            var relZ = cars[i].z - p.z;
            if (relZ > 0 && relZ < 1500) {
                cars[i].x += (cars[i].x >= p.x ? 0.06 : -0.06);
                cars[i].x = Math.max(-0.85, Math.min(0.85, cars[i].x));
            }
        }
    },

    handleEvents: function (events) {
        var C = PPLD.CONST;
        for (var i = 0; i < events.length; i++) {
            var e = events[i];
            if (e.type === 'overtake') {
                this.totalOvertakes++;
                this.timeLeft += C.TIME_OVERTAKE_BONUS;
                PPLD.Audio.playPassBlip();
            } else if (e.type === 'checkpoint') {
                this.timeLeft += C.TIME_CHECKPOINT_BONUS;
                PPLD.Hud.showBanner('CHECKPOINT +' + C.TIME_CHECKPOINT_BONUS + 's');
                PPLD.Audio.playMilestoneChime();
                PPLD.Audio.playRadioSting();
            } else if (e.type === 'collision-traffic') {
                this.timeLeft = Math.max(0, this.timeLeft - e.penalty);
                PPLD.Hud.showBanner('SCRAPED -' + e.penalty + 's');
                PPLD.Audio.playCollision(false);
            } else if (e.type === 'collision-hazard') {
                this.timeLeft = Math.max(0, this.timeLeft - e.penalty);
                PPLD.Hud.showBanner('HIT SOMETHING -' + e.penalty + 's');
                PPLD.Audio.playCollision(true);
            } else if (e.type === 'hazard-sight') {
                PPLD.Audio.playRadioSting();
            } else if (e.type === 'leg-clear') {
                this.onLegClear();
            }
        }
    },

    onLegClear: function () {
        var C = PPLD.CONST;
        var finished = this.legIndex;
        this.timeLeft += C.TIME_LEG_CLEAR_BONUS;
        this.legsCleared++;
        PPLD.Hud.showBanner(C.LEGS[finished].name.toUpperCase() + ' CLEAR +' + C.TIME_LEG_CLEAR_BONUS + 's');
        PPLD.Audio.playMilestoneChime();

        if (finished >= C.LEGS.length - 1) {
            this.enterResults(true);
        } else {
            this.beginLegIntro(finished + 1, finished);
        }
    },

    enterResults: function (win) {
        var C = PPLD.CONST;
        this.state = win ? C.STATE_RESULTS_WIN : C.STATE_RESULTS_LOSE;
        this.resultsLine = PPLD.Coach.pickRunEnd(win);
        PPLD.Audio.setEngine(0, false);
        PPLD.Audio.setWeather(0, 700);
        PPLD.Audio.playTitleJingle();
    },

    updateResults: function () {
        if (PPLD.Input.justPressed('start')) {
            this.state = PPLD.CONST.STATE_TITLE;
        }
    },

    render: function () {
        var C = PPLD.CONST;
        var ctx = this.ctx;

        if (this.state === C.STATE_TITLE) {
            PPLD.Menu.drawTitle(ctx);
        } else if (this.state === C.STATE_LEG_INTRO) {
            PPLD.Menu.drawLegIntro(ctx, this.legIndex);
        } else if (this.state === C.STATE_PLAYING) {
            this.renderPlaying(ctx);
        } else if (this.state === C.STATE_RESULTS_WIN || this.state === C.STATE_RESULTS_LOSE) {
            PPLD.Menu.drawResults(ctx, this.state === C.STATE_RESULTS_WIN, {
                legsCleared: this.legsCleared,
                overtakes: this.totalOvertakes,
                timeLeft: this.timeLeft
            }, this.resultsLine);
        }
    },

    renderPlaying: function (ctx) {
        var C = PPLD.CONST;
        var p = PPLD.Entities.player;
        var world = { playerZ: p.z, playerX: p.x, cars: PPLD.Entities.cars, hazards: PPLD.Entities.hazards };

        PPLD.Road.render(ctx, world, this.legIndex);
        PPLD.Weather.render(ctx);

        var lean = PPLD.Input.actions.steer;
        var braking = PPLD.Input.actions.brake;
        var night = C.LEGS[this.legIndex].night;
        var hitFlash = p.hitTimer > 0 && Math.floor(p.hitTimer * 12) % 2 === 0;
        PPLD.Sprites.drawPlayer(ctx, C.CANVAS_W / 2, C.CANVAS_H * 0.82, lean, braking, night, hitFlash);

        PPLD.Hud.draw(ctx, {
            timeLeft: this.timeLeft,
            timeStart: this.timeStart,
            legIndex: this.legIndex,
            legComplete: false,
            speedFrac: p.speed / C.MAX_SPEED,
            coach: PPLD.Coach
        });
    }
};
