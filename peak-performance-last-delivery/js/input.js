// Peak Performance: Last Delivery -- input (keyboard + touch)
PPLD.Input = {
    keys: {},
    touchMode: false,
    steerTouchId: null,
    steerAxis: 0,       // -1..1
    accelTouch: false,
    brakeTouch: false,
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

        // Touch: left half of the canvas steers by touch position relative
        // to centre; bottom-right = accelerate (hold); bottom-left small
        // zone = brake. See README.md sec 6 for the layout rationale.
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
        var rect = canvas.getBoundingClientRect();
        var w = rect.width, h = rect.height;
        var steering = false, accel = false, brake = false, start = false;
        var steerAxis = 0;

        for (var i = 0; i < e.touches.length; i++) {
            var t = e.touches[i];
            var x = (t.clientX - rect.left) / w;   // 0..1
            var y = (t.clientY - rect.top) / h;    // 0..1

            if (y > 0.62 && x > 0.55) {
                accel = true;
            } else if (y > 0.62 && x < 0.30) {
                brake = true;
            } else if (y < 0.62) {
                steering = true;
                steerAxis = Math.max(-1, Math.min(1, (x - 0.5) / 0.42));
            } else {
                start = true;
            }
        }

        this.steerAxis = steering ? steerAxis : 0;
        this.accelTouch = accel;
        this.brakeTouch = brake;
        this.startTouch = start;
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
        this.actions.brake = !!(this.keys['ArrowDown'] || this.keys['KeyS'] || this.brakeTouch);
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
