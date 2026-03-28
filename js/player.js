// Postie Run - Player (Ernie the Postie)
PR.Player = {
    x: 40, y: 0, w: 12, h: 22,
    vx: 0, vy: 0,
    facing: 1,
    grounded: false,
    state: 'idle', // idle, run, jump, fall, crouch, shoot, hurt, dead, driving
    lives: 3,
    health: 5,
    maxHealth: 5,
    score: 0,
    weapon: 0, // PR.CONST.WEAPON_PARCEL
    ammo: -1, // -1 = infinite
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

    init: function() {
        this.lives = PR.CONST.PLAYER_LIVES;
        this.continues = PR.CONST.CONTINUES;
        this.score = 0;
        this.weapon = PR.CONST.WEAPON_PARCEL;
        this.ammo = -1;
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
                // game.js handles game over check
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
            // Resolve tile collision
            this._resolveTiles();
            return;
        }

        if (this.invTimer > 0) this.invTimer--;
        if (this.shootTimer > 0) this.shootTimer--;
        if (this.comboTimer > 0) {
            this.comboTimer--;
            if (this.comboTimer <= 0) this.combo = 0;
        }

        // Vehicle timer
        if (this.inVehicle) {
            this.vehicleTimer--;
            if (this.vehicleTimer <= 0 || this.vehicleHealth <= 0) {
                this.exitVehicle();
            }
        }

        var speed = this.inVehicle ? PR.CONST.EDV_SPEED : PR.CONST.PLAYER_SPEED;

        // Movement
        if (input.actions.left) {
            this.vx = -speed;
            this.facing = -1;
        } else if (input.actions.right) {
            this.vx = speed;
            this.facing = 1;
        } else {
            this.vx *= PR.CONST.FRICTION;
            if (Math.abs(this.vx) < 0.1) this.vx = 0;
        }

        // Jump
        if (input.justPressed('jump') && this.grounded) {
            this.vy = PR.CONST.PLAYER_JUMP;
            this.grounded = false;
            PR.Audio.play('jump');
            PR.Particles.emit(this.x + this.w / 2, this.y + this.h, 'dust');
        }

        // Variable jump height
        if (!input.actions.jump && this.vy < -2) {
            this.vy *= 0.7;
        }

        // Crouch
        var crouching = input.actions.down && this.grounded;

        // Shoot
        if (input.actions.shoot && this.shootTimer <= 0) {
            this.shoot();
        }

        // Gravity
        this.vy += PR.CONST.GRAVITY;
        if (this.vy > PR.CONST.MAX_FALL) this.vy = PR.CONST.MAX_FALL;

        // Apply velocity
        this.x += this.vx;
        this.y += this.vy;

        // Resolve tile collisions
        this._resolveTiles();

        // Clamp to level bounds
        if (this.x < PR.Camera.x - 8) this.x = PR.Camera.x - 8;
        if (this.x > PR.Camera.levelWidth - this.w) this.x = PR.Camera.levelWidth - this.w;

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

        // Animation
        this.animTimer++;
        if (this.animTimer >= 6) {
            this.animTimer = 0;
            this.animFrame++;
        }
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
            // Falling - check below
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
            // Rising - check above
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

        if (this.state === 'crouch') {
            projY = this.y + 14;
        }

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
                break;
            case PR.CONST.WEAPON_SPRAY:
                for (var i = -1; i <= 1; i++) {
                    PR.Projectiles.spawn(projX, projY, this.facing * PR.CONST.PROJ_SPRAY_SPEED, i * 1.2, 'letter', 1);
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

        this.shootTimer = this.shootCooldown;

        // Consume ammo
        if (this.ammo > 0) {
            this.ammo--;
            if (this.ammo <= 0) {
                this.weapon = PR.CONST.WEAPON_PARCEL;
                this.ammo = -1;
            }
        }
    },

    takeDamage: function(amount) {
        if (this.invTimer > 0) return;
        if (this.inVehicle) {
            this.vehicleHealth -= amount;
            PR.Camera.shake(2, 6);
            PR.Audio.play('hit');
            if (this.vehicleHealth <= 0) {
                this.exitVehicle();
            }
            return;
        }

        this.health -= amount;
        this.hurtTimer = 20;
        this.invTimer = PR.CONST.INVINCIBLE_TIME;
        this.vx = -this.facing * 2;
        this.vy = -3;
        PR.Camera.shake(4, 12);
        PR.Audio.play('hit');

        if (this.health <= 0) {
            this.die();
        }
    },

    die: function() {
        this.state = 'dead';
        this.vy = -5;
        this.vx = -this.facing * 1;
        this.deadTimer = 0;
        PR.Audio.play('death');
        PR.Camera.shake(6, 20);
    },

    enterVehicle: function() {
        this.inVehicle = true;
        this.vehicleTimer = PR.CONST.EDV_DURATION;
        this.vehicleHealth = PR.CONST.EDV_HP;
        this.w = 32;
        this.h = 20;
        PR.Audio.play('pickup_edv');
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
    },

    addScore: function(points) {
        this.combo++;
        this.comboTimer = 120;
        var multiplier = Math.min(this.combo, 5);
        var total = points * multiplier;
        this.score += total;
        PR.Particles.emitScore(this.x, this.y - 8, total);
    },

    render: function(ctx) {
        // Invincibility flash
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
        PR.SpriteCache.draw(ctx, spriteKey, Math.round(this.x - 2), Math.round(this.y - 2), flipX);
    },

    getBounds: function() {
        return { x: this.x, y: this.y, w: this.w, h: this.h };
    }
};
