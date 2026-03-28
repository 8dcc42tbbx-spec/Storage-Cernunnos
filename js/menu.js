// Postie Run - Menu Screens
PR.Menu = {
    timer: 0,
    selection: 0,
    levelIntroTimer: 0,
    levelCompleteTimer: 0,
    gameOverTimer: 0,

    init: function() {
        this.timer = 0;
        this.selection = 0;
    },

    // ============================================================
    // TITLE SCREEN
    // ============================================================
    updateTitle: function() {
        this.timer++;
        if (PR.Input.justPressed('start') || PR.Input.justPressed('jump')) {
            return 'start';
        }
        return null;
    },

    renderTitle: function(ctx) {
        // Background
        var grad = ctx.createLinearGradient(0, 0, 0, 240);
        grad.addColorStop(0, '#1A0A2E');
        grad.addColorStop(0.5, '#2A1A4E');
        grad.addColorStop(1, '#0A0A1E');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 320, 240);

        // Stars
        for (var i = 0; i < 30; i++) {
            var sx = (i * 37 + this.timer * 0.2) % 320;
            var sy = (i * 23 + i * i) % 150;
            ctx.fillStyle = '#FFFFFF';
            ctx.globalAlpha = 0.3 + Math.sin(this.timer * 0.05 + i) * 0.3;
            ctx.fillRect(sx, sy, 1, 1);
        }
        ctx.globalAlpha = 1;

        // Title: "POSTIE RUN"
        var titleY = 40 + Math.sin(this.timer * 0.03) * 4;

        // Shadow
        PR.Utils.drawTextCentered(ctx, 'POSTIE RUN', titleY + 2, '#000000', 3);
        // Main text with color cycling
        var titleColors = ['#CC2200', '#FF4400', '#FFD700', '#FF4400'];
        var colorIdx = Math.floor(this.timer / 10) % titleColors.length;
        PR.Utils.drawTextCentered(ctx, 'POSTIE RUN', titleY, titleColors[colorIdx], 3);

        // Subtitle
        PR.Utils.drawTextCentered(ctx, 'DELIVER OR DIE TRYING', 85, '#FFFFFF', 1);

        // Animated Ernie running
        var ernieFrame = Math.floor(this.timer / 6) % 4;
        var ernieX = (this.timer * 1.5) % 360 - 20;
        PR.SpriteCache.draw(ctx, 'player_run_' + ernieFrame, ernieX, 130, false);

        // Ground line
        ctx.fillStyle = '#4A7A2E';
        ctx.fillRect(0, 152, 320, 4);
        ctx.fillStyle = '#3A6A1E';
        ctx.fillRect(0, 156, 320, 84);

        // Menu options
        var flash = Math.floor(this.timer / 15) % 2;
        if (flash) {
            PR.Utils.drawTextCentered(ctx, 'PRESS ENTER OR START', 175, '#FFD700', 1);
        }

        // Controls
        PR.Utils.drawTextCentered(ctx, 'ARROWS: MOVE  X: JUMP  Z: SHOOT', 200, '#888888', 1);
        PR.Utils.drawTextCentered(ctx, 'C: SPECIAL  ESC: PAUSE', 210, '#888888', 1);

        // Credits
        PR.Utils.drawTextCentered(ctx, '2026 AUSTRALIA POST PARCEL DIVISION', 228, '#444444', 1);
    },

    // ============================================================
    // LEVEL INTRO
    // ============================================================
    updateLevelIntro: function() {
        this.levelIntroTimer++;
        if (this.levelIntroTimer > 180 || PR.Input.justPressed('start') || PR.Input.justPressed('jump')) {
            return 'play';
        }
        return null;
    },

    renderLevelIntro: function(ctx) {
        // Dark overlay
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(0, 0, 320, 240);

        var lvl = PR.Level.current + 1;
        var data = PR.Level.data;

        // Level number
        PR.Utils.drawTextCentered(ctx, 'LEVEL ' + lvl, 60, '#FFD700', 2);

        // Level name
        PR.Utils.drawTextCentered(ctx, data.name.toUpperCase(), 90, '#FFFFFF', 2);

        // Delivery info
        var delivType = data.deliveryType === 'locker' ? 'PARCEL LOCKER' : 'HOUSE';
        PR.Utils.drawTextCentered(ctx, 'DELIVER TO: ' + delivType, 130, '#CCCCCC', 1);
        PR.Utils.drawTextCentered(ctx, data.deliveryAddress || '', 142, '#FFD700', 1);

        // Theme name
        var themeNames = ['SUBURBAN', 'URBAN', 'REGIONAL', 'COASTAL', 'OUTBACK'];
        PR.Utils.drawTextCentered(ctx, 'ZONE: ' + themeNames[data.theme], 165, '#888888', 1);

        // Delivery target icon
        var iconKey = data.deliveryType === 'locker' ? 'delivery_locker' : 'delivery_house';
        PR.SpriteCache.draw(ctx, iconKey, 144, 180, false);

        // "Ready?" flash
        if (this.levelIntroTimer > 60) {
            var flash = Math.floor(this.levelIntroTimer / 10) % 2;
            if (flash) {
                PR.Utils.drawTextCentered(ctx, 'GET READY!', 220, '#FF6600', 1);
            }
        }
    },

    // ============================================================
    // LEVEL COMPLETE
    // ============================================================
    updateLevelComplete: function() {
        this.levelCompleteTimer++;
        if (this.levelCompleteTimer > 240 ||
            (this.levelCompleteTimer > 60 && (PR.Input.justPressed('start') || PR.Input.justPressed('jump')))) {
            return 'next';
        }
        return null;
    },

    renderLevelComplete: function(ctx) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, 320, 240);

        PR.Utils.drawTextCentered(ctx, 'DELIVERED!', 40, '#FFD700', 3);

        var lvl = PR.Level.current + 1;
        PR.Utils.drawTextCentered(ctx, 'LEVEL ' + lvl + ' COMPLETE', 80, '#FFFFFF', 1);

        // Score tally
        var y = 110;
        PR.Utils.drawText(ctx, 'SCORE:', 80, y, '#CCCCCC', 1);
        PR.Utils.drawText(ctx, '' + PR.Player.score, 180, y, '#FFD700', 1);

        y += 15;
        var timeBonus = Math.max(0, 5000 - PR.Level.levelTimer * 2);
        PR.Utils.drawText(ctx, 'TIME BONUS:', 80, y, '#CCCCCC', 1);
        if (this.levelCompleteTimer > 30) {
            PR.Utils.drawText(ctx, '' + timeBonus, 180, y, '#FFD700', 1);
        }

        y += 15;
        PR.Utils.drawText(ctx, 'TOTAL:', 80, y, '#FFFFFF', 1);
        if (this.levelCompleteTimer > 60) {
            PR.Utils.drawText(ctx, '' + (PR.Player.score + timeBonus), 180, y, '#FFD700', 1);
        }

        // Rating stars
        if (this.levelCompleteTimer > 90) {
            var stars = timeBonus > 3000 ? 3 : timeBonus > 1000 ? 2 : 1;
            var starStr = '';
            for (var i = 0; i < stars; i++) starStr += '# ';
            PR.Utils.drawTextCentered(ctx, starStr, 170, '#FFD700', 2);
        }

        // Continue prompt
        if (this.levelCompleteTimer > 120) {
            var flash = Math.floor(this.levelCompleteTimer / 15) % 2;
            if (flash) {
                var msg = lvl < 20 ? 'PRESS START FOR NEXT LEVEL' : 'CONGRATULATIONS!';
                PR.Utils.drawTextCentered(ctx, msg, 210, '#FFFFFF', 1);
            }
        }
    },

    // ============================================================
    // GAME OVER
    // ============================================================
    updateGameOver: function() {
        this.gameOverTimer++;
        if (this.gameOverTimer > 120 && (PR.Input.justPressed('start') || PR.Input.justPressed('jump'))) {
            if (PR.Player.continues > 0) {
                return 'continue';
            }
            return 'title';
        }
        return null;
    },

    renderGameOver: function(ctx) {
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(0, 0, 320, 240);

        // "RETURN TO DEPOT" in big letters
        var y = 50 + Math.sin(this.gameOverTimer * 0.05) * 3;
        PR.Utils.drawTextCentered(ctx, 'RETURN TO', y, '#CC2200', 2);
        PR.Utils.drawTextCentered(ctx, 'DEPOT', y + 20, '#CC2200', 3);

        // Score
        PR.Utils.drawTextCentered(ctx, 'FINAL SCORE: ' + PR.Player.score, 120, '#FFD700', 1);

        // Continue option
        if (PR.Player.continues > 0) {
            PR.Utils.drawTextCentered(ctx, 'CONTINUES: ' + PR.Player.continues, 150, '#FFFFFF', 1);

            if (this.gameOverTimer > 60) {
                var countdown = Math.max(0, 10 - Math.floor((this.gameOverTimer - 60) / 60));
                PR.Utils.drawTextCentered(ctx, 'CONTINUE? ' + countdown, 175, '#FFD700', 2);

                if (countdown <= 0) {
                    return; // Time's up
                }
            }
        } else {
            PR.Utils.drawTextCentered(ctx, 'NO CONTINUES LEFT', 150, '#CC0000', 1);
        }

        if (this.gameOverTimer > 120) {
            var flash = Math.floor(this.gameOverTimer / 15) % 2;
            if (flash) {
                PR.Utils.drawTextCentered(ctx, 'PRESS START', 210, '#FFFFFF', 1);
            }
        }
    },

    // ============================================================
    // PAUSE
    // ============================================================
    renderPause: function(ctx) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, 320, 240);

        PR.Utils.drawTextCentered(ctx, 'PAUSED', 80, '#FFFFFF', 3);
        PR.Utils.drawTextCentered(ctx, 'PRESS ESC TO RESUME', 140, '#CCCCCC', 1);
        PR.Utils.drawTextCentered(ctx, 'SCORE: ' + PR.Player.score, 170, '#FFD700', 1);
    },

    // ============================================================
    // WIN SCREEN
    // ============================================================
    renderWin: function(ctx) {
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(0, 0, 320, 240);

        var t = this.levelCompleteTimer;
        PR.Utils.drawTextCentered(ctx, 'CONGRATULATIONS!', 30, '#FFD700', 2);
        PR.Utils.drawTextCentered(ctx, 'ALL PARCELS DELIVERED!', 60, '#FFFFFF', 1);

        if (t > 30) PR.Utils.drawTextCentered(ctx, 'ERNIE HAS SAVED', 90, '#CCCCCC', 1);
        if (t > 45) PR.Utils.drawTextCentered(ctx, 'AUSTRALIA POST!', 102, '#CC2200', 1);

        if (t > 80) {
            PR.Utils.drawTextCentered(ctx, 'FINAL SCORE', 130, '#FFFFFF', 1);
            PR.Utils.drawTextCentered(ctx, '' + PR.Player.score, 145, '#FFD700', 2);
        }

        if (t > 120) {
            PR.Utils.drawTextCentered(ctx, 'THANKS FOR PLAYING!', 185, '#FFFFFF', 1);
        }

        // Animated confetti
        if (t > 20) {
            for (var i = 0; i < 20; i++) {
                var cx = (i * 23 + t * 0.8) % 340 - 10;
                var cy = (i * 17 + t * 1.2 + Math.sin(i + t * 0.05) * 20) % 260 - 10;
                var colors = ['#FFD700', '#CC2200', '#FFFFFF', '#22CC22', '#4488FF'];
                ctx.fillStyle = colors[i % colors.length];
                ctx.globalAlpha = 0.7;
                ctx.fillRect(cx, cy, 2, 2);
            }
            ctx.globalAlpha = 1;
        }

        if (t > 180) {
            var flash = Math.floor(t / 15) % 2;
            if (flash) PR.Utils.drawTextCentered(ctx, 'PRESS START', 220, '#FFFFFF', 1);
        }
    }
};
