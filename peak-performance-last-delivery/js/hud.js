// Peak Performance: Last Delivery -- HUD (README.md sec 6): dashboard
// clock, speedometer, leg-progress pips, milestone banner, Coach popup.
PPLD.Hud = {
    bannerText: '',
    bannerTimer: 0,

    showBanner: function (text) {
        this.bannerText = text;
        this.bannerTimer = 1.8;
    },

    update: function (dt) {
        if (this.bannerTimer > 0) this.bannerTimer -= dt;
    },

    // Purely cosmetic 8:30pm -> midnight dashboard clock, driven by how
    // much of the real countdown has been spent (see constants.js
    // CLOCK_START_MIN/CLOCK_END_MIN and README sec 6).
    fictionalClockText: function (timeLeft, timeStart) {
        var C = PPLD.CONST;
        var frac = 1 - Math.max(0, Math.min(1, timeLeft / timeStart));
        var minutes = C.CLOCK_START_MIN + frac * (C.CLOCK_END_MIN - C.CLOCK_START_MIN);
        minutes = Math.round(minutes) % 1440;
        var h = Math.floor(minutes / 60);
        var m = minutes % 60;
        var suffix = h >= 12 ? 'PM' : 'AM';
        var h12 = h % 12; if (h12 === 0) h12 = 12;
        return h12 + ':' + (m < 10 ? '0' : '') + m + ' ' + suffix;
    },

    draw: function (ctx, s) {
        var C = PPLD.CONST;
        ctx.save();
        ctx.font = '8px monospace';
        ctx.textBaseline = 'top';

        this.drawClock(ctx, s);
        this.drawSpeedo(ctx, s);
        this.drawPips(ctx, s);
        if (this.bannerTimer > 0) this.drawBanner(ctx);
        if (s.coach && s.coach.current) this.drawCoachPopup(ctx, s.coach.current);

        ctx.restore();
    },

    drawClock: function (ctx, s) {
        var C = PPLD.CONST;
        var text = this.fictionalClockText(s.timeLeft, s.timeStart);
        var low = s.timeLeft <= C.LOW_TIME_WARNING;
        var cx = C.CANVAS_W / 2, y = 4;

        ctx.fillStyle = C.COL.UI_BG;
        this.roundRect(ctx, cx - 34, y, 68, 16, 3);
        ctx.fill();
        ctx.strokeStyle = low && Math.floor(s.timeLeft * 4) % 2 === 0 ? C.COL.UI_RED : '#7a1216';
        ctx.lineWidth = 2;
        this.roundRect(ctx, cx - 34, y, 68, 16, 3);
        ctx.stroke();

        ctx.fillStyle = low ? C.COL.UI_RED : C.COL.UI_GOLD;
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(text, cx, y + 4);
        ctx.textAlign = 'left';
        ctx.font = '6px monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.textAlign = 'center';
        ctx.fillText('TO MIDNIGHT', cx, y + 12);
        ctx.textAlign = 'left';
    },

    drawSpeedo: function (ctx, s) {
        var C = PPLD.CONST;
        var cx = 26, cy = C.CANVAS_H - 26, r = 20;
        ctx.fillStyle = 'rgba(20,16,10,0.65)';
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#d8c8a0';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(cx, cy, r - 1, Math.PI * 0.75, Math.PI * 2.25); ctx.stroke();

        var frac = Math.max(0, Math.min(1, s.speedFrac));
        var angle = Math.PI * 0.75 + frac * Math.PI * 1.5;
        ctx.strokeStyle = C.COL.UI_RED;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * (r - 4), cy + Math.sin(angle) * (r - 4));
        ctx.stroke();
        ctx.fillStyle = '#d8c8a0';
        ctx.beginPath(); ctx.arc(cx, cy, 1.6, 0, Math.PI * 2); ctx.fill();
    },

    drawPips: function (ctx, s) {
        var C = PPLD.CONST;
        var n = C.LEGS.length;
        var w = 10, gap = 3;
        var startX = C.CANVAS_W - 4 - n * (w + gap);
        for (var i = 0; i < n; i++) {
            var x = startX + i * (w + gap);
            var done = i < s.legIndex || s.legComplete;
            var current = i === s.legIndex && !s.legComplete;
            ctx.fillStyle = done ? '#c8202a' : (current ? '#e8b98f' : 'rgba(255,255,255,0.25)');
            this.roundRect(ctx, x, 4, w, 8, 2);
            ctx.fill();
            if (done) {
                ctx.strokeStyle = '#ffd166';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(x + 2, 8); ctx.lineTo(x + 4, 10.5); ctx.lineTo(x + 8, 5.5);
                ctx.stroke();
            }
        }
    },

    drawBanner: function (ctx) {
        var C = PPLD.CONST;
        var alpha = Math.min(1, this.bannerTimer / 0.3, (1.8 - this.bannerTimer) / 0.3 + 1);
        alpha = Math.max(0, Math.min(1, alpha));
        var y = C.CANVAS_H * 0.3;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = 'rgba(150,20,20,0.85)';
        var w = Math.min(C.CANVAS_W - 20, this.bannerText.length * 6 + 20);
        this.roundRect(ctx, (C.CANVAS_W - w) / 2, y, w, 16, 3);
        ctx.fill();
        ctx.strokeStyle = '#ffd166';
        ctx.lineWidth = 1.5;
        this.roundRect(ctx, (C.CANVAS_W - w) / 2, y, w, 16, 3);
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(this.bannerText, C.CANVAS_W / 2, y + 4);
        ctx.textAlign = 'left';
        ctx.restore();
    },

    drawCoachPopup: function (ctx, cur) {
        var C = PPLD.CONST;
        var boxW = 150, boxH = 34;
        var x = 4, y = C.CANVAS_H - boxH - 4;

        ctx.save();
        ctx.fillStyle = C.COL.UI_BG;
        this.roundRect(ctx, x, y, boxW, boxH, 4);
        ctx.fill();
        ctx.strokeStyle = C.COL.UI_GOLD;
        ctx.lineWidth = 1.5;
        this.roundRect(ctx, x, y, boxW, boxH, 4);
        ctx.stroke();

        PPLD.Sprites.drawCoachPortrait(ctx, x + 17, y + 17, 13, cur.expression, cur.talkOn);

        ctx.fillStyle = '#fff';
        ctx.font = '6px monospace';
        this.wrapText(ctx, cur.text, x + 34, y + 5, boxW - 38, 7);
        ctx.restore();
    },

    wrapText: function (ctx, text, x, y, maxWidth, lineHeight) {
        var words = text.split(' ');
        var line = '', ly = y;
        for (var i = 0; i < words.length; i++) {
            var test = line + words[i] + ' ';
            if (ctx.measureText(test).width > maxWidth && line) {
                ctx.fillText(line, x, ly);
                line = words[i] + ' ';
                ly += lineHeight;
            } else {
                line = test;
            }
        }
        ctx.fillText(line, x, ly);
    },

    roundRect: function (ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }
};
