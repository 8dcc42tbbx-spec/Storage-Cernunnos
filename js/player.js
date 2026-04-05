// Postie Run - Player (Ernie the Postie) - Enhanced with dodge roll, grenades, coyote time
PR.Player = {
    x: 40, y: 0, w: 12, h: 22,
    vx: 0, vy: 0,
    facing: 1,
    grounded: false,
    state: 'idle',
    lives: 3,
    health: 5,
    maxHealth: 5,
    score: 0,
    weapon: 0,
    ammo: -1,
    continues: 3,
    invTimer: 0,
    shootTimer: 0,
    shootCooldown: 12,
    hurtTimer: 0,
    deadTimer: 0,
    animFrame: 0,
    animTimer: 0,
    alive: true,
    inVehicle: false,
    vehicleTimer: 0,
    vehicleHealth: 0,
    combo: 0,
    comboTimer: 0,

    // === NEW SYSTEMS ===
    rolling: false,
    rollTimer: 0,
    rollCooldown: 0,
    rollDir: 1,
    tapTimer: 0,
    lastTapDir: 0,

    grenades: 3,

    coyoteTimer: 0,    // frames since leaving ground
    jumpBuffer: 0,     // frames since jump was pressed

    wasGrounded: false,
    landingVy: 0,

    edvBoostTimer: 0,
    killCount: 0,

    init: function() {
        this.lives = PR.CONST.PLAYER_LIVES;
        this.continues = PR.CONST.CONTINUES;
        this.score = 0;
        this.weapon = PR.CONST.WEAPON_PARCEL;
        this.ammo = -1;
        this.killCount = 0;
        this.respawn();
    },

    respawn: function() {
        this.x = 40;
        this.y = 100;
        this.vx = 0;
        this.vy = 0;
        this.health = PR.CONST.PLAYER_MAX_HP;
        this.state = 'idle';
        this.alive = true;
        this.invTimer = 120;
        this.inVehicle = false;
        this.vehicleTimer = 0;
        this.shootTimer = 0;
        this.hurtTimer = 0;
        this.deadTimer = 0;
        this.facing = 1;
        this.rolling = false;
        this.rollTimer = 0;
        this.rollCooldown = 0;
        this.grenades = 3;
        this.coyoteTimer = 0;
        this.jumpBuffer = 0;
        this.wasGrounded = false;
        this.edvBoostTimer = 0;
    },

    update: function() {
        var input = PR.Input;

        if (this.state === 'dead') {
            this.deadTimer++;
            this.vy += PR.CONST.GRAVITY;
            this.y += this.vy;
            if (this.deadTimer > 90) {
                this.lives--;
                if (this.lives > 0) {
                    this.respawn();
                }
            }
            return;
        }

        if (this.hurtTimer > 0) {
            this.hurtTimer--;
            this.state = 'hurt';
            this.vy += PR.CONST.GRAVITY;
            if (this.vy > PR.CONST.MAX_FALL) this.vy = PR.CONST.MAX_FALL;
            this.y += this.vy;
            this.x += this.vx;
            this.vx *= 0.9;
            this._resolveTiles();
            return;
        }

        if (this.invTimer > 0) this.invTimer--;
        if (this.shootTimer > 0) this.shootTimer--;
        if (this.rollCooldown > 0) this.rollCooldown--;
        if (this.edvBoostTimer > 0) this.edvBoostTimer--;
        if (this.comboTimer > 0) {
            this.comboTimer--;
            if (this.comboTimer <= 0) this.combo = 0;
        }

        // Coyote time: allow jump for 6 frames after leaving ground
        if (this.grounded) {
            this.coyoteTimer = 6;
        } else if (this.coyoteTimer > 0) {
            this.coyoteTimer--;
        }

        // Jump buffer
        if (this.jumpBuffer > 0) this.jumpBuffer--;

        // === DODGE ROLL ===
        if (this.rolling) {
            this.rollTimer--;
            this.vx = this.rollDir * 4.5;
            this.invTimer = Math.max(this.invTimer, 2);
            if (this.rollTimer <= 0) {
                this.rolling = false;
                this.rollCooldown = 20;
                PR.Particles.emit(this.x + this.w / 2, this.y + this.h, 'dust');
            }
            // Still apply gravity and tiles during roll
            this.vy += PR.CONST.GRAVITY;
            if (this.vy > PR.CONST.MAX_FALL) this.vy = PR.CONST.MAX_FALL;
            this.x += this.vx;
            this.y += this.vy;
            this._resolveTiles();
            this._clampToBounds();
            this.state = 'crouch';
            this._updateAnim();
            return;
        }

        // Vehicle timer
        if (this.inVehicle) {
            this.vehicleTimer--;
            if (this.vehicleTimer <= 0 || this.vehicleHealth <= 0) {
                this.exitVehicle();
            }
        }

        var speed = this.inVehicle ? PR.CONST.EDV_SPEED : PR.CONST.PLAYER_SPEED;

        // eDV boost
        if (this.inVehicle && this.edvBoostTimer <= 0 && input.justPressed('jump')) {
            speed *= 2;
            this.edvBoostTimer = 180; // 3 second cooldown
            PR.Particles.emit(this.x, this.y + this.h, 'dust');
            PR.Camera.shake(2, 8);
        }

        // eDV horn
        if (this.inVehicle && input.justPressed('special')) {
            PR.Audio.play('van_horn');
        }

        // Movement with speed ramp
        if (input.actions.left) {
            this.vx = PR.Utils.lerp(this.vx, -speed, 0.3);
            this.facing = -1;
        } else if (input.actions.right) {
            this.vx = PR.Utils.lerp(this.vx, speed, 0.3);
            this.facing = 1;
        } else {
            this.vx *= PR.CONST.FRICTION;
            if (Math.abs(this.vx) < 0.1) this.vx = 0;
        }

        // Double-tap dodge roll detection
        if (!this.inVehicle && this.rollCooldown <= 0) {
            if (input.justPressed('left') || input.justPressed('right')) {
                // Actually check via actions since we don't have justPressed for directions
                // Use down+jump for dodge roll instead (more reliable)
            }
            if (input.actions.down && input.justPressed('jump') && this.grounded) {
                this.rolling = true;
                this.rollTimer = 15;
                this.rollDir = this.facing;
                this.invTimer = 15;
                PR.Particles.emit(this.x + this.w / 2, this.y + this.h, 'dust');
                PR.Audio.play('jump');
                return;
            }
        }

        // Jump with jump buffer
        if (input.justPressed('jump')) {
            this.jumpBuffer = 6;
        }

        var canJump = this.grounded || this.coyoteTimer > 0;
        if (this.jumpBuffer > 0 && canJump && !this.inVehicle) {
            this.vy = PR.CONST.PLAYER_JUMP;
            this.grounded = false;
            this.coyoteTimer = 0;
            this.jumpBuffer = 0;
            PR.Audio.play('jump');
            PR.Particles.emit(this.x + this.w / 2, this.y + this.h, 'dust');
        }

        // Variable jump height
        if (!input.actions.jump && this.vy < -2) {
            this.vy *= 0.7;
        }

        // Crouch
        var crouching = input.actions.down && this.grounded && !this.inVehicle;

        // Shoot
        if (input.actions.shoot && this.shootTimer <= 0) {
            this.shoot();
        }

        // Grenade (special key, not in vehicle)
        if (!this.inVehicle && input.justPressed('special') && this.grenades > 0) {
            this._throwGrenade();
        }

        // Gravity
        this.vy += PR.CONST.GRAVITY;
        if (this.vy > PR.CONST.MAX_FALL) this.vy = PR.CONST.MAX_FALL;

        // Track pre-landing velocity
        this.landingVy = this.vy;
        this.wasGrounded = this.grounded;

        // Apply velocity
        this.x += this.vx;
        this.y += this.vy;

        // Resolve tile collisions
        this._resolveTiles();
        this._clampToBounds();

        // Landing impact
        if (this.grounded && !this.wasGrounded && this.landingVy > 3.5) {
            PR.Particles.emit(this.x + this.w / 2, this.y + this.h, 'dust');
            if (this.landingVy > 5) PR.Camera.shake(1, 3);
        }

        // Running particles
        if (this.grounded && Math.abs(this.vx) > 1 && this.frameCount % 12 === 0) {
            PR.Particles.emit(this.x + this.w / 2, this.y + this.h, 'dust');
        }

        // eDV smoke
        if (this.inVehicle && this.animTimer % 8 === 0) {
            PR.Particles.emit(this.x, this.y + this.h - 2, 'smoke');
        }

        // Update state
        if (crouching) {
            this.state = 'crouch';
        } else if (this.shootTimer > this.shootCooldown - 4) {
            this.state = 'shoot';
        } else if (!this.grounded) {
            this.state = this.vy < 0 ? 'jump' : 'fall';
        } else if (Math.abs(this.vx) > 0.3) {
            this.state = 'run';
        } else {
            this.state = 'idle';
        }

        this._updateAnim();
    },

    _updateAnim: function() {
        this.animTimer++;
        if (this.animTimer >= 6) {
            this.animTimer = 0;
            this.animFrame++;
        }
    },

    _clampToBounds: function() {
        if (this.x < PR.Camera.x - 8) this.x = PR.Camera.x - 8;
        if (this.x > PR.Camera.levelWidth - this.w) this.x = PR.Camera.levelWidth - this.w;
    },

    _resolveTiles: function() {
        if (!PR.Level || !PR.Level.tilemap) return;
        var tm = PR.Level.tilemap;

        // Y axis
        this.grounded = false;
        var bottom = this.y + this.h;
        var top = this.y;
        var left = this.x + 2;
        var right = this.x + this.w - 2;

        if (this.vy >= 0) {
            var tileY = Math.floor(bottom / PR.CONST.TILE_SIZE);
            var tileL = Math.floor(left / PR.CONST.TILE_SIZE);
            var tileR = Math.floor(right / PR.CONST.TILE_SIZE);
            for (var tx = tileL; tx <= tileR; tx++) {
                if (tm.isSolid(tx, tileY)) {
                    this.y = tileY * PR.CONST.TILE_SIZE - this.h;
                    this.vy = 0;
                    this.grounded = true;
                    break;
                }
            }
        } else {
            var tileYt = Math.floor(top / PR.CONST.TILE_SIZE);
            var tileLt = Math.floor(left / PR.CONST.TILE_SIZE);
            var tileRt = Math.floor(right / PR.CONST.TILE_SIZE);
            for (var txa = tileLt; txa <= tileRt; txa++) {
                if (tm.isSolid(txa, tileYt)) {
                    this.y = (tileYt + 1) * PR.CONST.TILE_SIZE;
                    this.vy = 0;
                    break;
                }
            }
        }

        // X axis
        left = this.x;
        right = this.x + this.w;
        top = this.y + 2;
        bottom = this.y + this.h - 2;

        var tileT = Math.floor(top / PR.CONST.TILE_SIZE);
        var tileB = Math.floor(bottom / PR.CONST.TILE_SIZE);

        if (this.vx > 0) {
            var tileXr = Math.floor(right / PR.CONST.TILE_SIZE);
            for (var ty = tileT; ty <= tileB; ty++) {
                if (tm.isSolid(tileXr, ty)) {
                    this.x = tileXr * PR.CONST.TILE_SIZE - this.w;
                    this.vx = 0;
                    break;
                }
            }
        } else if (this.vx < 0) {
            var tileXl = Math.floor(left / PR.CONST.TILE_SIZE);
            for (var tyl = tileT; tyl <= tileB; tyl++) {
                if (tm.isSolid(tileXl, tyl)) {
                    this.x = (tileXl + 1) * PR.CONST.TILE_SIZE;
                    this.vx = 0;
                    break;
                }
            }
        }
    },

    shoot: function() {
        var projX = this.facing > 0 ? this.x + this.w : this.x - 8;
        var projY = this.y + 8;
        var weapon = this.weapon;

        if (this.state === 'crouch') projY = this.y + 14;

        switch (weapon) {
            case PR.CONST.WEAPON_PARCEL:
                PR.Projectiles.spawn(projX, projY, this.facing * PR.CONST.PROJ_PARCEL_SPEED, -1, 'parcel', 1);
                this.shootCooldown = 14;
                PR.Audio.play('shoot');
                break;
            case PR.CONST.WEAPON_CANNON:
                PR.Projectiles.spawn(projX, projY, this.facing * PR.CONST.PROJ_CANNON_SPEED, 0, 'cannon', 2);
                this.shootCooldown = 6;
                PR.Audio.play('cannon');
                // Recoil
                this.vx -= this.facing * 0.8;
                PR.Camera.shake(1, 4);
                break;
            case PR.CONST.WEAPON_SPRAY:
                for (var i = -1; i <= 1; i++) {
                    var spreadY = i * 1.2 + PR.Utils.randFloat(-0.3, 0.3);
                    PR.Projectiles.spawn(projX, projY, this.facing * PR.CONST.PROJ_SPRAY_SPEED, spreadY, 'letter', 1);
                }
                this.shootCooldown = 10;
                PR.Audio.play('spray');
                PR.Particles.emit(projX, projY, 'letter_confetti');
                break;
            case PR.CONST.WEAPON_STAMP:
                PR.Projectiles.spawn(projX, projY, this.facing * PR.CONST.PROJ_STAMP_SPEED, 0, 'stamp', 4);
                this.shootCooldown = 18;
                PR.Audio.play('stamp_throw');
                break;
        }

        // Slight randomization for organic feel
        this.shootTimer = this.shootCooldown + PR.Utils.randInt(-1, 1);

        if (this.ammo > 0) {
            this.ammo--;
            if (this.ammo <= 0) {
                this.weapon = PR.CONST.WEAPON_PARCEL;
                this.ammo = -1;
            }
        }
    },

    _throwGrenade: function() {
        this.grenades--;
        var gx = this.facing > 0 ? this.x + this.w : this.x - 6;
        var gy = this.y + 4;
        PR.Projectiles.spawn(gx, gy, this.facing * 3, -3, 'grenade', 3);
        PR.Audio.play('cannon');
    },

    takeDamage: function(amount) {
        if (this.invTimer > 0) return;
        if (this.inVehicle) {
            this.vehicleHealth -= amount;
            PR.Camera.shake(2, 6);
            PR.Audio.play('hit');
            if (this.vehicleHealth <= 0) this.exitVehicle();
            return;
        }

        this.health -= amount;
        this.hurtTimer = 20;
        this.invTimer = PR.CONST.INVINCIBLE_TIME;
        this.vx = -this.facing * 2;
        this.vy = -3;
        PR.Camera.shake(4, 12);
        PR.Audio.play('hit');

        if (this.health <= 0) this.die();
    },

    die: function() {
        this.state = 'dead';
        this.vy = -5;
        this.vx = -this.facing * 1;
        this.deadTimer = 0;
        PR.Audio.play('death');
        PR.Camera.shake(6, 20);
        if (PR.Game) PR.Game.flash('#FF0000', 0.5);
    },

    enterVehicle: function() {
        this.inVehicle = true;
        this.vehicleTimer = PR.CONST.EDV_DURATION;
        this.vehicleHealth = PR.CONST.EDV_HP;
        this.w = 32;
        this.h = 20;
        this.edvBoostTimer = 0;
        PR.Audio.play('pickup_edv');
        PR.Camera.shake(2, 6);
    },

    exitVehicle: function() {
        this.inVehicle = false;
        this.w = 12;
        this.h = 22;
        this.invTimer = 60;
        this.vy = -4;
        PR.Particles.emit(this.x + 16, this.y + 10, 'explosion');
        PR.Camera.shake(5, 15);
        PR.Audio.play('explosion');
        if (PR.Game) PR.Game.flash('#FFFFFF', 0.4);
    },

    addScore: function(points) {
        this.combo++;
        this.comboTimer = 120;
        this.killCount++;
        var multiplier = Math.min(this.combo, 5);
        var total = points * multiplier;
        this.score += total;
        PR.Particles.emitScore(this.x, this.y - 8, total);

        // Hitstop on kills
        if (PR.Game) {
            PR.Game.hitstop(3);
            if (this.combo >= 3) PR.Game.flash('#FFFFFF', 0.15);
        }
    },

    render: function(ctx) {
        if (this.invTimer > 0 && Math.floor(this.invTimer / 3) % 2 === 0) return;

        var spriteKey;
        var flipX = this.facing < 0;

        if (this.inVehicle) {
            spriteKey = 'edv_manned';
            PR.SpriteCache.draw(ctx, spriteKey, Math.round(this.x), Math.round(this.y), flipX);
            return;
        }

        switch (this.state) {
            case 'idle':
                spriteKey = 'player_idle_' + (this.animFrame % 2);
                break;
            case 'run':
                spriteKey = 'player_run_' + (this.animFrame % 4);
                break;
            case 'jump':
                spriteKey = 'player_jump';
                break;
            case 'fall':
                spriteKey = 'player_fall';
                break;
            case 'shoot':
                spriteKey = 'player_shoot';
                break;
            case 'crouch':
                spriteKey = 'player_crouch';
                break;
            case 'hurt':
                spriteKey = 'player_hurt';
                break;
            case 'dead':
                spriteKey = this.deadTimer < 30 ? 'player_die_0' : 'player_die_1';
                break;
            default:
                spriteKey = 'player_idle_0';
        }

        // Draw with offset to center sprite on hitbox
        var drawX = Math.round(this.x - 2);
        var drawY = Math.round(this.y - 2);

        // Roll spin effect
        if (this.rolling) {
            ctx.save();
            ctx.translate(drawX + 8, drawY + 12);
            ctx.rotate(this.rollTimer * 0.4 * this.rollDir);
            ctx.translate(-8, -12);
            PR.SpriteCache.draw(ctx, spriteKey, 0, 0, flipX);
            ctx.restore();
        } else {
            PR.SpriteCache.draw(ctx, spriteKey, drawX, drawY, flipX);
        }
    },

    getBounds: function() {
        return { x: this.x, y: this.y, w: this.w, h: this.h };
    },

    // frameCount proxy
    get frameCount() { return PR.Game ? PR.Game.frameCount : 0; }
};
