// Postie Run - Base Entity
PR.Entity = function(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.vx = 0;
    this.vy = 0;
    this.facing = 1; // 1=right, -1=left
    this.alive = true;
    this.health = 1;
    this.maxHealth = 1;
    this.type = '';
    this.animFrame = 0;
    this.animTimer = 0;
    this.animSpeed = 8; // frames per anim frame
    this.flashTimer = 0;
    this.grounded = false;
    this.removeOffscreen = true;
};

PR.Entity.prototype.update = function() {
    // Apply gravity
    this.vy += PR.CONST.GRAVITY;
    if (this.vy > PR.CONST.MAX_FALL) this.vy = PR.CONST.MAX_FALL;

    // Apply velocity
    this.x += this.vx;
    this.y += this.vy;

    // Animation
    this.animTimer++;
    if (this.animTimer >= this.animSpeed) {
        this.animTimer = 0;
        this.animFrame++;
    }

    // Flash timer
    if (this.flashTimer > 0) this.flashTimer--;

    // Remove if far offscreen
    if (this.removeOffscreen && this.x < PR.Camera.x - 100) {
        this.alive = false;
    }
};

PR.Entity.prototype.takeDamage = function(amount, stampHit) {
    if (this.flashTimer > 0) return;
    this.health -= amount;
    this.flashTimer = 10;
    if (this.health <= 0) {
        this.die(stampHit);
    }
};

PR.Entity.prototype.die = function(stampHit) {
    this.alive = false;
    // Explosion particles
    PR.Particles.emit(this.x + this.w / 2, this.y + this.h / 2, 'explosion');
    if (stampHit) {
        // Show "DELIVERED" stamp mark
        PR.Particles.emitStampMark(this.x + this.w / 2 - 7, this.y + this.h / 2 - 4);
    }
    PR.Camera.shake(3, 8);
    PR.Audio.play('explosion');
};

PR.Entity.prototype.getBounds = function() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
};

PR.Entity.prototype.render = function(ctx) {
    // Override in subclasses
    ctx.fillStyle = '#FF00FF';
    ctx.fillRect(this.x - PR.Camera.x, this.y, this.w, this.h);
};

PR.Entity.prototype.isOnScreen = function() {
    return PR.Camera.isVisible(this.x, this.y, this.w, this.h);
};
