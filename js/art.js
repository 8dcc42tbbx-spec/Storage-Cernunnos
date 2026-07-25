// Procedural 8-bit pixel art. Every scene is assembled from grid-aligned
// filled rectangles / blocky circles only -- never smooth canvas paths --
// so it stays crisp when the canvas is scaled up with nearest-neighbor.
// This is the built-in look; assets/*.png (see prompts/gemini-art-prompts.md)
// can override any piece of it once generated.
var CY = CY || {};
CY.Art = {};

(function () {
    var C = CY.COLORS;

    function rect(ctx, x, y, w, h, color) {
        ctx.fillStyle = color;
        ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
    }

    // Blocky circle made of `cell`-sized squares -- reads as a pixel-art disc.
    function blob(ctx, cx, cy, r, cell, color) {
        var steps = Math.ceil(r / cell);
        for (var gx = -steps; gx <= steps; gx++) {
            for (var gy = -steps; gy <= steps; gy++) {
                var dx = gx * cell, dy = gy * cell;
                if (dx * dx + dy * dy <= r * r) {
                    rect(ctx, cx + dx, cy + dy, cell, cell, color);
                }
            }
        }
    }

    // Draws an ascii sprite: array of equal-length strings, palette maps char->color, '.' = transparent
    function sprite(ctx, rows, palette, x, y, cell) {
        for (var r = 0; r < rows.length; r++) {
            var row = rows[r];
            for (var c = 0; c < row.length; c++) {
                var ch = row[c];
                if (ch === '.' || ch === ' ') continue;
                var col = palette[ch];
                if (!col) continue;
                rect(ctx, x + c * cell, y + r * cell, cell, cell, col);
            }
        }
        return { w: rows[0].length * cell, h: rows.length * cell };
    }
    CY.Art._sprite = sprite;
    CY.Art._rect = rect;
    CY.Art._blob = blob;

    function starfield(ctx, x, y, w, h, count, t, seed) {
        var rnd = seed || 1;
        function next() { rnd = (rnd * 9301 + 49297) % 233280; return rnd / 233280; }
        for (var i = 0; i < count; i++) {
            var sx = Math.floor(x + next() * w);
            var sy = Math.floor(y + next() * h);
            var twinkle = (Math.floor(t / 400) + i) % 5 === 0;
            rect(ctx, sx, sy, 1, 1, twinkle ? C.gold : C.stars);
        }
    }
    CY.Art.starfield = starfield;

    function moon(ctx, cx, cy, r) {
        blob(ctx, cx, cy, r, 2, C.moon);
        blob(ctx, cx + r * 0.55, cy - r * 0.25, r * 0.85, 2, C.nightSky2);
    }

    // ---- Cave backdrop (used behind most screens) --------------------------
    CY.Art.drawCaveBackdrop = function (ctx, t) {
        rect(ctx, 0, 0, CY.WIDTH, CY.HEIGHT, C.caveDark);
        // stepped gradient bands (flat colors, no smooth blend, to stay 8-bit)
        rect(ctx, 0, 0, CY.WIDTH, 40, C.black);
        rect(ctx, 0, 40, CY.WIDTH, 30, '#1c130d');
        // cave mouth opening with night sky glimpse, upper-right
        var moonX = CY.WIDTH - 46, moonY = 30;
        starfield(ctx, CY.WIDTH - 90, 6, 84, 50, 22, t, 7);
        moon(ctx, moonX, moonY, 10);
        // stalactites along the top
        var stal = [10, 46, 90, 150, 210, 260, 300];
        for (var i = 0; i < stal.length; i++) {
            var sx = stal[i];
            var sh = 10 + (i % 3) * 6;
            for (var yy = 0; yy < sh; yy += 4) {
                var w = 12 - Math.floor((yy / sh) * 10);
                rect(ctx, sx - w / 2, yy, w, 4, C.caveMid);
            }
        }
        // floor
        rect(ctx, 0, CY.HEIGHT - 6, CY.WIDTH, 6, C.black);
    };

    // Flickering torch, used at fixed positions to light the scene.
    CY.Art.drawTorch = function (ctx, x, y, t) {
        rect(ctx, x - 1, y, 2, 14, '#3a2a18');
        var flick = Math.floor(t / 120) % 3;
        var fh = 8 + flick * 2;
        rect(ctx, x - 3, y - fh, 6, 4, C.fireDark);
        rect(ctx, x - 2, y - fh - 3, 4, 4, C.fire);
        rect(ctx, x - 1, y - fh - 5, 2, 3, C.gold);
    };

    // ---- Title screen --------------------------------------------------
    CY.Art.drawTitle = function (ctx, t) {
        rect(ctx, 0, 0, CY.WIDTH, CY.HEIGHT, C.nightSky);
        starfield(ctx, 0, 0, CY.WIDTH, 130, 60, t, 3);
        moon(ctx, 40, 34, 14);
        // sea
        rect(ctx, 0, 128, CY.WIDTH, 20, C.sea);
        rect(ctx, 0, 130, CY.WIDTH, 4, C.seaDark);
        // distant cave-mouth silhouette (rocky arch) framing the title
        rect(ctx, 0, 90, 46, 58, C.black);
        rect(ctx, 0, 60, 26, 30, C.black);
        rect(ctx, CY.WIDTH - 46, 90, 46, 58, C.black);
        rect(ctx, CY.WIDTH - 26, 60, 26, 30, C.black);
        // giant cyclops silhouette looming behind the cave mouth
        blob(ctx, CY.WIDTH / 2, 118, 30, 3, C.black);
        rect(ctx, CY.WIDTH / 2 - 22, 118, 44, 30, C.black);
        blob(ctx, CY.WIDTH / 2, 112, 6, 2, C.monsterEye);
        blob(ctx, CY.WIDTH / 2, 112, 2, 2, C.monsterPupil);
        // ground
        rect(ctx, 0, 148, CY.WIDTH, CY.HEIGHT - 148, C.caveDark);
        rect(ctx, 0, 148, CY.WIDTH, 4, C.black);
    };

    // ---- Cyclops portrait (moods: idle, angry, pleased, laugh, sleeping) --
    CY.Art.drawCyclops = function (ctx, x, y, scale, mood, t) {
        scale = scale || 1;
        ctx.save();
        ctx.translate(x, y);
        var cell = 3 * scale;
        // head (blocky rounded shape via row widths)
        var rows = [4, 8, 11, 13, 14, 14, 14, 14, 13, 12, 10, 7];
        var headTop = 0;
        for (var i = 0; i < rows.length; i++) {
            var w = rows[i] * cell;
            rect(ctx, -w / 2, headTop + i * cell, w, cell, C.monsterSkin);
        }
        // shading on left side
        for (i = 2; i < rows.length - 1; i++) {
            var w2 = rows[i] * cell;
            rect(ctx, -w2 / 2, headTop + i * cell, cell * 1.5, cell, C.monsterSkinDark);
        }
        var bob = mood === 'sleeping' ? 0 : Math.sin(t / 260) * 1.5;
        var eyeY = 5 * cell + bob;
        // brow
        if (mood === 'angry') {
            rect(ctx, -3.5 * cell, eyeY - cell * 1.6, 7 * cell, cell, C.monsterSkinDark);
        } else if (mood === 'pleased' || mood === 'laugh') {
            rect(ctx, -3.5 * cell, eyeY - cell * 2.2, 7 * cell, cell * 0.6, C.monsterSkinDark);
        }
        // the one eye
        if (mood === 'pleased' || mood === 'sleeping') {
            rect(ctx, -3 * cell, eyeY, 6 * cell, cell * 0.8, C.monsterSkinDark);
        } else {
            blob(ctx, 0, eyeY, 3.2 * cell, cell * 0.66, C.monsterEye);
            var lookX = mood === 'angry' ? cell * 0.6 : 0;
            blob(ctx, lookX, eyeY, cell * 1.1, cell * 0.66, C.monsterPupil);
        }
        // mouth
        var mouthY = 9 * cell;
        if (mood === 'angry') {
            rect(ctx, -3 * cell, mouthY, 6 * cell, cell * 1.4, C.black);
            for (var tth = -2; tth <= 2; tth++) {
                rect(ctx, tth * cell, mouthY, cell * 0.8, cell * 0.8, C.white);
            }
        } else if (mood === 'laugh') {
            rect(ctx, -3.5 * cell, mouthY - cell * 0.3, 7 * cell, cell * 2, C.black);
            for (tth = -3; tth <= 3; tth++) {
                rect(ctx, tth * cell, mouthY - cell * 0.3, cell * 0.75, cell * 0.75, C.white);
            }
        } else if (mood === 'pleased') {
            rect(ctx, -2.5 * cell, mouthY, 5 * cell, cell * 0.8, C.monsterSkinDark);
        } else {
            rect(ctx, -2 * cell, mouthY, 4 * cell, cell * 0.7, C.monsterSkinDark);
        }
        ctx.restore();
    };

    // ---- Escape-progress boulder icon (HUD) --------------------------
    CY.Art.drawBoulder = function (ctx, x, y, r, lit) {
        blob(ctx, x, y, r, 2, lit ? C.bronze : C.caveMid);
        blob(ctx, x - r * 0.3, y - r * 0.3, r * 0.4, 2, lit ? C.gold : C.caveLight);
    };

    // ---- Per-question scene icons --------------------------------------
    var P = {
        '.': null,
        'k': C.bronze,        // helmet bronze
        'K': '#8a5a24',        // darker bronze
        'h': '#caa25a',        // horsehair / crest
        's': '#3a3a3a',        // shield/spear steel
        'w': C.white,
        'y': C.gold,
        'b': '#5a4326',        // wood
        'o': '#c9822a',        // owl body
        'O': '#8a5518',        // owl dark
        'g': '#3a6b8a',        // camera/steel grey-blue
        'G': '#1f4658',
        'r': C.red,
        'p': '#6b4fa0',        // purple mask / robe
        'P': '#4a3672',
        'm': '#8a8a8a',        // metal
        'M': '#5a5a5a',
        'e': C.monsterEye,
        'n': C.monsterPupil,
        'v': C.monsterSkin
    };

    function centered(ctx, rows, palette, cx, cy, cell) {
        var w = rows[0].length * cell, h = rows.length * cell;
        return sprite(ctx, rows, palette, cx - w / 2, cy - h / 2, cell);
    }

    CY.Art.drawSceneIcon = function (ctx, cx, cy, sceneId, t) {
        var bob = Math.sin(t / 500) * 2;
        cy += bob;
        switch (sceneId) {
            case 'q1_zeuslaw': { // a hooded stranger at the door -- maybe a god in disguise
                var rows = [
                    '....y....',
                    '...yyy...',
                    '..bbbbb..',
                    '.bbbbbbb.',
                    '.b.....b.',
                    '.bbbbbbb.',
                    '..bbbbb..',
                    '.b.....b.'
                ];
                centered(ctx, rows, P, cx, cy, 7);
                break;
            }
            case 'q2_telemachus': { // young prince: small crown + bow
                var rows2 = [
                    '..y.y.y..',
                    '.yyyyyyy.',
                    '.k.....k.',
                    'kkk...kkk',
                    '.k.....k.',
                    '..b...b..',
                    '...b.b...',
                    '....b....'
                ];
                centered(ctx, rows2, P, cx, cy, 7);
                break;
            }
            case 'q3_giants': { // a giant's club looms over a tiny fleeing figure -- forced perspective
                var rows3 = [
                    '.mmmmm...',
                    'mmmmmmm..',
                    '.mmmmm...',
                    '..mmm....',
                    '..mmm....',
                    '..mmm...b',
                    '..mmm..bb',
                    '.......bb'
                ];
                centered(ctx, rows3, P, cx, cy, 7);
                break;
            }
            case 'q4_imax': { // giant film camera
                var rows4 = [
                    '.mmmmm...',
                    '.mGGGm.m.',
                    'gggggGmMm',
                    'gyyygGGGG',
                    'gggggGGGG',
                    '.mmmmm...',
                    '.m...m...',
                    '.M...M...'
                ];
                centered(ctx, rows4, P, cx, cy, 7);
                break;
            }
            case 'q5_runtime': { // hourglass
                var rows5 = [
                    'mmmmmmm',
                    '.mmmmm.',
                    '..mgm..',
                    '...g...',
                    '..mgm..',
                    '.mmmmm.',
                    'mmmmmmm'
                ];
                centered(ctx, rows5, P, cx, cy, 8);
                break;
            }
            case 'q6_animatronic': { // giant robot cyclops + tiny human + ruler
                var rows6 = [
                    '.mmmmm....',
                    'mmemmm....',
                    'mmnmmm....',
                    '.mmmmm....',
                    'm.mmm.m...',
                    'm.mmm.m..k',
                    '..mmm....k',
                    '..m.m....k'
                ];
                centered(ctx, rows6, P, cx, cy, 7);
                break;
            }
            case 'q7_nyongo': { // twin theatre masks
                var rows7 = [
                    'pp.....PP',
                    'pwp...PwP',
                    'pwwp.PwwP',
                    'pwpwPPwwP',
                    'p.wwww.wP',
                    'pp....PPP'
                ];
                centered(ctx, rows7, P, cx, cy, 7);
                break;
            }
        }
    };

    // ---- Ending scenes ---------------------------------------------------
    CY.Art.drawEndingGreat = function (ctx, t) {
        rect(ctx, 0, 0, CY.WIDTH, CY.HEIGHT, C.nightSky);
        starfield(ctx, 0, 0, CY.WIDTH, 130, 70, t, 11);
        moon(ctx, CY.WIDTH - 50, 34, 14);
        rect(ctx, 0, 150, CY.WIDTH, CY.HEIGHT - 150, C.caveDark);
        // wide open cave mouth, empty (cyclops outsmarted)
        rect(ctx, 60, 60, CY.WIDTH - 120, 96, C.black);
        // sheep silhouettes walking free with a tiny figure clinging beneath one
        for (var i = 0; i < 4; i++) {
            var sx = 90 + i * 38 + Math.sin(t / 300 + i) * 2;
            rect(ctx, sx, 128, 20, 12, '#e6ddc4');
            rect(ctx, sx + 2, 122, 10, 8, '#e6ddc4');
            rect(ctx, sx + 4, 138, 3, 8, C.black);
            rect(ctx, sx + 13, 138, 3, 8, C.black);
            if (i === 2) {
                rect(ctx, sx + 5, 140, 6, 10, '#7a5c3e'); // Odysseus clinging beneath
            }
        }
        CY.UI.drawCentered(ctx, 'THE BOULDER ROLLS ASIDE.', CY.WIDTH / 2, 154, 2, C.gold);
        CY.UI.drawCentered(ctx, 'ODYSSEUS ESCAPES!', CY.WIDTH / 2, 172, 2, C.white);
    };

    // Layout used by all three endings: art/scene lives in y0-148, the two
    // flavor-text lines sit at y154/172, and y150+ (plus the y188-240 strip
    // game.js overlays with the score + restart prompt) stays uncluttered.
    CY.Art.drawEndingNarrow = function (ctx, t) {
        rect(ctx, 0, 0, CY.WIDTH, CY.HEIGHT, C.nightSky2);
        starfield(ctx, 0, 0, CY.WIDTH, 90, 40, t, 21);
        CY.Art.drawCyclops(ctx, CY.WIDTH / 2, 6, 1.0, 'sleeping', t);
        rect(ctx, CY.WIDTH / 2 - 14, 70, 28, 10, '#7a2f2f'); // spilled wine cup
        for (var i = 0; i < 3; i++) {
            var sx = 60 + i * 70;
            rect(ctx, sx, 108, 10, 16, C.caveHi);
            rect(ctx, sx + 2, 102, 6, 8, '#e0c9a0');
        }
        rect(ctx, 0, 148, CY.WIDTH, CY.HEIGHT - 148, C.caveDark);
        CY.UI.drawCentered(ctx, 'YOU SLIP PAST HIS SNORES.', CY.WIDTH / 2, 154, 2, C.gold);
        CY.UI.drawCentered(ctx, 'A NARROW ESCAPE!', CY.WIDTH / 2, 172, 2, C.white);
    };

    CY.Art.drawEndingCaught = function (ctx, t) {
        rect(ctx, 0, 0, CY.WIDTH, CY.HEIGHT, C.caveDark);
        CY.Art.drawCyclops(ctx, CY.WIDTH / 2, 2, 1.0, 'laugh', t);
        rect(ctx, CY.WIDTH / 2 - 20, 100, 40, 26, '#2a2a2a'); // cooking pot
        rect(ctx, CY.WIDTH / 2 - 24, 96, 48, 6, '#3a3a3a');
        for (var i = -1; i <= 1; i++) {
            rect(ctx, CY.WIDTH / 2 + i * 10, 106, 6, 6, '#c9822a'); // potatoes, not heroes -- keep it silly
        }
        CY.UI.drawCentered(ctx, 'CAUGHT! NO ESCAPE.', CY.WIDTH / 2, 154, 2, C.red);
        CY.UI.drawCentered(ctx, 'POTATOES FOR A WEEK.', CY.WIDTH / 2, 172, 2, C.white);
    };
})();
