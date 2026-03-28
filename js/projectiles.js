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
            w: type === 'stamp' ? 8 : type === 'parcel' ? 7 : type === 'cannon' ? 5 : 4,
            h: type === 'stamp' ? 8 : type === 'parcel' ? 5 : type === 'cannon' ? 4 : 2,
            isStamp: type === 'stamp',
            pierce: type === 'stamp' ? 2 : 0 // stamp can pierce through 2 enemies
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

            // Gravity for parcels
            if (p.type === 'parcel') {
                p.vy += 0.04;
            }

            // Stamp spins
            p.animTimer++;
            if (p.animTimer >= 3) {
                p.animTimer = 0;
                p.animFrame++;
            }

            // Remove if offscreen
            if (p.x < PR.Camera.x - 20 || p.x > PR.Camera.x + PR.CONST.CANVAS_W + 20 ||
                p.y < -20 || p.y > PR.CONST.CANVAS_H + 20) {
                p.alive = false;
            }

            // Tile collision
            if (PR.Level && PR.Level.tilemap) {
                var tx = Math.floor((p.x + p.w / 2) / PR.CONST.TILE_SIZE);
                var ty = Math.floor((p.y + p.h / 2) / PR.CONST.TILE_SIZE);
                if (PR.Level.tilemap.isSolid(tx, ty)) {
                    p.alive = false;
                    PR.Particles.emit(p.x, p.y, 'spark');
                }
            }

            // Enemy collision
            for (var j = 0; j < PR.Enemies.list.length; j++) {
                var e = PR.Enemies.list[j];
                if (!e.alive) continue;
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
            if (ep.x < PR.Camera.x - 20 || ep.x > PR.Camera.x + PR.CONST.CANVAS_W + 20 ||
                ep.y > PR.CONST.CANVAS_H + 20) {
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
