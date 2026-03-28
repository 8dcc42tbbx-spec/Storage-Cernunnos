// Postie Run - Enemy System
PR.Enemies = {
    list: [],

    init: function() {
        this.list = [];
    },

    spawn: function(type, x, y, params) {
        var e = new PR.Enemy(type, x, y, params);
        this.list.push(e);
        return e;
    },

    update: function() {
        for (var i = this.list.length - 1; i >= 0; i--) {
            var e = this.list[i];
            e.update();
            if (!e.alive) {
                if (e.health <= 0) {
                    PR.Player.addScore(e.scoreValue);
                    // Drop chance
                    if (Math.random() < e.dropChance) {
                        PR.Pickups.spawnRandom(e.x + e.w / 2, e.y);
                    }
                }
                this.list.splice(i, 1);
            }
        }
    },

    render: function(ctx) {
        for (var i = 0; i < this.list.length; i++) {
            var e = this.list[i];
            if (e.isOnScreen()) {
                e.render(ctx);
            }
        }
    }
};

// Enemy constructor
PR.Enemy = function(type, x, y, params) {
    params = params || {};
    this.type = type;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.alive = true;
    this.facing = -1; // face left by default (toward player)
    this.animFrame = 0;
    this.animTimer = 0;
    this.flashTimer = 0;
    this.grounded = false;
    this.aiTimer = 0;
    this.aiState = 'idle';
    this.removeOffscreen = true;
    this.canBeStomped = false;
    this.contactDamage = 1;
    this.isBoss = false;

    // Type-specific setup
    var cfg = PR.Enemy.CONFIGS[type];
    if (cfg) {
        this.w = cfg.w;
        this.h = cfg.h;
        this.health = cfg.health;
        this.maxHealth = cfg.health;
        this.scoreValue = cfg.score;
        this.dropChance = cfg.dropChance || 0.1;
        this.speed = cfg.speed || 1;
        this.contactDamage = cfg.contactDamage || 1;
        this.canBeStomped = cfg.canBeStomped || false;
        this.isBoss = cfg.isBoss || false;
        if (cfg.init) cfg.init.call(this, params);
    } else {
        this.w = 16;
        this.h = 16;
        this.health = 1;
        this.maxHealth = 1;
        this.scoreValue = 100;
        this.dropChance = 0.1;
        this.speed = 1;
    }
};

PR.Enemy.prototype.update = function() {
    var cfg = PR.Enemy.CONFIGS[this.type];
    if (cfg && cfg.update) {
        cfg.update.call(this);
    } else {
        // Default: walk left
        this.vx = -this.speed;
    }

    // Gravity for ground enemies
    if (cfg && !cfg.flying) {
        this.vy += PR.CONST.GRAVITY;
        if (this.vy > PR.CONST.MAX_FALL) this.vy = PR.CONST.MAX_FALL;
    }

    this.x += this.vx;
    this.y += this.vy;

    // Ground collision for ground enemies
    if (cfg && !cfg.flying && !cfg.stationary) {
        this._resolveGround();
    }

    // Animation
    this.animTimer++;
    if (this.animTimer >= 8) {
        this.animTimer = 0;
        this.animFrame++;
    }

    if (this.flashTimer > 0) this.flashTimer--;

    // Remove if far off screen left
    if (this.x < PR.Camera.x - 120) this.alive = false;
    // Remove if fell off world
    if (this.y > PR.CONST.CANVAS_H + 50) this.alive = false;
};

PR.Enemy.prototype._resolveGround = function() {
    if (!PR.Level || !PR.Level.tilemap) return;
    var tm = PR.Level.tilemap;
    this.grounded = false;

    if (this.vy >= 0) {
        var bottom = this.y + this.h;
        var tileY = Math.floor(bottom / PR.CONST.TILE_SIZE);
        var tileX = Math.floor((this.x + this.w / 2) / PR.CONST.TILE_SIZE);
        if (tm.isSolid(tileX, tileY)) {
            this.y = tileY * PR.CONST.TILE_SIZE - this.h;
            this.vy = 0;
            this.grounded = true;
        }
    }
};

PR.Enemy.prototype.takeDamage = function(amount, stampHit) {
    if (this.flashTimer > 0 && !this.isBoss) return;
    this.health -= amount;
    this.flashTimer = 6;
    PR.Audio.play('enemy_hit');

    if (this.health <= 0) {
        this.die(stampHit);
    }
};

