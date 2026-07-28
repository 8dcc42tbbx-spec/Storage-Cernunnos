// Shared HUD / dialogue-box / menu widgets built on top of art.js + pixelfont.js
var CY = CY || {};
CY.UI = {};

(function () {
    var C = CY.COLORS;
    var rect = CY.Art._rect;

    // Stone-framed panel with a beveled border, used for dialogue + menu boxes.
    CY.UI.drawPanel = function (ctx, x, y, w, h) {
        rect(ctx, x, y, w, h, C.parchment);
        rect(ctx, x, y, w, 3, C.caveHi);
        rect(ctx, x, y, 3, h, C.caveHi);
        rect(ctx, x, y + h - 3, w, 3, C.ink);
        rect(ctx, x + w - 3, y, 3, h, C.ink);
        rect(ctx, x + 3, y + 3, w - 6, h - 6, C.parchment);
    };

    // Darkens a band of artwork so overlaid text stays readable on top of it.
    CY.UI.drawScrim = function (ctx, x, y, w, h, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha === undefined ? 0.72 : alpha;
        rect(ctx, x, y, w, h, C.black);
        ctx.restore();
    };

    CY.UI.drawHUD = function (ctx, riddleIndex, total, escapeScore, hint) {
        rect(ctx, 0, 0, CY.WIDTH, 14, C.black);
        CY.drawText(ctx, 'RIDDLE ' + riddleIndex + '/' + total, 4, 4, 1, C.gold);
        // boulder meter, right-aligned
        var r = 4, gap = 10, startX = CY.WIDTH - total * gap - 2;
        for (var i = 0; i < total; i++) {
            CY.Art.drawBoulder(ctx, startX + i * gap, 7, r, i < escapeScore);
        }
        if (hint) {
            var w = CY.textWidth(hint, 1);
            CY.drawText(ctx, hint, CY.WIDTH / 2 - w / 2, 4, 1, C.parchmentDark);
        }
    };

    CY.UI.drawTimerBar = function (ctx, x, y, w, h, frac) {
        frac = Math.max(0, Math.min(1, frac));
        rect(ctx, x, y, w, h, C.caveMid);
        var color = frac > 0.5 ? C.green : (frac > 0.2 ? C.gold : C.red);
        rect(ctx, x, y, w * frac, h, color);
        rect(ctx, x, y, w, 1, C.black);
        rect(ctx, x, y + h - 1, w, 1, C.black);
    };

    CY.UI.drawDialogue = function (ctx, x, y, w, h, text, scale) {
        CY.UI.drawPanel(ctx, x, y, w, h);
        CY.drawTextBlock(ctx, text, x + 8, y + 8, scale || 1, C.ink, w - 16, 4);
    };

    // options: array of 4 strings. On reveal the correct row turns green; if the
    // room's pick was wrong, that row turns red so the miss is obvious at a glance.
    CY.UI.drawOptions = function (ctx, x, y, w, options, correctIndex, revealed, pickedIndex) {
        var letters = ['A', 'B', 'C', 'D'];
        var rowH = 13;
        for (var i = 0; i < options.length; i++) {
            var ry = y + i * rowH;
            var isCorrect = revealed && i === correctIndex;
            var isWrongPick = revealed && pickedIndex === i && i !== correctIndex;
            var bg = isCorrect ? C.green : (isWrongPick ? C.red : C.parchment);
            var tab = isCorrect ? '#2c7a44' : (isWrongPick ? '#8a2020' : C.caveHi);
            var fg = (isCorrect || isWrongPick) ? C.white : C.ink;
            rect(ctx, x, ry, w, rowH - 2, bg);
            rect(ctx, x, ry, 14, rowH - 2, tab);
            CY.drawText(ctx, letters[i], x + 4, ry + 3, 1, C.white);
            CY.drawText(ctx, options[i], x + 18, ry + 3, 1, fg);
            if (isCorrect) CY.drawText(ctx, '*', x + w - 10, ry + 3, 1, C.white);
            else if (isWrongPick) CY.drawText(ctx, 'X', x + w - 10, ry + 3, 1, C.white);
        }
    };

    CY.UI.drawBlinkPrompt = function (ctx, text, cx, y, t, scale, color) {
        if (Math.floor(t / 500) % 2 === 0) {
            var w = CY.textWidth(text, scale);
            CY.drawText(ctx, text, cx - w / 2, y, scale, color || C.white);
        }
    };

    CY.UI.drawCentered = function (ctx, text, cx, y, scale, color) {
        var w = CY.textWidth(text, scale);
        CY.drawText(ctx, text, cx - w / 2, y, scale, color);
        return w;
    };
})();
