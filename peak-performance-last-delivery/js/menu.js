// Peak Performance: Last Delivery -- title, leg-intro and results screens.
PPLD.Menu = {
    t: 0,

    update: function (dt) { this.t += dt; },

    drawTitle: function (ctx) {
        var C = PPLD.CONST;
        var grd = ctx.createLinearGradient(0, 0, 0, C.CANVAS_H);
        grd.addColorStop(0, '#241a30');
        grd.addColorStop(0.55, '#3a2a45');
        grd.addColorStop(1, '#161018');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, C.CANVAS_W, C.CANVAS_H);

        // A few twinkling stars/snow for atmosphere.
        ctx.fillStyle = '#fff';
        for (var i = 0; i < 24; i++) {
            var sx = (i * 53 + 17) % C.CANVAS_W;
            var sy = (i * 29) % (C.CANVAS_H * 0.5);
            var tw = 0.4 + 0.6 * Math.abs(Math.sin(this.t * 2 + i));
            ctx.globalAlpha = tw * 0.7;
            ctx.fillRect(sx, sy, 1, 1);
        }
        ctx.globalAlpha = 1;

        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffd166';
        ctx.font = 'bold 20px monospace';
        ctx.fillText('PEAK PERFORMANCE', C.CANVAS_W / 2, 44);
        ctx.fillStyle = '#e63946';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('LAST DELIVERY', C.CANVAS_W / 2, 62);

        PPLD.Sprites.drawCoachPortrait(ctx, C.CANVAS_W / 2, 118, 34, 'pumped',
            Math.floor(this.t * 4) % 2 === 0);

        ctx.fillStyle = '#fff';
        ctx.font = '8px monospace';
        ctx.fillText("It's Christmas Eve. One parcel left.", C.CANVAS_W / 2, 168);
        ctx.fillText('Deliver it before midnight.', C.CANVAS_W / 2, 178);

        if (Math.floor(this.t * 2) % 2 === 0) {
            ctx.fillStyle = '#ffd166';
            ctx.font = 'bold 9px monospace';
            var prompt = PPLD.Input.touchMode ? 'TAP TO START' : 'PRESS ENTER TO START';
            ctx.fillText(prompt, C.CANVAS_W / 2, 200);
        }

        ctx.font = '6px monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.fillText(PPLD.Input.touchMode ?
            'Drag left/right to steer - bottom-right to go' :
            'Arrows/WASD to steer - Up to go - Down to brake', C.CANVAS_W / 2, 214);
        ctx.textAlign = 'left';
    },

    drawLegIntro: function (ctx, legIndex) {
        var C = PPLD.CONST;
        var leg = C.LEGS[legIndex];
        ctx.fillStyle = '#0c0a12';
        ctx.fillRect(0, 0, C.CANVAS_W, C.CANVAS_H);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffd166';
        ctx.font = 'bold 9px monospace';
        ctx.fillText('LEG ' + (legIndex + 1) + ' OF ' + C.LEGS.length, C.CANVAS_W / 2, 80);
        ctx.font = 'bold 16px monospace';
        ctx.fillStyle = '#fff';
        ctx.fillText(leg.name.toUpperCase(), C.CANVAS_W / 2, 98);

        var cond = this.conditionLabel(leg);
        ctx.font = '8px monospace';
        ctx.fillStyle = '#cfcfe0';
        ctx.fillText(cond, C.CANVAS_W / 2, 122);

        PPLD.Sprites.drawCoachPortrait(ctx, C.CANVAS_W / 2, 160, 22, 'neutral',
            Math.floor(this.t * 4) % 2 === 0);
        ctx.textAlign = 'left';
    },

    conditionLabel: function (leg) {
        var time = leg.night ? 'Night' : (leg.dusk ? 'Dusk' : 'Afternoon');
        var w = { clear: 'Clear', rain: 'Rain', fog: 'Fog', snow: 'Snow', blizzard: 'Blizzard' }[leg.weather];
        return time + ' · ' + w;
    },

    drawResults: function (ctx, win, stats, coachLine) {
        var C = PPLD.CONST;
        var grd = ctx.createLinearGradient(0, 0, 0, C.CANVAS_H);
        grd.addColorStop(0, win ? '#1a2a20' : '#1a1620');
        grd.addColorStop(1, '#0c0a10');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, C.CANVAS_W, C.CANVAS_H);

        ctx.textAlign = 'center';
        ctx.fillStyle = win ? '#ffd166' : '#cfcfe0';
        ctx.font = 'bold 16px monospace';
        ctx.fillText(win ? 'DELIVERED!' : "TIME'S UP", C.CANVAS_W / 2, 26);
        ctx.font = '8px monospace';
        ctx.fillStyle = '#fff';
        ctx.fillText(win ? 'Merry Christmas.' : 'The house lights just went out.', C.CANVAS_W / 2, 40);

        PPLD.Sprites.drawCoachPortrait(ctx, C.CANVAS_W / 2, 84, 26, win ? 'pumped' : 'neutral',
            Math.floor(this.t * 4) % 2 === 0);

        ctx.font = '7px monospace';
        ctx.fillStyle = '#fff';
        this.wrap(ctx, coachLine, C.CANVAS_W / 2, 118, C.CANVAS_W - 40, 9);

        ctx.font = '7px monospace';
        ctx.fillStyle = '#cfcfe0';
        ctx.fillText('Legs cleared: ' + stats.legsCleared + ' / ' + C.LEGS.length, C.CANVAS_W / 2, 170);
        ctx.fillText('Vehicles passed: ' + stats.overtakes, C.CANVAS_W / 2, 180);
        ctx.fillText('Time on the clock: ' + Math.max(0, Math.round(stats.timeLeft)) + 's', C.CANVAS_W / 2, 190);

        if (Math.floor(this.t * 2) % 2 === 0) {
            ctx.fillStyle = '#ffd166';
            ctx.font = 'bold 8px monospace';
            ctx.fillText(PPLD.Input.touchMode ? 'TAP TO GO AGAIN' : 'PRESS ENTER TO GO AGAIN', C.CANVAS_W / 2, 208);
        }
        ctx.textAlign = 'left';
    },

    wrap: function (ctx, text, cx, y, maxWidth, lineHeight) {
        var words = text.split(' ');
        var line = '', ly = y, lines = [];
        for (var i = 0; i < words.length; i++) {
            var test = line + words[i] + ' ';
            if (ctx.measureText(test).width > maxWidth && line) {
                lines.push(line);
                line = words[i] + ' ';
            } else {
                line = test;
            }
        }
        lines.push(line);
        for (var j = 0; j < lines.length; j++) {
            ctx.fillText(lines[j].trim(), cx, ly + j * lineHeight);
        }
    }
};