PR.Enemy.prototype.die = function(stampHit) {
    this.alive = false;
    PR.Particles.emit(this.x + this.w / 2, this.y + this.h / 2, 'explosion');
    if (stampHit) {
        PR.Particles.emitStampMark(this.x + this.w / 2 - 7, this.y + this.h / 2 - 4);
    }
    PR.Camera.shake(3, 8);
    PR.Audio.play('explosion');

    if (this.isBoss) {
        // Big boss explosion
        for (var i = 0; i < 5; i++) {
            setTimeout(function(ex, ey) {
                PR.Particles.emit(
                    ex + PR.Utils.randInt(-20, 20),
                    ey + PR.Utils.randInt(-20, 20),
                    'explosion'
                );
            }, i * 200, this.x + this.w / 2, this.y + this.h / 2);
        }
        PR.Camera.shake(8, 30);
    }
};

PR.Enemy.prototype.render = function(ctx) {
    if (this.flashTimer > 0 && this.flashTimer % 2 === 0) return;

    var cfg = PR.Enemy.CONFIGS[this.type];
    if (cfg && cfg.render) {
        cfg.render.call(this, ctx);
    } else {
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }
};

PR.Enemy.prototype.isOnScreen = function() {
    return PR.Camera.isVisible(this.x, this.y, this.w, this.h);
};

PR.Enemy.prototype.getBounds = function() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
};

