// Postie Run - Camera with Zoom and Vertical Tracking
PR.Camera = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    levelWidth: 0,
    shakeX: 0,
    shakeY: 0,
    shakeIntensity: 0,
    shakeDuration: 0,
    shakeTimer: 0,
    viewW: 0,
    viewH: 0,
    worldH: 0,

    init: function(levelWidth) {
        var z = PR.CONST.ZOOM || 1;
        this.viewW = PR.CONST.CANVAS_W / z;
        this.viewH = PR.CONST.CANVAS_H / z;
        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.levelWidth = levelWidth;
        this.shakeIntensity = 0;
        this.shakeTimer = 0;
        this.shakeX = 0;
        this.shakeY = 0;
        // World height based on tilemap rows
        var rows = Math.ceil(PR.CONST.CANVAS_H / PR.CONST.TILE_SIZE) + 1;
        this.worldH = rows * PR.CONST.TILE_SIZE;
    },

    update: function(playerX, playerY) {
        // Horizontal: player in left 35% of viewport
        this.targetX = playerX - this.viewW * 0.35;
        this.x = PR.Utils.lerp(this.x, this.targetX, 0.08);
        this.x = PR.Utils.clamp(this.x, 0, this.levelWidth - this.viewW);

        // Vertical: center player at 60% from top of viewport
        if (playerY !== undefined) {
            this.targetY = (playerY + 12) - this.viewH * 0.60;
            this.y = PR.Utils.lerp(this.y, this.targetY, 0.10);
            this.y = PR.Utils.clamp(this.y, 0, this.worldH - this.viewH);
        }

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

    // Apply camera transform with zoom
    apply: function(ctx) {
        ctx.save();
        var z = PR.CONST.ZOOM || 1;
        ctx.scale(z, z);
        ctx.translate(
            Math.round(-this.x + this.shakeX),
            Math.round(-this.y + this.shakeY)
        );
    },

    restore: function(ctx) {
        ctx.restore();
    },

    parallaxX: function(depth) {
        return this.x * depth;
    },

    // Check if a world-space rect is visible (uses viewport dimensions)
    isVisible: function(x, y, w, h) {
        return x + w > this.x - 32 &&
               x < this.x + this.viewW + 32 &&
               y + h > this.y - 32 &&
               y < this.y + this.viewH + 32;
    }
};
