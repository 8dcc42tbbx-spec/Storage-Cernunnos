// Postie Run - HUD (Heads Up Display)
PR.HUD = {
    displayScore: 0,

    init: function() {
        this.displayScore = 0;
    },

    update: function() {
        // Smooth score counter
        if (this.displayScore < PR.Player.score) {
            this.displayScore += Math.ceil((PR.Player.score - this.displayScore) / 10);
            if (this.displayScore > PR.Player.score) this.displayScore = PR.Player.score;
        }
    },

    render: function(ctx) {
        // SCORE - top center
        var scoreStr = '' + this.displayScore;
        while (scoreStr.length < 8) scoreStr = '0' + scoreStr;
        PR.Utils.drawTextShadow(ctx, 'SCORE', 130, 4, '#FFFFFF', '#000000', 1);
        PR.Utils.drawTextShadow(ctx, scoreStr, 122, 12, '#FFD700', '#000000', 1);

        // LIVES - top left
        PR.Utils.drawTextShadow(ctx, 'ERNIE', 4, 4, '#FFFFFF', '#000000', 1);
        for (var i = 0; i < PR.Player.lives; i++) {
            // Small postie hat icon
            ctx.fillStyle = '#CC2200';
            ctx.fillRect(4 + i * 10, 13, 8, 4);
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(4 + i * 10, 13, 8, 1);
        }

        // HEALTH BAR - below lives
        var hp = PR.Player.health;
        var maxHp = PR.Player.maxHealth;
        ctx.fillStyle = '#000000';
        ctx.fillRect(4, 19, 42, 4);
        var hpColor = hp > 2 ? '#22CC22' : hp > 1 ? '#CCCC22' : '#CC2222';
        ctx.fillStyle = hpColor;
        ctx.fillRect(5, 20, Math.floor(40 * (hp / maxHp)), 2);

        // WEAPON - top right
        var weaponNames = PR.CONST.WEAPON_NAMES;
        var weapon = PR.Player.weapon;
        var ammoStr = PR.Player.ammo < 0 ? 'INF' : '' + PR.Player.ammo;
        PR.Utils.drawTextShadow(ctx, weaponNames[weapon], 256, 4, '#FFFFFF', '#000000', 1);
        PR.Utils.drawTextShadow(ctx, ammoStr, 270, 12, '#FFD700', '#000000', 1);

        // Weapon icon
        var iconKey;
        switch (weapon) {
            case 0: iconKey = 'proj_parcel'; break;
            case 1: iconKey = 'pickup_cannon'; break;
            case 2: iconKey = 'pickup_spray'; break;
            case 3: iconKey = 'pickup_stamp'; break;
        }
        if (iconKey) PR.SpriteCache.draw(ctx, iconKey, 300, 4, false);

        // VEHICLE TIMER
        if (PR.Player.inVehicle) {
            var pct = PR.Player.vehicleTimer / PR.CONST.EDV_DURATION;
            ctx.fillStyle = '#000000';
            ctx.fillRect(100, 230, 120, 6);
            ctx.fillStyle = pct > 0.3 ? '#22AAFF' : '#FF4444';
            ctx.fillRect(101, 231, Math.floor(118 * pct), 4);
            PR.Utils.drawText(ctx, 'EDV', 80, 230, '#22AAFF', 1);

            // Vehicle health
            var vhp = PR.Player.vehicleHealth / PR.CONST.EDV_HP;
            ctx.fillStyle = '#000000';
            ctx.fillRect(4, 26, 42, 4);
            ctx.fillStyle = '#22AAFF';
            ctx.fillRect(5, 27, Math.floor(40 * vhp), 2);
        }

        // DELIVERY TARGET - bottom of screen
        if (PR.Level.data) {
            var addr = PR.Level.data.deliveryAddress || '';
            var typeIcon = PR.Level.data.deliveryType === 'locker' ? 'LOCKER' : 'HOUSE';
            PR.Utils.drawTextShadow(ctx, 'DELIVER: ' + typeIcon, 4, 230, '#FFFFFF', '#000000', 1);

            // Distance indicator
            var levelW = PR.Level.data.width;
            var progress = PR.Player.x / levelW;
            ctx.fillStyle = '#000000';
            ctx.fillRect(4, 237, 80, 3);
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(5, 238, Math.floor(78 * progress), 1);
            // Player dot
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(5 + Math.floor(78 * progress), 237, 2, 3);
        }

        // COMBO display
        if (PR.Player.combo > 1 && PR.Player.comboTimer > 0) {
            var comboAlpha = PR.Player.comboTimer / 120;
            ctx.globalAlpha = comboAlpha;
            var comboText = 'x' + Math.min(PR.Player.combo, 5) + ' COMBO!';
            PR.Utils.drawTextShadow(ctx, comboText, 130, 28, '#FF6600', '#000000', 1);
            ctx.globalAlpha = 1;
        }

        // LEVEL indicator
        if (PR.Level.data) {
            var lvlNum = PR.Level.current + 1;
            PR.Utils.drawText(ctx, 'LV' + lvlNum, 296, 230, '#888888', 1);
        }
    }
};
