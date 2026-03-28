// Postie Run - Input Manager
PR.Input = {
    keys: {},
    prev: {},
    gamepadConnected: false,
    gpState: null,

    init: function() {
        var self = this;
        window.addEventListener('keydown', function(e) {
            self.keys[e.code] = true;
            // Prevent default for game keys
            if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',
                 'Space','KeyZ','KeyX','KeyC','Enter','Escape'].indexOf(e.code) >= 0) {
                e.preventDefault();
            }
        });
        window.addEventListener('keyup', function(e) {
            self.keys[e.code] = false;
        });
        window.addEventListener('gamepadconnected', function() {
            self.gamepadConnected = true;
        });
        window.addEventListener('gamepaddisconnected', function() {
            self.gamepadConnected = false;
        });
    },

    poll: function() {
        // Save previous state for justPressed detection
        this.prev = {};
        for (var k in this.actions) {
            this.prev[k] = this.actions[k];
        }

        // Reset actions
        this.actions = {
            left: false,
            right: false,
            up: false,
            down: false,
            jump: false,
            shoot: false,
            special: false,
            pause: false,
            start: false
        };

        // Keyboard
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) this.actions.left = true;
        if (this.keys['ArrowRight'] || this.keys['KeyD']) this.actions.right = true;
        if (this.keys['ArrowUp'] || this.keys['KeyW']) this.actions.up = true;
        if (this.keys['ArrowDown'] || this.keys['KeyS']) this.actions.down = true;
        if (this.keys['KeyX'] || this.keys['Space']) this.actions.jump = true;
        if (this.keys['KeyZ']) this.actions.shoot = true;
        if (this.keys['KeyC']) this.actions.special = true;
        if (this.keys['Escape']) this.actions.pause = true;
        if (this.keys['Enter']) this.actions.start = true;

        // Gamepad
        if (this.gamepadConnected) {
            var gp = navigator.getGamepads()[0];
            if (gp) {
                // D-pad or left stick
                if (gp.buttons[14] && gp.buttons[14].pressed) this.actions.left = true;
                if (gp.buttons[15] && gp.buttons[15].pressed) this.actions.right = true;
                if (gp.buttons[12] && gp.buttons[12].pressed) this.actions.up = true;
                if (gp.buttons[13] && gp.buttons[13].pressed) this.actions.down = true;
                if (gp.axes[0] < -0.3) this.actions.left = true;
                if (gp.axes[0] > 0.3) this.actions.right = true;
                if (gp.axes[1] < -0.3) this.actions.up = true;
                if (gp.axes[1] > 0.3) this.actions.down = true;
                // Buttons: A=jump, X=shoot, B=special, Start=pause
                if (gp.buttons[0] && gp.buttons[0].pressed) this.actions.jump = true;
                if (gp.buttons[2] && gp.buttons[2].pressed) this.actions.shoot = true;
                if (gp.buttons[1] && gp.buttons[1].pressed) this.actions.special = true;
                if (gp.buttons[9] && gp.buttons[9].pressed) this.actions.pause = true;
                if (gp.buttons[9] && gp.buttons[9].pressed) this.actions.start = true;
            }
        }
    },

    // True only on the frame the action first becomes true
    justPressed: function(action) {
        return this.actions[action] && !this.prev[action];
    },

    actions: {
        left: false, right: false, up: false, down: false,
        jump: false, shoot: false, special: false, pause: false, start: false
    }
};
