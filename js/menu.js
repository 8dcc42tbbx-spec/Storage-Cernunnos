// Postie Run - Menu Screens (Enhanced with visual flair)
PR.Menu = {
    timer: 0,
    selection: 0,
    levelIntroTimer: 0,
    levelCompleteTimer: 0,
    gameOverTimer: 0,
    titleStars: [],
    countdownNum: 0,

    init: function() {
        this.timer = 0;
        this.selection = 0;
        // Generate stars for title
        this.titleStars = [];
        for (var i = 0; i < 40; i++) {
            this.titleStars.push({
                x: Math.random() * 320, y: Math.random() * 160,
                speed: 0.1 + Math.random() * 0.3,
                brightness: Math.random(), phase: Math.random() * Math.PI * 2
            });
        }
    },

    // ============================================================
    // TITLE SCREEN - Animated with parallax
    // ============================================================
    updateTitle: function() {
        this.timer++;
        if (PR.Input.justPressed('start') || PR.Input.justPressed('jump')) {
            return 'start';
        }
        return null;
    },

    renderTitle: function(ctx) {
        var t = this.timer;

        // Night sky gradient
        var grad = ctx.createLinearGradient(0, 0, 0, 240);
        grad.addColorStop(0, '#0A0620');
        grad.addColorStop(0.4, '#1A1040');
        grad.addColorStop(0.7, '#2A1848');
        grad.addColorStop(1, '#0A0A1E');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 320, 240);

        // Twinkling stars
        for (var s = 0; s < this.titleStars.length; s++) {
            var star = this.titleStars[s];
            var twinkle = 0.3 + Math.sin(t * 0.05 + star.phase) * 0.4 + star.brightness * 0.3;
            ctx.globalAlpha = Math.max(0, Math.min(1, twinkle));
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(star.x, star.y, 1, 1);
        }
        ctx.globalAlpha = 1;

        // Scrolling suburb silhouettes (far)
        ctx.fillStyle = '#0D0820';
        var farX = -(t * 0.3) % 160;
        for (var h = 0; h < 5; h++) {
            var bx = farX + h * 80;
            var bh = 20 + (h * 13) % 25;
            ctx.fillRect(bx, 155 - bh, 35, bh);
            // Roof
            ctx.beginPath();
            ctx.moveTo(bx, 155 - bh);
            ctx.lineTo(bx + 17, 145 - bh);
            ctx.lineTo(bx + 35, 155 - bh);
            ctx.fill();
        }

        // Scrolling suburb silhouettes (near)
        ctx.fillStyle = '#150C30';
        var nearX = -(t * 0.6) % 120;
        for (var n = 0; n < 6; n++) {
            var nx = nearX + n * 65;
            var nh = 15 + (n * 17) % 20;
            ctx.fillRect(nx, 155 - nh, 28, nh);
            // Windows
            if (n % 2 === 0) {
                ctx.fillStyle = '#FFD70033';
                ctx.fillRect(nx + 5, 155 - nh + 4, 3, 3);
                ctx.fillRect(nx + 15, 155 - nh + 4, 3, 3);
                ctx.fillStyle = '#150C30';
            }
        }

        // Ground
        ctx.fillStyle = '#1A3A10';
        ctx.fillRect(0, 155, 320, 5);
        ctx.fillStyle = '#142E0A';
        ctx.fillRect(0, 160, 320, 80);

        // Title: Try Gemini logo first, fall back to bouncing text
        var titleY = 25 + Math.sin(t * 0.04) * 3;
        if (!PR.ImageSprites.draw(ctx, 'title_logo', 80, titleY, false)) {
            var titleText = 'POSTIE RUN';
            var titleX = 60;
            for (var c = 0; c < titleText.length; c++) {
                var letterY = titleY + 10 + Math.sin(t * 0.06 + c * 0.5) * 3;
                var colors = ['#CC2200', '#FF4400', '#FF6600', '#FFD700', '#FFEE44'];
                var lColor = colors[(c + Math.floor(t / 8)) % colors.length];
                PR.Utils.drawText(ctx, titleText[c], titleX + c * 20 + 1, letterY + 2, '#000000', 3);
                PR.Utils.drawText(ctx, titleText[c], titleX + c * 20, letterY, lColor, 3);
            }
        }

        // Subtitle with typewriter effect
        var subtitle = 'DELIVER OR DIE TRYING';
        var showChars = Math.min(subtitle.length, Math.floor(t / 2));
        if (t > 30) {
            PR.Utils.drawTextCentered(ctx, subtitle.substring(0, showChars), 75, '#CCCCCC', 1);
        }

        // Animated Ernie running across
        var ernieFrame = Math.floor(t / 5) % 4;
        var ernieX = (t * 2) % 380 - 30;
        PR.SpriteCache.draw(ctx, 'player_run_' + ernieFrame, ernieX, 132, false);

        // Enemy silhouettes chasing
        if (t > 60) {
            var dogFrame = Math.floor(t / 6) % 2;
            PR.SpriteCache.draw(ctx, 'dog_' + dogFrame, ernieX - 50, 143, false);
            if (t > 90) {
                PR.SpriteCache.draw(ctx, 'dog_' + ((dogFrame + 1) % 2), ernieX - 80, 143, false);
            }
        }

        // "Press START" with glow pulse
        if (t > 60) {
            var pulseAlpha = 0.5 + Math.sin(t * 0.08) * 0.5;
            ctx.globalAlpha = pulseAlpha;
            PR.Utils.drawTextCentered(ctx, 'PRESS ENTER TO START', 175, '#FFD700', 1);
            ctx.globalAlpha = 1;
        }

        // Controls
        PR.Utils.drawTextCentered(ctx, 'ARROWS: MOVE  X: JUMP  Z: SHOOT', 198, '#666688', 1);
        PR.Utils.drawTextCentered(ctx, 'C: GRENADE  DOWN+X: ROLL', 208, '#666688', 1);

        // Credits
        PR.Utils.drawTextCentered(ctx, '2026 AUSTRALIA POST PARCEL DIVISION', 228, '#333344', 1);
    },

    // ============================================================
    // LEVEL INTRO - Countdown with style
    // ============================================================
    updateLevelIntro: function() {
        this.levelIntroTimer++;
        if (this.levelIntroTimer > 210 ||
            (this.levelIntroTimer > 150 && (PR.Input.justPressed('start') || PR.Input.justPressed('jump')))) {
            return 'play';
        }
        return null;
    },

    renderLevelIntro: function(ctx) {
        var t = this.levelIntroTimer;

        // Dark overlay
        ctx.fillStyle = 'rgba(0,0,0,0.88)';
        ctx.fillRect(0, 0, 320, 240);

        var lvl = PR.Level.current + 1;
        var data = PR.Level.data;

        // Level number slides in from left
        var slideX = t < 20 ? -100 + t * 8 : 60;
        if (slideX > 60) slideX = 60;
        PR.Utils.drawText(ctx, 'LEVEL ' + lvl, Math.floor(slideX), 50, '#FFD700', 2);

        // Level name types out
        if (t > 15) {
            var name = data.name.toUpperCase();
            var showN = Math.min(name.length, Math.floor((t - 15) / 2));
            PR.Utils.drawTextCentered(ctx, name.substring(0, showN), 80, '#FFFFFF', 2);
        }

        // Theme zone
        if (t > 40) {
            var themeNames = ['SUBURBAN', 'URBAN', 'REGIONAL', 'COASTAL', 'OUTBACK'];
            var themeColors = ['#4A7A2E', '#7AACCF', '#6B8A3E', '#60C0E8', '#E8A840'];
            PR.Utils.drawTextCentered(ctx, 'ZONE: ' + themeNames[data.theme], 115, themeColors[data.theme], 1);
        }

        // Delivery info
        if (t > 60) {
            var delivType = data.deliveryType === 'locker' ? 'PARCEL LOCKER' : 'HOUSE';
            PR.Utils.drawTextCentered(ctx, 'DELIVER TO: ' + delivType, 140, '#CCCCCC', 1);
        }
        if (t > 75) {
            PR.Utils.drawTextCentered(ctx, data.deliveryAddress || '', 152, '#FFD700', 1);
        }

        // Delivery target icon
        if (t > 80) {
            var iconKey = data.deliveryType === 'locker' ? 'delivery_locker' : 'delivery_house';
            PR.SpriteCache.draw(ctx, iconKey, 144, 165, false);
        }

        // 3-2-1 Countdown
        if (t > 120) {
            var countdown = 3 - Math.floor((t - 120) / 25);
            if (countdown > 0) {
                var cScale = 3 + ((t - 120) % 25 < 5 ? 1 : 0); // Pop effect
                var cColor = countdown === 1 ? '#FF2200' : countdown === 2 ? '#FF8800' : '#FFD700';
                PR.Utils.drawTextCentered(ctx, '' + countdown, 200, cColor, cScale);
            } else {
                // GO!
                var goFlash = Math.floor(t / 3) % 2;
                if (goFlash) {
                    PR.Utils.drawTextCentered(ctx, 'GO!', 200, '#22FF22', 3);
                }
            }
        }
    },

    // ============================================================
    // LEVEL COMPLETE - Slam effect
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
        var t = this.levelCompleteTimer;

        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.fillRect(0, 0, 320, 240);

        // "DELIVERED!" slams down
        var titleY = t < 15 ? -30 + t * 5 : 35;
        if (t === 15) PR.Camera.shake(4, 10);
        var titleScale = t < 15 ? 4 : 3;
        PR.Utils.drawTextCentered(ctx, 'DELIVERED!', Math.floor(titleY), '#FFD700', titleScale);

        var lvl = PR.Level.current + 1;
        if (t > 20) {
            PR.Utils.drawTextCentered(ctx, 'LEVEL ' + lvl + ' COMPLETE', 75, '#FFFFFF', 1);
        }

        // Score tally with counting effect
        var y = 100;
        if (t > 30) {
            PR.Utils.drawText(ctx, 'SCORE:', 70, y, '#CCCCCC', 1);
            var showScore = Math.min(PR.Player.score, Math.floor((t - 30) * PR.Player.score / 30));
            PR.Utils.drawText(ctx, '' + showScore, 170, y, '#FFD700', 1);
        }

        y += 16;
        var timeBonus = Math.max(0, 5000 - PR.Level.levelTimer * 2);
        if (t > 50) {
            PR.Utils.drawText(ctx, 'TIME BONUS:', 70, y, '#CCCCCC', 1);
            var showBonus = Math.min(timeBonus, Math.floor((t - 50) * timeBonus / 20));
            PR.Utils.drawText(ctx, '' + showBonus, 170, y, '#FFD700', 1);
        }

        y += 16;
        if (t > 70) {
            PR.Utils.drawText(ctx, 'TOTAL:', 70, y, '#FFFFFF', 1);
            PR.Utils.drawText(ctx, '' + (PR.Player.score + timeBonus), 170, y, '#FFD700', 2);
        }

        // Star rating - spin in one by one
        if (t > 90) {
            var stars = timeBonus > 3000 ? 3 : timeBonus > 1000 ? 2 : 1;
            var starStr = '';
            var shownStars = Math.min(stars, Math.floor((t - 90) / 15) + 1);
            for (var i = 0; i < shownStars; i++) starStr += '# ';
            PR.Utils.drawTextCentered(ctx, starStr, 160, '#FFD700', 2);
        }

        // Confetti
        if (t > 20) {
            for (var c = 0; c < 25; c++) {
                var cx = (c * 19 + t * 1.2) % 340 - 10;
                var cy = (c * 13 + t * 1.5 + Math.sin(c + t * 0.06) * 15) % 260 - 10;
                var colors = ['#FFD700', '#CC2200', '#FFFFFF', '#22CC22', '#4488FF'];
                ctx.fillStyle = colors[c % colors.length];
                ctx.globalAlpha = 0.7;
                ctx.fillRect(cx, cy, 2, 2);
            }
            ctx.globalAlpha = 1;
        }

        // Continue prompt
        if (t > 120) {
            var flash = Math.floor(t / 12) % 2;
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
            if (PR.Player.continues > 0) return 'continue';
            return 'title';
        }
        return null;
    },

    renderGameOver: function(ctx) {
        var t = this.gameOverTimer;

        // Desaturated overlay
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(0, 0, 320, 240);

        // "RETURN TO DEPOT" typewriter
        var text1 = 'RETURN TO';
        var text2 = 'DEPOT';
        var show1 = Math.min(text1.length, Math.floor(t / 3));
        var show2 = t > 30 ? Math.min(text2.length, Math.floor((t - 30) / 3)) : 0;

        var y = 45 + Math.sin(t * 0.04) * 2;
        PR.Utils.drawTextCentered(ctx, text1.substring(0, show1), y, '#CC2200', 2);
        PR.Utils.drawTextCentered(ctx, text2.substring(0, show2), y + 22, '#CC2200', 3);

        // Score + rank
        if (t > 50) {
            PR.Utils.drawTextCentered(ctx, 'FINAL SCORE: ' + PR.Player.score, 115, '#FFD700', 1);
            // Rank
            var score = PR.Player.score;
            var rank = score > 50000 ? 'POSTIE LEGEND' : score > 30000 ? 'HEAD POSTIE' :
                       score > 15000 ? 'SENIOR POSTIE' : score > 5000 ? 'POSTIE' : 'TRAINEE';
            PR.Utils.drawTextCentered(ctx, 'RANK: ' + rank, 130, '#CCCCCC', 1);
        }

        // Continue
        if (PR.Player.continues > 0) {
            if (t > 60) {
                PR.Utils.drawTextCentered(ctx, 'CONTINUES: ' + PR.Player.continues, 155, '#FFFFFF', 1);
                var countdown = Math.max(0, 10 - Math.floor((t - 60) / 60));
                var cdColor = countdown <= 3 ? '#FF2200' : '#FFD700';
                var cdScale = countdown <= 3 ? 3 : 2;
                PR.Utils.drawTextCentered(ctx, 'CONTINUE? ' + countdown, 175, cdColor, cdScale);
                if (countdown <= 0) return;
            }
        } else {
            if (t > 60) PR.Utils.drawTextCentered(ctx, 'NO CONTINUES LEFT', 155, '#CC0000', 1);
        }

        if (t > 120) {
            var flash = Math.floor(t / 12) % 2;
            if (flash) PR.Utils.drawTextCentered(ctx, 'PRESS START', 210, '#FFFFFF', 1);
        }
    },

    // ============================================================
    // PAUSE
    // ============================================================
    renderPause: function(ctx) {
        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.fillRect(0, 0, 320, 240);

        var t = PR.Game.frameCount;
        var pulseScale = 3;
        PR.Utils.drawTextCentered(ctx, 'PAUSED', 75, '#FFFFFF', pulseScale);

        PR.Utils.drawTextCentered(ctx, 'PRESS ESC TO RESUME', 120, '#CCCCCC', 1);
        PR.Utils.drawTextCentered(ctx, 'SCORE: ' + PR.Player.score, 145, '#FFD700', 1);

        // Controls reminder
        PR.Utils.drawTextCentered(ctx, 'Z:SHOOT  X:JUMP  C:GRENADE', 175, '#666688', 1);
        PR.Utils.drawTextCentered(ctx, 'DOWN+X: DODGE ROLL', 185, '#666688', 1);
    },

    // ============================================================
    // WIN SCREEN - Fireworks!
    // ============================================================
    renderWin: function(ctx) {
        ctx.fillStyle = 'rgba(0,0,0,0.88)';
        ctx.fillRect(0, 0, 320, 240);

        var t = this.levelCompleteTimer;

        // Fireworks particles
        if (t > 10) {
            for (var i = 0; i < 30; i++) {
                var ft = (t + i * 7) % 80;
                if (ft > 40) continue;
                var fx = (i * 41 + 50) % 300 + 10;
                var fy = 30 + (i * 23) % 80;
                var colors = ['#FF2200','#FFD700','#22CC22','#4488FF','#FF44AA','#FFFFFF'];
                var fc = colors[i % colors.length];
                ctx.fillStyle = fc;
                ctx.globalAlpha = 1 - ft / 40;
                // Burst pattern
                for (var j = 0; j < 8; j++) {
                    var angle = j * Math.PI / 4;
                    var r = ft * 1.5;
                    ctx.fillRect(fx + Math.cos(angle) * r, fy + Math.sin(angle) * r, 2, 2);
                }
            }
            ctx.globalAlpha = 1;
        }

        PR.Utils.drawTextCentered(ctx, 'CONGRATULATIONS!', 25, '#FFD700', 2);
        PR.Utils.drawTextCentered(ctx, 'ALL PARCELS DELIVERED!', 55, '#FFFFFF', 1);

        if (t > 30) PR.Utils.drawTextCentered(ctx, 'ERNIE HAS SAVED', 80, '#CCCCCC', 1);
        if (t > 45) PR.Utils.drawTextCentered(ctx, 'AUSTRALIA POST!', 92, '#CC2200', 2);

        if (t > 70) {
            PR.Utils.drawTextCentered(ctx, 'FINAL SCORE', 120, '#FFFFFF', 1);
            PR.Utils.drawTextCentered(ctx, '' + PR.Player.score, 135, '#FFD700', 2);
        }

        if (t > 100) {
            var score = PR.Player.score;
            var rank = score > 50000 ? 'POSTIE LEGEND' : score > 30000 ? 'HEAD POSTIE' :
                       score > 15000 ? 'SENIOR POSTIE' : score > 5000 ? 'POSTIE' : 'TRAINEE';
            PR.Utils.drawTextCentered(ctx, 'RANK: ' + rank, 160, '#FFD700', 1);
        }

        if (t > 120) {
            PR.Utils.drawTextCentered(ctx, 'THANKS FOR PLAYING!', 185, '#FFFFFF', 1);
        }

        if (t > 180) {
            var flash = Math.floor(t / 12) % 2;
            if (flash) PR.Utils.drawTextCentered(ctx, 'PRESS START', 215, '#FFFFFF', 1);
        }
    }
};