// ============================================================
// ENEMY TYPE CONFIGURATIONS
// ============================================================
PR.Enemy.CONFIGS = {
    // ANGRY DOG
    dog: {
        w: 14, h: 10, health: 2, score: 200, speed: 2.5,
        dropChance: 0.15, contactDamage: 1, canBeStomped: true,
        init: function() { this.aiState = 'chase'; },
        update: function() {
            // Chase player
            var dx = PR.Player.x - this.x;
            this.facing = dx > 0 ? 1 : -1;
            this.vx = this.facing * this.speed;
            // Jump if close
            if (Math.abs(dx) < 40 && this.grounded && Math.random() < 0.03) {
                this.vy = -4;
            }
        },
        render: function(ctx) {
            var key = 'dog_' + (this.animFrame % 2);
            PR.SpriteCache.draw(ctx, key, this.x - 1, this.y - 2, this.facing > 0);
        }
    },

    // SWOOPING MAGPIE
    magpie: {
        w: 14, h: 10, health: 2, score: 300, speed: 1.5,
        dropChance: 0.1, contactDamage: 1, flying: true,
        init: function() {
            this.baseY = this.y;
            this.swoopTimer = PR.Utils.randInt(60, 120);
            this.aiState = 'fly';
            this.sineOffset = Math.random() * Math.PI * 2;
        },
        update: function() {
            if (this.aiState === 'fly') {
                this.vx = -this.speed;
                this.y = this.baseY + Math.sin((this.animTimer + this.sineOffset) * 0.05) * 15;
                this.vy = 0;
                this.swoopTimer--;
                if (this.swoopTimer <= 0 && Math.abs(this.x - PR.Player.x) < 60) {
                    this.aiState = 'swoop';
                    var angle = PR.Utils.angle(this.x, this.y, PR.Player.x, PR.Player.y);
                    this.vx = Math.cos(angle) * 3;
                    this.vy = Math.sin(angle) * 3;
                }
            } else if (this.aiState === 'swoop') {
                this.swoopTimer++;
                if (this.swoopTimer > 30) {
                    this.aiState = 'fly';
                    this.swoopTimer = PR.Utils.randInt(90, 150);
                    this.baseY = this.y - 20;
                    this.vy = -1;
                    this.vx = -this.speed;
                }
            }
        },
        render: function(ctx) {
            var key = this.aiState === 'swoop' ? 'magpie_swoop' : 'magpie_' + (this.animFrame % 2);
            PR.SpriteCache.draw(ctx, key, this.x - 1, this.y - 1, this.facing > 0);
        }
    },

    // SEAGULL (coastal reskin of magpie)
    seagull: {
        w: 14, h: 10, health: 2, score: 300, speed: 1.3,
        dropChance: 0.1, contactDamage: 1, flying: true,
        init: function() {
            this.baseY = this.y;
            this.swoopTimer = PR.Utils.randInt(60, 120);
            this.aiState = 'fly';
            this.sineOffset = Math.random() * Math.PI * 2;
        },
        update: function() {
            // Same as magpie
            PR.Enemy.CONFIGS.magpie.update.call(this);
        },
        render: function(ctx) {
            var key = 'seagull_' + (this.animFrame % 2);
            PR.SpriteCache.draw(ctx, key, this.x - 1, this.y - 1, this.facing > 0);
        }
    },

    // AMAZON VAN
    van: {
        w: 44, h: 22, health: 5, score: 500, speed: 2.8,
        dropChance: 0.4, contactDamage: 2,
        init: function(params) {
            this.fromRight = params.fromRight !== false;
            if (this.fromRight) {
                this.x = PR.Camera.x + PR.CONST.CANVAS_W + 20;
                this.facing = -1;
                this.vx = -this.speed;
            } else {
                this.facing = 1;
                this.vx = this.speed;
            }
            this.honked = false;
        },
        update: function() {
            // Honk when entering screen
            if (!this.honked && this.isOnScreen()) {
                PR.Audio.play('van_horn');
                this.honked = true;
            }
            this.vx = this.facing * this.speed;
            // Remove if passed through
            if (this.facing < 0 && this.x < PR.Camera.x - 80) this.alive = false;
            if (this.facing > 0 && this.x > PR.Camera.x + PR.CONST.CANVAS_W + 80) this.alive = false;
        },
        render: function(ctx) {
            PR.SpriteCache.draw(ctx, 'van', this.x - 2, this.y - 4, this.facing > 0);
        }
    },

    // ANGRY PERSON
    person: {
        w: 12, h: 22, health: 3, score: 250, speed: 0.5,
        dropChance: 0.2, contactDamage: 1,
        init: function() {
            this.throwTimer = PR.Utils.randInt(40, 80);
        },
        update: function() {
            this.facing = PR.Player.x > this.x ? 1 : -1;
            this.throwTimer--;
            if (this.throwTimer <= 0) {
                // Throw "sorry we missed you" card
                var px = this.facing > 0 ? this.x + this.w : this.x - 8;
                PR.Projectiles.spawnEnemy(px, this.y + 6, this.facing * 2, -1, 'card', 1);
                this.throwTimer = PR.Utils.randInt(60, 100);
                PR.Audio.play('throw');
            }
        },
        render: function(ctx) {
            var key = 'person_' + (this.animFrame % 2);
            PR.SpriteCache.draw(ctx, key, this.x - 2, this.y - 2, this.facing > 0);
        }
    },

    // WHEELIE BIN
    bin: {
        w: 10, h: 14, health: 1, score: 100, speed: 0,
        dropChance: 0.15, contactDamage: 1, stationary: true,
        init: function(params) {
            this.rolling = params.rolling || false;
            if (this.rolling) {
                this.vx = -1.5;
                this.speed = 1.5;
            }
        },
        update: function() {
            if (this.rolling) {
                this.vx = -this.speed;
            }
        },
        render: function(ctx) {
            PR.SpriteCache.draw(ctx, 'bin', this.x - 1, this.y - 1, false);
        }
    },

    // SPRINKLER
    sprinkler: {
        w: 10, h: 6, health: 1, score: 50, speed: 0,
        dropChance: 0, contactDamage: 0, stationary: true,
        init: function() {
            this.sprayTimer = 0;
            this.spraying = false;
        },
        update: function() {
            this.sprayTimer++;
            this.spraying = (this.sprayTimer % 120) < 60;
            if (this.spraying && this.sprayTimer % 4 === 0) {
                PR.Particles.emit(this.x + 5, this.y, 'water_splash');
                // Check if player is in spray range
                var px = PR.Player.x, py = PR.Player.y;
                if (Math.abs(px - this.x) < 30 && Math.abs(py - this.y) < 30) {
                    PR.Player.takeDamage(1);
                }
            }
        },
        render: function(ctx) {
            PR.SpriteCache.draw(ctx, 'sprinkler', this.x, this.y, false);
        }
    },

    // LAWN MOWER
    mower: {
        w: 18, h: 12, health: 3, score: 350, speed: 0.8,
        dropChance: 0.2, contactDamage: 2,
        init: function() {
            this.startX = this.x;
            this.moveRange = 60;
            this.dir = -1;
        },
        update: function() {
            this.vx = this.dir * this.speed;
            this.facing = this.dir;
            if (this.x < this.startX - this.moveRange) this.dir = 1;
            if (this.x > this.startX + this.moveRange) this.dir = -1;
            // Smoke particles
            if (this.animTimer % 15 === 0) {
                PR.Particles.emit(this.x + this.w / 2, this.y, 'smoke');
            }
        },
        render: function(ctx) {
            PR.SpriteCache.draw(ctx, 'mower', this.x - 1, this.y - 1, this.facing > 0);
        }
    },

    // CAT ON FENCE
    cat: {
        w: 10, h: 12, health: 1, score: 150, speed: 0,
        dropChance: 0.05, contactDamage: 1, stationary: true,
        init: function() {
            this.swipeTimer = 0;
            this.swiping = false;
        },
        update: function() {
            var dx = Math.abs(PR.Player.x - this.x);
            var dy = Math.abs(PR.Player.y - this.y);
            this.facing = PR.Player.x > this.x ? 1 : -1;
            if (dx < 20 && dy < 20) {
                this.swiping = true;
                this.swipeTimer++;
            } else {
                this.swiping = false;
                this.swipeTimer = 0;
            }
        },
        render: function(ctx) {
            var key = this.swiping ? 'cat_1' : 'cat_0';
            PR.SpriteCache.draw(ctx, key, this.x - 1, this.y - 1, this.facing < 0);
        }
    },

    // GARDEN HOSE
    hose: {
        w: 6, h: 6, health: 1, score: 50, speed: 0,
        dropChance: 0, contactDamage: 0, stationary: true,
        init: function() {
            this.sprayTimer = 0;
        },
        update: function() {
            this.sprayTimer++;
            if (this.sprayTimer % 3 === 0) {
                PR.Particles.emit(this.x + 7, this.y, 'water_splash');
            }
            // Damage check
            var px = PR.Player.x, py = PR.Player.y;
            if (px > this.x && px < this.x + 40 && Math.abs(py - this.y) < 20) {
                if (this.sprayTimer % 30 === 0) PR.Player.takeDamage(1);
            }
        },
        render: function(ctx) {
            PR.SpriteCache.draw(ctx, 'hose', this.x, this.y, false);
        }
    },

    // EMU
    emu: {
        w: 16, h: 22, health: 4, score: 400, speed: 2.2,
        dropChance: 0.2, contactDamage: 2,
        init: function() { this.aiState = 'chase'; },
        update: function() {
            var dx = PR.Player.x - this.x;
            this.facing = dx > 0 ? 1 : -1;
            this.vx = this.facing * this.speed;
            // Kick when close
            if (Math.abs(dx) < 20 && this.grounded && Math.random() < 0.02) {
                this.vy = -3;
            }
        },
        render: function(ctx) {
            var key = 'emu_' + (this.animFrame % 2);
            PR.SpriteCache.draw(ctx, key, this.x - 2, this.y - 2, this.facing > 0);
        }
    },

    // DROP BEAR
    dropbear: {
        w: 12, h: 12, health: 3, score: 350, speed: 0,
        dropChance: 0.25, contactDamage: 2, flying: true,
        init: function() {
            this.aiState = 'waiting';
            this.startY = this.y;
        },
        update: function() {
            if (this.aiState === 'waiting') {
                // Wait until player is below
                if (Math.abs(PR.Player.x - this.x) < 20 && PR.Player.y > this.y) {
                    this.aiState = 'dropping';
                    this.vy = 0;
                }
            } else if (this.aiState === 'dropping') {
                this.vy += 0.3;
                if (this.vy > 5) this.vy = 5;
                if (this.y > PR.CONST.CANVAS_H + 20) this.alive = false;
            }
        },
        render: function(ctx) {
            PR.SpriteCache.draw(ctx, 'dropbear', this.x - 1, this.y - 1, false);
        }
    },

    // ROAD TRAIN
    roadtrain: {
        w: 60, h: 20, health: 10, score: 1000, speed: 3.5,
        dropChance: 0.5, contactDamage: 3,
        init: function() {
            this.x = PR.Camera.x + PR.CONST.CANVAS_W + 30;
            this.facing = -1;
            this.honked = false;
        },
        update: function() {
            this.vx = -this.speed;
            if (!this.honked && this.x < PR.Camera.x + PR.CONST.CANVAS_W + 10) {
                PR.Audio.play('van_horn');
                PR.Audio.play('van_horn');
                this.honked = true;
            }
            if (this.x < PR.Camera.x - 100) this.alive = false;
        },
        render: function(ctx) {
            PR.SpriteCache.draw(ctx, 'roadtrain', this.x - 2, this.y - 2, false);
        }
    },

    // BOSS: GIANT ROTTWEILER
    rottweiler: {
        w: 44, h: 36, health: 50, score: 5000, speed: 1.5,
        dropChance: 0, contactDamage: 3, isBoss: true,
        init: function() {
            this.aiState = 'idle';
            this.aiTimer = 60;
            this.attackPattern = 0;
            this.summonCount = 0;
            this.maxSummons = 3;
            this.phaseTwo = false;
        },
        update: function() {
            if (!this.phaseTwo && this.health < this.maxHealth / 2) {
                this.phaseTwo = true;
                this.speed = 2.5;
                this.maxSummons = 5;
                PR.Camera.shake(6, 20);
            }

            this.facing = PR.Player.x > this.x ? 1 : -1;
            this.aiTimer--;

            if (this.aiTimer <= 0) {
                this.attackPattern = (this.attackPattern + 1) % 4;
                switch (this.attackPattern) {
                    case 0: // Charge
                        this.aiState = 'charge';
                        this.vx = this.facing * this.speed * 2.5;
                        this.aiTimer = 40;
                        PR.Audio.play('dog_bark');
                        break;
                    case 1: // Leap
                        this.aiState = 'leap';
                        this.vy = -6;
                        this.vx = this.facing * 2;
                        this.aiTimer = 50;
                        break;
                    case 2: // Bark projectile
                        this.aiState = 'bark';
                        var bx = this.facing > 0 ? this.x + this.w : this.x - 8;
                        PR.Projectiles.spawnEnemy(bx, this.y + 12, this.facing * 3, 0, 'card', 2);
                        PR.Projectiles.spawnEnemy(bx, this.y + 8, this.facing * 3, -1, 'card', 2);
                        this.aiTimer = 40;
                        PR.Audio.play('dog_bark');
                        PR.Camera.shake(2, 6);
                        break;
                    case 3: // Summon chihuahuas
                        this.aiState = 'summon';
                        this.aiTimer = 60;
                        for (var i = 0; i < this.maxSummons; i++) {
                            var sx = this.x + PR.Utils.randInt(-40, 40);
                            var sy = this.y - 20;
                            PR.Enemies.spawn('chihuahua', sx, sy);
                        }
                        PR.Audio.play('dog_bark');
                        break;
                }
            }

            if (this.aiState === 'charge') {
                // vx already set
            } else if (this.aiState === 'leap') {
                // Gravity handled externally
            } else if (this.aiState === 'idle' || this.aiState === 'bark' || this.aiState === 'summon') {
                this.vx *= 0.9;
            }

            // Keep on screen
            if (this.x < PR.Camera.x + 20) {
                this.x = PR.Camera.x + 20;
                this.vx = Math.abs(this.vx);
            }
            if (this.x > PR.Camera.x + PR.CONST.CANVAS_W - this.w - 20) {
                this.x = PR.Camera.x + PR.CONST.CANVAS_W - this.w - 20;
                this.vx = -Math.abs(this.vx);
            }
        },
        render: function(ctx) {
            var key = 'rottweiler_' + (this.animFrame % 2);
            PR.SpriteCache.draw(ctx, key, this.x - 2, this.y - 2, this.facing > 0);

            // Boss health bar
            var barW = 80;
            var barX = this.x + this.w / 2 - barW / 2;
            var barY = this.y - 10;
            var pct = this.health / this.maxHealth;
            ctx.fillStyle = '#000000';
            ctx.fillRect(barX, barY, barW, 4);
            ctx.fillStyle = pct > 0.3 ? '#CC0000' : '#FF0000';
            ctx.fillRect(barX + 1, barY + 1, (barW - 2) * pct, 2);
        }
    },

    // CHIHUAHUA (boss summon)
    chihuahua: {
        w: 8, h: 6, health: 1, score: 100, speed: 2.8,
        dropChance: 0.05, contactDamage: 1, canBeStomped: true,
        init: function() {},
        update: function() {
            var dx = PR.Player.x - this.x;
            this.facing = dx > 0 ? 1 : -1;
            this.vx = this.facing * this.speed;
            // Erratic jumping
            if (this.grounded && Math.random() < 0.05) {
                this.vy = -3.5;
            }
        },
        render: function(ctx) {
            var key = 'chihuahua_' + (this.animFrame % 2);
            PR.SpriteCache.draw(ctx, key, this.x - 1, this.y - 1, this.facing > 0);
        }
    }
};
