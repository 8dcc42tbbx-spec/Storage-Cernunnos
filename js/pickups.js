// Postie Run - Pickup System
PR.Pickups = {
    list: [],

    init: function() {
        this.list = [];
    },

    spawn: function(x, y, type) {
        this.list.push({
            x: x, y: y, w: 12, h: 10,
            type: type, alive: true,
            timer: 600, // 10 seconds to pick up
            bobTimer: Math.random() * Math.PI * 2,
            baseY: y
        });
    },

    spawnRandom: function(x, y) {
        var types = ['health', 'cannon', 'spray', 'stamp', 'edv'];
        var weights = [30, 25, 20, 15, 10]; // health most common, eDV rarest
        var total = 0;
        for (var i = 0; i < weights.length; i++) total += weights[i];
        var roll = Math.random() * total;
        var sum = 0;
        for (var j = 0; j < weights.length; j++) {
            sum += weights[j];
            if (roll < sum) {
                this.spawn(x, y, types[j]);
                return;
            }
        }
        this.spawn(x, y, 'health');
    },

    update: function() {
        for (var i = this.list.length - 1; i >= 0; i--) {
            var p = this.list[i];
            p.timer--;
            p.bobTimer += 0.08;
            p.y = p.baseY + Math.sin(p.bobTimer) * 3;

            // Flashing when about to expire
            if (p.timer <= 0) {
                p.alive = false;
            }

            // Player collision
            if (PR.Utils.aabb(
                { x: p.x - 2, y: p.y - 2, w: p.w + 4, h: p.h + 4 },
                PR.Player.getBounds()
            )) {
                this._collect(p);
                p.alive = false;
            }

            // Offscreen removal
            if (p.x < PR.Camera.x - 40) {
                p.alive = false;
            }

            if (!p.alive) {
                this.list.splice(i, 1);
            }
        }
    },

    _collect: function(pickup) {
        switch (pickup.type) {
            case 'health':
                PR.Player.health = Math.min(PR.Player.health + 2, PR.Player.maxHealth);
                PR.Audio.play('pickup');
                break;
            case 'cannon':
                PR.Player.weapon = PR.CONST.WEAPON_CANNON;
                PR.Player.ammo = PR.CONST.AMMO_CANNON;
                PR.Audio.play('pickup_weapon');
                break;
            case 'spray':
                PR.Player.weapon = PR.CONST.WEAPON_SPRAY;
                PR.Player.ammo = PR.CONST.AMMO_SPRAY;
                PR.Audio.play('pickup_weapon');
                break;
            case 'stamp':
                PR.Player.weapon = PR.CONST.WEAPON_STAMP;
                PR.Player.ammo = PR.CONST.AMMO_STAMP;
                PR.Audio.play('pickup_weapon');
                break;
            case 'edv':
                PR.Player.enterVehicle();
                break;
        }
        PR.Particles.emit(pickup.x + 6, pickup.y + 5, 'spark');
    },

    render: function(ctx) {
        for (var i = 0; i < this.list.length; i++) {
            var p = this.list[i];

            // Flash when expiring
            if (p.timer < 120 && Math.floor(p.timer / 4) % 2 === 0) continue;

            var key;
            switch (p.type) {
                case 'cannon': key = 'pickup_cannon'; break;
                case 'spray': key = 'pickup_spray'; break;
                case 'stamp': key = 'pickup_stamp'; break;
                case 'health': key = 'pickup_health'; break;
                case 'edv': key = 'pickup_edv'; break;
                default: key = 'pickup_health';
            }

            // Glow effect
            ctx.globalAlpha = 0.3 + Math.sin(p.bobTimer * 2) * 0.15;
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(p.x - 2, Math.round(p.y) - 2, p.w + 4, p.h + 4);
            ctx.globalAlpha = 1;

            PR.SpriteCache.draw(ctx, key, p.x, Math.round(p.y), false);
        }
    }
};
