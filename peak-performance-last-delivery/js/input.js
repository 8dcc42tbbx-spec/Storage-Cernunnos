// Peak Performance: Last Delivery -- input (keyboard + touch)
//
// Touch is a fixed translucent virtual joystick bottom-left (steer) and
// a hold-to-go button bottom-right (accelerate) -- see README.md sec 6.
// Grab/hold zones are generous (a whole screen quadrant each, see
// constants.js CONST.TOUCH) so a thumb doesn't need to land precisely on
// the small drawn circle; the joystick nub still tracks relative to its
// fixed base once grabbed, wherever in the zone the touch started.
// There's no dedicated touch brake -- releasing the accelerator coasts
// down via COAST_DECEL, same as letting off the gas; Down/S still brakes
// on keyboard.
PPLD.Input = {
    keys: {},
    touchMode: false,
    joystickTouchId: null,
    joystickDX: 0,      // nub offset from centre, canvas-space px, for hud.js to draw
    joystickDY: 0,
    steerAxis: 0,        // -1..1
    accelTouch: false,
    startTouch: false,

    actions: {
        steer: 0, accel: false, brake: false,
        start: false, pause: false, horn: false
    },
    prevStart: false,
    prevPause: false,

    init: function (canvas) {
        var self = this;

        window.addEventListener('keydown', function (e) {
            self.keys[e.code] = true;
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
                 'Space', 'Enter', 'Escape'].indexOf(e.code) >= 0) {
                e.preventDefault();
            }
        });
        window.addEventListener('keyup', function (e) {
            self.keys[e.code] = false;
        });

        canvas.addEventListener('touchstart', function (e) {
            self.touchMode = true;
            self.handleTouches(e, canvas);
            e.preventDefault();
        }, { passive: false });
        canvas.addEventListener('touchmove', function (e) {
            self.handleTouches(e, canvas);
            e.preventDefault();
        }, { passive: false });
        canvas.addEventListener('touchend', function (e) {
            self.handleTouches(e, canvas);
            e.preventDefault();
        }, { passive: false });
        canvas.addEventListener('touchcancel', function (e) {
            self.handleTouches(e, canvas);
            e.preventDefault();
        }, { passive: false });
    },

    handleTouches: function (e, canvas) {
        var C = PPLD.CONST, T = C.TOUCH;
        var rect = canvas.getBoundingClientRect();
        var scaleX = C.CANVAS_W / rect.width;
        var scaleY = C.CANVAS_H / rect.height;
        var i, t;

        this.startTouch = e.touches.length > 0;

        // Release the joystick once its specific touch lifts.
        var stillThere = false;
        for (i = 0; i < e.touches.length; i++) {
            if (e.touches[i].identifier === this.joystickTouchId) { stillThere = true; break; }
        }
        if (this.joystickTouchId !== null && !stillThere) {
            this.joystickTouchId = null;
        }

        // Grab a fresh joystick touch from the bottom-left catch zone if
        // nothing's currently driving it.
        if (this.joystickTouchId === null) {
            for (i = 0; i < e.touches.length; i++) {
                t = e.touches[i];
                var gx = (t.clientX - rect.left) * scaleX;
                var gy = (t.clientY - rect.top) * scaleY;
                if (this.inJoystickZone(gx, gy)) { this.joystickTouchId = t.identifier; break; }
            }
        }

        // Track the captured touch's live position relative to the fixed
        // base, clamped to the visual radius -- this is what lets the nub
        // drag smoothly even though the base itself never moves.
        if (this.joystickTouchId !== null) {
            for (i = 0; i < e.touches.length; i++) {
                if (e.touches[i].identifier === this.joystickTouchId) { t = e.touches[i]; break; }
            }
            var px = (t.clientX - rect.left) * scaleX;
            var py = (t.clientY - rect.top) * scaleY;
            var dx = px - T.JOY_CX, dy = py - T.JOY_CY;
            var dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;
            var clamped = Math.min(dist, T.JOY_R);
            this.joystickDX = dx / dist * clamped;
            this.joystickDY = dy / dist * clamped;
            this.steerAxis = Math.max(-1, Math.min(1, dx / T.JOY_R));
        } else {
            this.joystickDX = 0;
            this.joystickDY = 0;
            this.steerAxis = 0;
        }

        // Accelerate: any touch other than the joystick's currently
        // resting in the bottom-right catch zone.
        var accel = false;
        for (i = 0; i < e.touches.length; i++) {
            t = e.touches[i];
            if (t.identifier === this.joystickTouchId) continue;
            var ax = (t.clientX - rect.left) * scaleX;
            var ay = (t.clientY - rect.top) * scaleY;
            if (this.inAccelZone(ax, ay)) { accel = true; break; }
        }
        this.accelTouch = accel;
    },

    inJoystickZone: function (x, y) {
        var T = PPLD.CONST.TOUCH;
        return x < T.ZONE_SPLIT_X && y > T.ZONE_TOP_Y;
    },

    inAccelZone: function (x, y) {
        var T = PPLD.CONST.TOUCH;
        return x >= T.ZONE_SPLIT_X && y > T.ZONE_TOP_Y;
    },

    poll: function () {
        this.prevStart = this.actions.start;
        this.prevPause = this.actions.pause;

        var steer = 0;
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) steer -= 1;
        if (this.keys['ArrowRight'] || this.keys['KeyD']) steer += 1;
        if (this.touchMode && steer === 0) steer = this.steerAxis;

        this.actions.steer = steer;
        this.actions.accel = !!(this.keys['ArrowUp'] || this.keys['KeyW'] || this.accelTouch);
        this.actions.brake = !!(this.keys['ArrowDown'] || this.keys['KeyS']);
        this.actions.horn = !!this.keys['Space'];
        this.actions.start = !!(this.keys['Enter'] || this.startTouch);
        this.actions.pause = !!this.keys['Escape'];
    },

    justPressed: function (action) {
        if (action === 'start') return this.actions.start && !this.prevStart;
        if (action === 'pause') return this.actions.pause && !this.prevPause;
        return false;
    }
};
