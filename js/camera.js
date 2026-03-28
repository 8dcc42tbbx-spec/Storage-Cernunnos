// Postie Run - Camera with Screen Shake
PR.Camera = {
    x: 0,
    y: 0,
    targetX: 0,
    levelWidth: 0,
    shakeX: 0,
    shakeY: 0,
    shakeIntensity: 0,
    shakeDuration: 0,
    shakeTimer: 0,

    init: function(levelWidth) {
        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.levelWidth = levelWidth;
        this.shakeIntensity = 0;
        this.shakeTimer = 0;
        this.shakeX = 0;
        this.shakeY = 0;
    },

    update: function(playerX) {
        // Player stays in left 35% of screen, camera leads ahead
        this.targetX = playerX - PR.CONST.CANVAS_W * 0.35;

        // Smooth follow
        this.x = PR.Utils.lerp(this.x, this.targetX, 0.08);

        // Clamp to level bounds
        this.x = PR.Utils.clamp(this.x, 0, this.levelWidth - PR.CONST.CANVAS_W);

        // Screen shake
        if (this.shakeTimer > 0) {
            this.shakeTimer--;
            var t = this.shakeTimer / this.shakeDuration;
            var intensity = this.shakeIntensity * t;
            this.shakeX = PR.Utils.randFloat(-intensity, intensity);
            this.shakeY = PR.Utils.randFloat(-intensity, intensity);
        } else {
            this.shakeX = 0;
            this.shakeY = 0;
        }
    },

    shake: function(intensity, duration) {
        if (intensity > this.shakeIntensity) {
            this.shakeIntensity = intensity;
            this.shakeDuration = duration;
            this.shakeTimer = duration;
        }
    },

    // Apply camera transform to context
    apply: function(ctx) {
        ctx.save();
        ctx.translate(
            Math.round(-this.x + this.shakeX),
            Math.round(-this.y + this.shakeY)
        );
    },

    // Restore context
    restore: function(ctx) {
        ctx.restore();
    },

    // Get parallax offset for a given depth (0 = static, 1 = full scroll)
    parallaxX: function(depth) {
        return this.x * depth;
    },

    // Check if a world-space rect is visible
    isVisible: function(x, y, w, h) {
        return x + w > this.x - 32 &&
               x < this.x + PR.CONST.CANVAS_W + 32 &&
               y + h > this.y - 32 &&
               y < this.y + PR.CONST.CANVAS_H + 32;
    }
};
