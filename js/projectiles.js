// Postie Run - Projectile System
PR.Projectiles = {
    player: [],  // player projectiles
    enemy: [],   // enemy projectiles

    init: function() {
        this.player = [];
        this.enemy = [];
    },

    spawn: function(x, y, vx, vy, type, damage) {
        this.player.push({
            x: x, y: y, vx: vx, vy: vy,
            type: type, damage: damage,
            alive: true, animFrame: 0, animTimer: 0,
            w: type === 'stamp' ? 8 : type === 'grenade' ? 6 : type === 'parcel' ? 7 : type === 'cannon' ? 5 : 4,
            h: type === 'stamp' ? 8 : type === 'grenade' ? 6 : type === 'parcel' ? 5 : type === 'cannon' ? 4 : 2,
            isStamp: type === 'stamp',
            isGrenade: type === 'grenade',
            grenadeTimer: type === 'grenade' ? 45 : 0,
            bounced: false,
            pierce: type === 'stamp' ? 2 : 0
        });
    },

    spawnEnemy: function(x, y, vx, vy, type, damage) {
        this.enemy.push({
            x: x, y: y, vx: vx, vy: vy,
            type: type, damage: damage,
            alive: true, animFrame: 0, animTimer: 0,
            w: 7, h: 5
        });
    },

    update: function() {
        // Update player projectiles
        for (var i = this.player.length - 1; i >= 0; i--) {
            var p = this.player[i];
            p.x += p.vx;
            p.y += p.vy;

            // Gravity for parcels and grenades
            if (p.type === 'parcel') {
                p.vy += 0.04;
            } else if (p.isGrenade) {
                p.vy += 0.25;
                p.grenadeTimer--;

                // Grenade bounces on ground
                if (PR.Level && PR.Level.tilemap) {
                    var gtx = Math.floor((p.x + p.w / 2) / PR.CONST.TILE_SIZE);
                    var gty = Math.floor((p.y + p.h) / PR.CONST.TILE_SIZE);
                    if (PR.Level.tilemap.isSolid(gtx, gty) && p.vy > 0) {
                        if (!p.bounced) {
                            p.bounced = true;
                            p.vy = -3;
                            p.vx *= 0.5;
                        } else {
                            p.vy = 0;
                            p.vx *= 0.8;
                        }
                        p.y = gty * PR.CONST.TILE_SIZE - p.h;
                    }
                }

                // Grenade explodes
                if (p.grenadeTimer <= 0) {
                    p.alive = false;
                    PR.Particles.emit(p.x, p.y, 'explosion');
                    PR.Particles.emit(p.x, p.y, 'explosion');
                    PR.Camera.shake(6, 15);
                    PR.Audio.play('explosion');
                    if (PR.Game) PR.Game.flash('#FFFFFF', 0.5);
                    // Damage all enemies in radius
                    for (var ge = 0; ge < PR.Enemies.list.length; ge++) {
                        var en = PR.Enemies.list[ge];
                        if (!en.alive || en.dying) continue;
                        if (PR.Utils.dist(p.x, p.y, en.x + en.w / 2, en.y + en.h / 2) < 45) {
                            en.takeDamage(3, false);
                        }
                    }
                    continue;
                }
            }

            // Stamp spins
            p.animTimer++;
            if (p.animTimer >= 3) {
                p.animTimer = 0;
                p.animFrame++;
            }

            // Remove if offscreen
            if (p.x < PR.Camera.x - 20 || p.x > PR.Camera.x + PR.Camera.viewW + 20 ||
                p.y < PR.Camera.y - 20 || p.y > PR.Camera.y + PR.Camera.viewH + 20) {
                p.alive = false;
            }

            // Tile collision (skip for grenades, they bounce instead)
            if (!p.isGrenade && PR.Level && PR.Level.tilemap) {
                var tx = Math.floor((p.x + p.w / 2) / PR.CONST.TILE_SIZE);
                var ty = Math.floor((p.y + p.h / 2) / PR.CONST.TILE_SIZE);
                if (PR.Level.tilemap.isSolid(tx, ty)) {
                    p.alive = false;
                    PR.Particles.emit(p.x, p.y, 'spark');
                }
            }

            // Enemy collision (skip for grenades, they explode on timer)
            if (!p.isGrenade) {
            for (var j = 0; j < PR.Enemies.list.length; j++) {
                var e = PR.Enemies.list[j];
                if (!e.alive || e.dying) continue;
                if (PR.Utils.aabb(
                    { x: p.x, y: p.y, w: p.w, h: p.h },
                    e.getBounds()
                )) {
                    e.takeDamage(p.damage, p.isStamp);
                    if (p.pierce > 0) {
                        p.pierce--;
                    } else {
                        p.alive = false;
                    }
                    PR.Particles.emit(p.x, p.y, 'spark');
                    break;
                }
            }
            }

            if (!p.alive) {
                this.player.splice(i, 1);
            }
        }

        // Update enemy projectiles
        for (var k = this.enemy.length - 1; k >= 0; k--) {
            var ep = this.enemy[k];
            ep.x += ep.vx;
            ep.y += ep.vy;
            ep.vy += 0.03; // slight gravity

            ep.animTimer++;
            if (ep.animTimer >= 4) {
                ep.animTimer = 0;
                ep.animFrame++;
            }

            // Offscreen removal
            if (ep.x < PR.Camera.x - 20 || ep.x > PR.Camera.x + PR.Camera.viewW + 20 ||
                ep.y > PR.Camera.y + PR.Camera.viewH + 20) {
                ep.alive = false;
            }

            // Player collision
            if (PR.Utils.aabb(
                { x: ep.x, y: ep.y, w: ep.w, h: ep.h },
                PR.Player.getBounds()
            )) {
                PR.Player.takeDamage(ep.damage);
                ep.alive = false;
            }

            if (!ep.alive) {
                this.enemy.splice(k, 1);
            }
        }
    },

    render: function(ctx) {
        // Player projectiles
        for (var i = 0; i < this.player.length; i++) {
            var p = this.player[i];
            var key;
            if (p.type === 'grenade') {
                // Draw grenade as flashing circle
                var flash = p.grenadeTimer < 15 && p.grenadeTimer % 4 < 2;
                ctx.fillStyle = flash ? '#FF0000' : '#444444';
                ctx.fillRect(Math.round(p.x), Math.round(p.y), 6, 6);
                ctx.fillStyle = flash ? '#FFFF00' : '#888888';
                ctx.fillRect(Math.round(p.x) + 1, Math.round(p.y) + 1, 4, 4);
                // Fuse spark
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(Math.round(p.x) + 3, Math.round(p.y) - 1, 1, 1);
                continue;
            }
            switch (p.type) {
                case 'parcel': key = 'proj_parcel'; break;
                case 'cannon': key = 'proj_cannon'; break;
                case 'letter': key = 'proj_letter'; break;
                case 'stamp': key = 'proj_stamp_' + (p.animFrame % 4); break;
                default: key = 'proj_parcel';
            }
            PR.SpriteCache.draw(ctx, key, Math.round(p.x), Math.round(p.y), p.vx < 0);
        }

        // Enemy projectiles
        for (var j = 0; j < this.enemy.length; j++) {
            var ep = this.enemy[j];
            PR.SpriteCache.draw(ctx, 'proj_card', Math.round(ep.x), Math.round(ep.y), ep.vx < 0);
        }
    }
};
