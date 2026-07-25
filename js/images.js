// Optional PNG overrides. If a matching file exists in assets/ (see
// prompts/gemini-art-prompts.md) it is drawn instead of the procedural art;
// otherwise the game silently keeps using the built-in pixel-art fallback.
var CY = CY || {};
CY.Images = (function () {
    var manifest = [
        'title', 'cave_backdrop',
        'cyclops_idle', 'cyclops_angry', 'cyclops_pleased', 'cyclops_laugh', 'cyclops_sleeping',
        'scene_q1_zeuslaw', 'scene_q2_telemachus', 'scene_q3_giants', 'scene_q4_imax',
        'scene_q5_runtime', 'scene_q6_animatronic', 'scene_q7_nyongo',
        'ending_great', 'ending_narrow', 'ending_caught'
    ];
    var store = {};

    manifest.forEach(function (key) {
        var img = new Image();
        var entry = { img: img, ready: false, failed: false };
        img.onload = function () { entry.ready = true; };
        img.onerror = function () { entry.failed = true; };
        img.src = 'assets/' + key + '.png';
        store[key] = entry;
    });

    return {
        // Draws the override image into x,y,w,h if it loaded; returns true if drawn.
        draw: function (ctx, key, x, y, w, h) {
            var entry = store[key];
            if (entry && entry.ready) {
                ctx.drawImage(entry.img, x, y, w, h);
                return true;
            }
            return false;
        }
    };
})();
