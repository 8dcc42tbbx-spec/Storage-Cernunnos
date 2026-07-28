// Postie Run - HUD (Enhanced Arcade Style)
PR.HUD = {
    displayScore: 0,
    lastHealth: 5,
    healthFlash: 0,
    weaponFlash: 0,
    weaponName: '',
    comboShake: 0,
    bossFlash: 0,

    init: function() {
        this.displayScore = 0;
        this.lastHealth = PR.Player.maxHealth;
        this.healthFlash = 0;
        this.weaponFlash = 0;
        this.comboShake = 0;
        this.bossFlash = 0;
    },

    update: function() {
        // Smooth score counter
        if (this.displayScore < PR.Player.score) {
            var diff = PR.Player.score - this.displayScore;
            this.displayScore += Math.ceil(diff / 8);
            if (this.displayScore > PR.Player.score) this.displayScore = PR.Player.score;
        }

        // Health flash when damaged
        if (PR.Player.health < this.lastHealth) {
            this.healthFlash = 20;
        }
        this.lastHealth = PR.Player.health;
        if (this.healthFlash > 0) this.healthFlash--;

        // Weapon flash
        if (this.weaponFlash > 0) this.weaponFlash--;

        // Combo shake
        if (PR.Player.combo > 2 && PR.Player.comboTimer > 0) {
            this.comboShake = Math.min(PR.Player.combo, 5);
        } else {
            this.comboShake = 0;
        }

        if (this.bossFlash > 0) this.bossFlash--;
    },

    render: function(ctx) {
        var f = PR.Game.frameCount;

        // === SCORE - top center ===
        var scoreStr = '' + this.displayScore;
        while (scoreStr.length < 8) scoreStr = '0' + scoreStr;
        // Pulse on increase
        var scoreColor = (this.displayScore < PR.Player.score) ? '#FFFFFF' : '#FFD700';
        PR.Utils.drawTextShadow(ctx, 'SCORE', 130, 3, '#CCCCCC', '#000000', 1);
        PR.Utils.drawTextShadow(ctx, scoreStr, 118, 11, scoreColor, '#000000', 1);

        // === LIVES - top left ===
        PR.Utils.drawTextShadow(ctx, 'ERNIE', 4, 3, '#FFFFFF', '#000000', 1);
        for (var i = 0; i < PR.Player.lives; i++) {
            var hatY = 12;
            ctx.fillStyle = '#CC2200';
            ctx.fillRect(4 + i * 10, hatY, 8, 4);
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(4 + i * 10, hatY, 8, 1);
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(6 + i * 10, hatY + 1, 2, 1);
        }

        // === HEALTH BAR - with gradient and pulse ===
        var hp = PR.Player.health;
        var maxHp = PR.Player.maxHealth;
        var barX = 4, barY = 18, barW = 42, barH = 5;

        // Background
        ctx.fillStyle = '#1A0A0A';
        ctx.fillRect(barX, barY, barW, barH);

        // HP gradient
        var hpPct = hp / maxHp;
        var hpW = Math.floor((barW - 2) * hpPct);
        if (hpPct > 0.5) ctx.fillStyle = '#22CC22';
        else if (hpPct > 0.25) ctx.fillStyle = '#CCCC22';
        else ctx.fillStyle = '#CC2222';

        // Pulse when low
        if (hpPct <= 0.25 && f % 20 < 10) {
            ctx.fillStyle = '#FF4444';
        }
        // Flash white when damaged
        if (this.healthFlash > 15) ctx.fillStyle = '#FFFFFF';

        ctx.fillRect(barX + 1, barY + 1, hpW, barH - 2);

        // Tick marks
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        for (var t = 1; t < maxHp; t++) {
            var tickX = barX + 1 + Math.floor((barW - 2) * t / maxHp);
            ctx.fillRect(tickX, barY + 1, 1, barH - 2);
        }

        // Border
        ctx.strokeStyle = '#666666';
        ctx.strokeRect(barX + 0.5, barY + 0.5, barW - 1, barH - 1);

        // === WEAPON - top right ===
        var weaponNames = PR.CONST.WEAPON_NAMES;
        var weapon = PR.Player.weapon;
        var ammoStr = PR.Player.ammo < 0 ? 'INF' : '' + PR.Player.ammo;
        var wColor = '#FFFFFF';
        // Flash when low ammo
        if (PR.Player.ammo > 0 && PR.Player.ammo <= 5 && f % 10 < 5) {
            wColor = '#FF4444';
        }
        PR.Utils.drawTextShadow(ctx, weaponNames[weapon], 254, 3, wColor, '#000000', 1);
        PR.Utils.drawTextShadow(ctx, ammoStr, 270, 11, '#FFD700', '#000000', 1);

        // Weapon icon
        var iconKey;
        switch (weapon) {
            case 0: iconKey = 'proj_parcel'; break;
            case 1: iconKey = 'pickup_cannon'; break;
            case 2: iconKey = 'pickup_spray'; break;
            case 3: iconKey = 'pickup_stamp'; break;
        }
        if (iconKey) PR.SpriteCache.draw(ctx, iconKey, 300, 3, false);

        // === GRENADE COUNT ===
        if (PR.Player.grenades > 0) {
            for (var g = 0; g < PR.Player.grenades; g++) {
                ctx.fillStyle = '#444444';
                ctx.fillRect(298 - g * 8, 14, 5, 5);
                ctx.fillStyle = '#888888';
                ctx.fillRect(299 - g * 8, 15, 3, 3);
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(300 - g * 8, 13, 1, 2);
            }
        }

        // === VEHICLE TIMER ===
        if (PR.Player.inVehicle) {
            var vPct = PR.Player.vehicleTimer / PR.CONST.EDV_DURATION;
            ctx.fillStyle = '#000000';
            ctx.fillRect(100, 229, 120, 7);
            var vColor = vPct > 0.3 ? '#22AAFF' : (f % 10 < 5 ? '#FF4444' : '#FF8888');
            ctx.fillStyle = vColor;
            ctx.fillRect(101, 230, Math.floor(118 * vPct), 5);
            PR.Utils.drawText(ctx, 'EDV', 80, 230, '#22AAFF', 1);

            // Boost cooldown
            if (PR.Player.edvBoostTimer > 0) {
                var bPct = PR.Player.edvBoostTimer / 180;
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.fillRect(101, 230, Math.floor(118 * bPct), 2);
            }
        }

        // === COMBO DISPLAY ===
        if (PR.Player.combo > 1 && PR.Player.comboTimer > 0) {
            var comboAlpha = Math.min(1, PR.Player.comboTimer / 60);
            ctx.globalAlpha = comboAlpha;

            var combo = Math.min(PR.Player.combo, 5);
            var comboColors = ['#FFFFFF', '#FFD700', '#FF8800', '#FF4400', '#FF00FF'];
            var cColor = comboColors[Math.min(combo - 1, 4)];
            var cScale = combo >= 5 ? 2 : 1;

            var sx = this.comboShake > 0 ? PR.Utils.randInt(-1, 1) : 0;
            var sy = this.comboShake > 0 ? PR.Utils.randInt(-1, 1) : 0;

            var comboText = 'x' + combo + ' COMBO!';
            PR.Utils.drawTextShadow(ctx, comboText, 130 + sx, 26 + sy, cColor, '#000000', cScale);
            ctx.globalAlpha = 1;
        }

        // === KILL COUNTER ===
        if (PR.Player.killCount > 0) {
            PR.Utils.drawText(ctx, 'KO:' + PR.Player.killCount, 254, 20, '#888888', 1);
        }

        // === DELIVERY PROGRESS ===
        if (PR.Level.data) {
            var addr = PR.Level.data.deliveryAddress || '';
            var typeStr = PR.Level.data.deliveryType === 'locker' ? 'LOCKER' : 'HOUSE';
            PR.Utils.drawTextShadow(ctx, 'DELIVER: ' + typeStr, 4, 229, '#FFFFFF', '#000000', 1);

            // Progress bar
            var levelW = PR.Level.data.width;
            var progress = PR.Player.x / levelW;
            ctx.fillStyle = '#1A1A1A';
            ctx.fillRect(4, 236, 80, 4);
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(5, 237, Math.floor(78 * progress), 2);
            // Player dot (pulsing)
            var dotAlpha = 0.5 + Math.sin(f * 0.1) * 0.5;
            ctx.globalAlpha = dotAlpha;
            ctx.fillStyle = '#FF0000';
            var dotX = 5 + Math.floor(78 * progress);
            ctx.fillRect(dotX, 236, 3, 4);
            ctx.globalAlpha = 1;
            // Delivery icon at end
            ctx.fillStyle = '#22CC22';
            ctx.fillRect(82, 237, 2, 2);
        }

        // === LEVEL NUMBER ===
        if (PR.Level.data) {
            var lvlNum = PR.Level.current + 1;
            PR.Utils.drawText(ctx, 'LV' + lvlNum, 296, 229, '#666666', 1);
        }
    }
};
