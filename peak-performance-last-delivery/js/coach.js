// Peak Performance: Last Delivery -- Coach's radio-popup state machine.
// See README.md sec 5/6 for the trigger table and HUD placement rules,
// and coach-lines.js for the pool this pulls from.
PPLD.Coach = {
    DISPLAY_TIME: 2.8,
    TALK_FRAME_TIME: 0.13,
    OVERTAKE_EVERY_N: 4,

    queue: [],
    current: null,        // { text, expression, timer, talkT, talkOn }
    lastIndex: {},         // per-pool "don't immediately repeat" memory
    overtakeCount: 0,

    reset: function () {
        this.queue.length = 0;
        this.current = null;
        this.lastIndex = {};
        this.overtakeCount = 0;
    },

    // `finishedLegIndex` (optional): the leg that just ended, so its
    // "clear" line plays before this leg's "start" line rather than
    // racing it through the generic event queue (see README sec 5 --
    // clear should always land before the next leg's hype).
    startLeg: function (legIndex, finishedLegIndex) {
        this.lowClockWarned = false;
        this.approachFired = false;
        this.winkFired = false;
        // Drop anything queued AND anything currently showing from the
        // previous leg -- Coach.update() doesn't run during the leg-intro
        // or results states, so a popup's timer can freeze mid-display
        // and would otherwise still be sitting there, stale, whenever
        // play resumes. A new leg always starts this system fresh.
        this.queue.length = 0;
        this.current = null;
        if (finishedLegIndex !== undefined && finishedLegIndex !== null) {
            var prevLeg = PPLD.CoachLines.legs[finishedLegIndex];
            this.queueFrom(prevLeg.clear, 'leg' + finishedLegIndex + '-clear', 'pumped');
        }
        var leg = PPLD.CoachLines.legs[legIndex];
        this.queueFrom(leg.start, 'leg' + legIndex + '-start', 'neutral');
        if (leg.wink) {
            this._winkLeg = legIndex;
            this._winkAt = 2.5; // seconds of drive-time after leg start
        }
    },

    handleEvents: function (events, legIndex) {
        var leg = PPLD.CoachLines.legs[legIndex];
        for (var i = 0; i < events.length; i++) {
            var e = events[i];
            if (e.type === 'overtake') {
                this.overtakeCount++;
                if (this.overtakeCount % this.OVERTAKE_EVERY_N === 0) {
                    this.queueFrom(PPLD.CoachLines.overtake, 'overtake', 'neutral');
                }
            } else if (e.type === 'checkpoint') {
                this.queueFrom(PPLD.CoachLines.checkpoint, 'checkpoint', 'pumped');
            } else if (e.type === 'hazard-sight') {
                var pool = leg.hazard && leg.hazard[e.key];
                if (pool) this.queueFrom(pool, 'hazard-' + e.key, 'alert');
            }
            // 'leg-clear' is handled explicitly by game.js's onLegClear ->
            // startLeg(next, finishedLegIndex), not here -- see above.
        }
    },

    update: function (dt, legIndex, timeLeft, playerZ) {
        var C = PPLD.CONST;

        if (this._winkAt !== undefined && this._winkLeg === legIndex) {
            this._winkAt -= dt;
            if (this._winkAt <= 0) {
                this.queueFrom(PPLD.CoachLines.legs[legIndex].wink, 'wink' + legIndex, 'neutral');
                this._winkAt = undefined;
            }
        }

        if (!this.lowClockWarned && timeLeft <= C.LOW_TIME_WARNING) {
            this.lowClockWarned = true;
            this.queueFrom(PPLD.CoachLines.lowClock, 'lowclock', 'alert');
        }

        var leg = PPLD.CoachLines.legs[legIndex];
        if (!this.approachFired && leg.approach) {
            var legEnd = PPLD.Road.legEndZ(legIndex);
            var legStart = PPLD.Road.legStartZ(legIndex);
            var frac = (playerZ - legStart) / Math.max(1, legEnd - legStart);
            if (frac >= 0.82) {
                this.approachFired = true;
                this.queueFrom(leg.approach, 'approach' + legIndex, 'pumped');
            }
        }

        if (this.current) {
            this.current.timer -= dt;
            this.current.talkT += dt;
            if (this.current.talkT >= this.TALK_FRAME_TIME) {
                this.current.talkT = 0;
                this.current.talkOn = !this.current.talkOn;
            }
            if (this.current.timer <= 0) this.current = null;
        } else if (this.queue.length) {
            var next = this.queue.shift();
            next.timer = this.DISPLAY_TIME;
            next.talkT = 0;
            next.talkOn = false;
            this.current = next;
        }
    },

    queueFrom: function (pool, key, expression) {
        if (!pool || !pool.length) return;
        if (this.queue.length >= 2) return; // don't let popups pile up
        var idx = Math.floor(Math.random() * pool.length);
        if (pool.length > 1 && idx === this.lastIndex[key]) {
            idx = (idx + 1) % pool.length;
        }
        this.lastIndex[key] = idx;
        this.queue.push({ text: pool[idx], expression: expression });
    },

    pickRunEnd: function (success) {
        var pool = success ? PPLD.CoachLines.runEnd.success : PPLD.CoachLines.runEnd.failure;
        return pool[Math.floor(Math.random() * pool.length)];
    }
};
