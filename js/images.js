// Optional PNG overrides. If a matching file exists in assets/ (see
// prompts/gemini-art-prompts.md) it is drawn instead of the procedural art;
// otherwise the game silently keeps using the built-in pixel-art fallback.
var CY = CY || {};
CY.Images = (function () {
    var manifest = [
        'title', 'cave_backdrop',
        'cyclops_idle', 'cyclops_angry', 'cyclops_pleased', 'cyclops_laugh', 'cyclops_sleeping',
        'scene_q1_zeuslaw', 'scene_q2_telemachus', 'scene_q3_giants', 'scene_q4_imax',
        'scene_q5_trojanhorse', 'scene_q6_animatronic', 'scene_q7_ancient',
        'ending_great', 'ending_narrow', 'ending_caught'
    ];
    var store = {};

    manifest.forEach(function (key) {
        var img = new Image();
        var entry = { img: img, ready: false, failed: false };
        img.onload = function () { entry.ready = true; };
        img.onerror = function () { entry.failed = true; };
        // CY.ASSET_DATA is only defined in the single-file build, where the
        // artwork is inlined as data URIs because the page can't fetch
        // sibling files. Normally this just loads from assets/.
        img.src = (window.CY && CY.ASSET_DATA && CY.ASSET_DATA[key]) || ('assets/' + key + '.png');
        store[key] = entry;
    });

    return {
        has: function (key) {
            var e = store[key];
            return !!(e && e.ready);
        },

        // Draws the override image into x,y,w,h if it loaded; returns true if drawn.
        // Stretches to fit, so only use where the art matches the rect's aspect.
        draw: function (ctx, key, x, y, w, h) {
            var entry = store[key];
            if (entry && entry.ready) {
                ctx.drawImage(entry.img, x, y, w, h);
                return true;
            }
            return false;
        },

        // Fits the whole image inside the rect, centred, cropping nothing.
        // Use where losing any part of the image matters more than filling
        // the space -- the caller is responsible for what shows behind it.
        drawContain: function (ctx, key, dx, dy, dw, dh) {
            var e = store[key];
            if (!e || !e.ready) return false;
            var iw = e.img.naturalWidth, ih = e.img.naturalHeight;
            if (!iw || !ih) return false;
            var scale = Math.min(dw / iw, dh / ih);
            var w = Math.round(iw * scale), h = Math.round(ih * scale);
            ctx.drawImage(e.img, Math.round(dx + (dw - w) / 2), Math.round(dy + (dh - h) / 2), w, h);
            return true;
        },

        // Fills the rect while preserving the image's aspect, centre-cropping
        // the overflow. focalY (0 = top, 0.5 = middle, 1 = bottom) biases a
        // vertical crop -- portraits want it high so the face survives.
        drawCover: function (ctx, key, dx, dy, dw, dh, focalY) {
            var e = store[key];
            if (!e || !e.ready) return false;
            var iw = e.img.naturalWidth, ih = e.img.naturalHeight;
            if (!iw || !ih) return false;
            var srcA = iw / ih, dstA = dw / dh;
            var sx, sy, sw, sh;
            if (srcA > dstA) {          // source too wide: trim the sides
                sh = ih; sw = ih * dstA; sy = 0; sx = (iw - sw) / 2;
            } else {                    // source too tall: trim top/bottom
                sw = iw; sh = iw / dstA; sx = 0;
                sy = (ih - sh) * (focalY === undefined ? 0.5 : focalY);
            }
            ctx.drawImage(e.img, sx, sy, sw, sh, dx, dy, dw, dh);
            return true;
        }
    };
})();
