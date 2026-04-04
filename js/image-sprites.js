// Postie Run - Image-Based Sprite Loading System (v4)
// Loads PNG sprite sheets from assets/ and scales them to game resolution.
// Includes checkerboard transparency cleanup for AI-generated images.
// Falls back silently to PR.SpriteCache if images fail to load.

PR.ImageSprites = {
    loaded: false,
    loading: false,
    progress: 0,
    totalSheets: 7,
    loadedSheets: 0,
    failedSheets: 0,
    sheets: {},
    atlas: {},
    enabled: true,
    _patched: false,

    sheetDefs: {
        player:       'assets/player.png',
        edv:          'assets/edv.png',
        enemies:      'assets/enemies.png',
        projectiles:  'assets/projectiles.png',
        backgrounds:  'assets/backgrounds.png',
        ui:           'assets/ui.png',
        effects:      'assets/effects.png'
    },

    init: function() {
        if (this.loading || this.loaded) return;
        this.loading = true;
        this.loadedSheets = 0;
        this.failedSheets = 0;

        this._patchSpriteCache();

        var self = this;
        var names = Object.keys(this.sheetDefs);
        this.totalSheets = names.length;

        for (var i = 0; i < names.length; i++) {
            (function(name) {
                var img = new Image();
                img.onload = function() {
                    // Clean checkerboard artifacts from AI-generated PNGs
                    var cleaned = self._cleanCheckerboard(img);
                    self.sheets[name] = cleaned;
                    self.loadedSheets++;
                    self._buildAtlasForSheet(name, img.width, img.height);
                    self._checkComplete();
                };
                img.onerror = function() {
                    self.failedSheets++;
                    self._checkComplete();
                };
                img.src = self.sheetDefs[name];
            })(names[i]);
        }
    },

    // Remove checkerboard pattern that AI image generators bake into PNGs
    // Detects alternating grey/white pixels and makes them transparent
    _cleanCheckerboard: function(img) {
        var c = document.createElement('canvas');
        c.width = img.width;
        c.height = img.height;
        var ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);

        var id = ctx.getImageData(0, 0, c.width, c.height);
        var d = id.data;
        var w = c.width;
        var h = c.height;

        for (var y = 1; y < h - 1; y++) {
            for (var x = 1; x < w - 1; x++) {
                var i = (y * w + x) * 4;
                if (d[i + 3] < 10) continue; // already transparent

                var r = d[i], g = d[i + 1], b = d[i + 2];
                // Must be near-greyscale
                if (Math.abs(r - g) > 12 || Math.abs(g - b) > 12) continue;

                var avg = (r + g + b) / 3;
                var isGrey = (avg >= 185 && avg <= 225);
                var isWhite = (avg >= 242);
                if (!isGrey && !isWhite) continue;

                // Check cardinal neighbors for alternating checker pattern
                var alts = 0;
                var ox = [0, 0, -1, 1];
                var oy = [-1, 1, 0, 0];
                for (var n = 0; n < 4; n++) {
                    var ni = ((y + oy[n]) * w + (x + ox[n])) * 4;
                    if (d[ni + 3] < 10) continue;
                    var nr = d[ni], ng = d[ni + 1], nb = d[ni + 2];
                    if (Math.abs(nr - ng) > 12 || Math.abs(ng - nb) > 12) continue;
                    var navg = (nr + ng + nb) / 3;
                    // Neighbor should be the "other" checker color
                    if (isGrey && navg >= 242) alts++;
                    else if (isWhite && navg >= 185 && navg <= 225) alts++;
                }

                // If 2+ neighbors alternate, this is a checker pixel
                if (alts >= 2) {
                    d[i + 3] = 0;
                }
            }
        }

        ctx.putImageData(id, 0, 0);
        return c; // canvas works as drawImage source
    },

    _checkComplete: function() {
        var resolved = this.loadedSheets + this.failedSheets;
        this.progress = resolved / this.totalSheets;
        if (resolved >= this.totalSheets) {
            this.loading = false;
            this.loaded = true;
        }
    },

    draw: function(ctx, key, x, y, flipX) {
        if (!this.enabled) return false;
        var e = this.atlas[key];
        if (!e) return false;
        var img = this.sheets[e.sheet];
        if (!img) return false;

        x = Math.round(x);
        y = Math.round(y);

        if (flipX) {
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(img, e.sx, e.sy, e.sw, e.sh, -x - e.dw, y, e.dw, e.dh);
            ctx.restore();
        } else {
            ctx.drawImage(img, e.sx, e.sy, e.sw, e.sh, x, y, e.dw, e.dh);
        }
        return true;
    },

    _patchSpriteCache: function() {
        if (this._patched) return;
        this._patched = true;
        var originalDraw = PR.SpriteCache.draw.bind(PR.SpriteCache);
        var imgSprites = this;
        PR.SpriteCache.draw = function(ctx, key, x, y, flipX) {
            if (imgSprites.draw(ctx, key, x, y, flipX)) return;
            originalDraw(ctx, key, x, y, flipX);
        };
    },

    _def: function(key, sheet, sx, sy, sw, sh, dw, dh) {
        this.atlas[key] = { sheet: sheet, sx: sx, sy: sy, sw: sw, sh: sh, dw: dw, dh: dh };
    },

    _defPct: function(key, sheet, px, py, pw, ph, dw, dh, imgW, imgH) {
        this.atlas[key] = {
            sheet: sheet,
            sx: Math.round(px * imgW),
            sy: Math.round(py * imgH),
            sw: Math.round(pw * imgW),
            sh: Math.round(ph * imgH),
            dw: dw, dh: dh
        };
    },

    _buildAtlasForSheet: function(sheetName, imgW, imgH) {
        switch (sheetName) {
            case 'player': this._buildPlayerAtlas(imgW, imgH); break;
            case 'edv': this._buildEdvAtlas(imgW, imgH); break;
            case 'enemies': this._buildEnemiesAtlas(imgW, imgH); break;
            case 'projectiles': this._buildProjectilesAtlas(imgW, imgH); break;
            case 'backgrounds': this._buildBackgroundsAtlas(imgW, imgH); break;
            case 'ui': this._buildUiAtlas(imgW, imgH); break;
            case 'effects': this._buildEffectsAtlas(imgW, imgH); break;
        }
    },

    // PLAYER (1696 x 2528)
    _buildPlayerAtlas: function(w, h) {
        var d = this._defPct.bind(this);
        d('player_idle_0', 'player', 0.01, 0.00, 0.26, 0.16, 16, 24, w, h);
        d('player_idle_1', 'player', 0.28, 0.00, 0.28, 0.16, 16, 24, w, h);
        d('player_run_0', 'player', 0.00, 0.17, 0.23, 0.16, 16, 24, w, h);
        d('player_run_1', 'player', 0.23, 0.17, 0.23, 0.16, 16, 24, w, h);
        d('player_run_2', 'player', 0.47, 0.17, 0.23, 0.16, 16, 24, w, h);
        d('player_run_3', 'player', 0.70, 0.17, 0.23, 0.16, 16, 24, w, h);
        d('player_jump', 'player', 0.00, 0.34, 0.27, 0.15, 16, 24, w, h);
        d('player_fall', 'player', 0.30, 0.34, 0.27, 0.15, 16, 24, w, h);
        d('player_shoot', 'player', 0.00, 0.52, 0.30, 0.16, 18, 24, w, h);
        d('player_crouch', 'player', 0.34, 0.52, 0.34, 0.16, 18, 24, w, h);
        d('player_hurt', 'player', 0.00, 0.70, 0.26, 0.13, 16, 24, w, h);
        d('player_die_0', 'player', 0.00, 0.84, 0.22, 0.15, 16, 24, w, h);
        d('player_die_1', 'player', 0.24, 0.84, 0.32, 0.15, 20, 16, w, h);
        d('player_die_2', 'player', 0.54, 0.86, 0.40, 0.14, 24, 12, w, h);
    },

    // eDV (3712 x 1152)
    _buildEdvAtlas: function(w, h) {
        var d = this._defPct.bind(this);
        d('edv', 'edv', 0.01, 0.04, 0.46, 0.92, 32, 20, w, h);
        d('edv_manned', 'edv', 0.51, 0.04, 0.46, 0.92, 32, 20, w, h);
    },

    // ENEMIES (2816 x 1536)
    _buildEnemiesAtlas: function(w, h) {
        var d = this._defPct.bind(this);
        d('dog_0', 'enemies', 0.00, 0.03, 0.09, 0.12, 16, 12, w, h);
        d('dog_1', 'enemies', 0.10, 0.03, 0.09, 0.12, 16, 12, w, h);
        d('magpie_0', 'enemies', 0.22, 0.02, 0.065, 0.10, 16, 12, w, h);
        d('magpie_1', 'enemies', 0.29, 0.02, 0.065, 0.10, 16, 12, w, h);
        d('magpie_swoop', 'enemies', 0.37, 0.01, 0.08, 0.12, 16, 16, w, h);
        d('seagull_0', 'enemies', 0.22, 0.02, 0.065, 0.10, 16, 12, w, h);
        d('seagull_1', 'enemies', 0.29, 0.02, 0.065, 0.10, 16, 12, w, h);
        d('van', 'enemies', 0.60, 0.01, 0.38, 0.32, 48, 28, w, h);
        d('person_0', 'enemies', 0.00, 0.23, 0.09, 0.20, 16, 24, w, h);
        d('person_1', 'enemies', 0.10, 0.23, 0.09, 0.20, 16, 24, w, h);
        d('bin', 'enemies', 0.225, 0.24, 0.06, 0.15, 12, 16, w, h);
        d('mower', 'enemies', 0.31, 0.22, 0.14, 0.16, 20, 14, w, h);
        d('emu_0', 'enemies', 0.545, 0.20, 0.12, 0.24, 20, 24, w, h);
        d('emu_1', 'enemies', 0.675, 0.20, 0.12, 0.24, 20, 24, w, h);
        d('dropbear', 'enemies', 0.84, 0.22, 0.10, 0.16, 14, 14, w, h);
        d('cat_0', 'enemies', 0.00, 0.50, 0.08, 0.14, 12, 14, w, h);
        d('cat_1', 'enemies', 0.10, 0.50, 0.10, 0.14, 14, 14, w, h);
        d('roadtrain', 'enemies', 0.00, 0.64, 0.48, 0.18, 64, 24, w, h);
        d('rottweiler_0', 'enemies', 0.34, 0.60, 0.22, 0.34, 48, 40, w, h);
        d('rottweiler_1', 'enemies', 0.57, 0.60, 0.22, 0.34, 48, 40, w, h);
        d('chihuahua_0', 'enemies', 0.82, 0.82, 0.08, 0.14, 10, 8, w, h);
        d('chihuahua_1', 'enemies', 0.91, 0.82, 0.08, 0.14, 10, 8, w, h);
    },

    // PROJECTILES & PICKUPS (2816 x 1536)
    _buildProjectilesAtlas: function(w, h) {
        var d = this._defPct.bind(this);
        d('proj_parcel', 'projectiles', 0.02, 0.03, 0.07, 0.12, 8, 6, w, h);
        d('proj_cannon', 'projectiles', 0.13, 0.03, 0.09, 0.12, 6, 5, w, h);
        d('proj_letter', 'projectiles', 0.27, 0.04, 0.06, 0.08, 5, 3, w, h);
        d('proj_stamp_0', 'projectiles', 0.01, 0.30, 0.10, 0.18, 10, 10, w, h);
        d('proj_stamp_1', 'projectiles', 0.13, 0.30, 0.10, 0.18, 10, 10, w, h);
        d('proj_stamp_2', 'projectiles', 0.25, 0.30, 0.10, 0.18, 10, 10, w, h);
        d('proj_stamp_3', 'projectiles', 0.37, 0.30, 0.10, 0.18, 10, 10, w, h);
        d('stamp_mark', 'projectiles', 0.50, 0.30, 0.15, 0.14, 14, 8, w, h);
        d('proj_card', 'projectiles', 0.74, 0.32, 0.10, 0.12, 8, 6, w, h);
        d('pickup_cannon', 'projectiles', 0.01, 0.66, 0.13, 0.28, 12, 12, w, h);
        d('pickup_spray', 'projectiles', 0.17, 0.66, 0.13, 0.28, 12, 12, w, h);
        d('pickup_stamp', 'projectiles', 0.33, 0.66, 0.13, 0.28, 12, 12, w, h);
        d('pickup_health', 'projectiles', 0.50, 0.66, 0.13, 0.28, 12, 12, w, h);
        d('pickup_edv', 'projectiles', 0.67, 0.66, 0.14, 0.28, 14, 12, w, h);
    },

    // BACKGROUNDS (2816 x 1536) - 6 panels in 2x3 grid
    // Top row: Suburban, Urban, Regional
    // Bottom row: Regional-alt, Coastal, Outback
    // Each panel has: ground tile, far parallax strip, near parallax strip
    _buildBackgroundsAtlas: function(w, h) {
        var d = this._defPct.bind(this);

        // Panel positions (column, row) -> (px_offset, py_offset)
        // Each panel: ~0.333 wide, 0.5 tall
        var panels = [
            { theme: 0, px: 0.000, py: 0.000 }, // Suburban top-left
            { theme: 1, px: 0.333, py: 0.000 }, // Urban top-center
            { theme: 2, px: 0.667, py: 0.000 }, // Regional top-right
            { theme: 3, px: 0.333, py: 0.500 }, // Coastal bottom-center
            { theme: 4, px: 0.667, py: 0.500 }  // Outback bottom-right
        ];

        for (var i = 0; i < panels.length; i++) {
            var p = panels[i];
            var t = p.theme;

            // Ground tile - small square in top-left of each panel
            d('ground_' + t, 'backgrounds', p.px + 0.005, p.py + 0.06, 0.035, 0.06, 16, 16, w, h);
            d('dirt_' + t, 'backgrounds', p.px + 0.005, p.py + 0.10, 0.035, 0.06, 16, 16, w, h);
            d('platform_' + t, 'backgrounds', p.px + 0.005, p.py + 0.06, 0.035, 0.03, 16, 8, w, h);

            // Far parallax strip - wide scene in upper area of panel
            // Approx 256x64 game pixels, repeating
            d('parallax_far_' + t, 'backgrounds',
                p.px + 0.055, p.py + 0.055, 0.265, 0.10, 180, 40, w, h);

            // Near parallax strip - wide scene in lower area of panel
            // Approx 256x96 game pixels, repeating
            d('parallax_near_' + t, 'backgrounds',
                p.px + 0.005, p.py + 0.28, 0.32, 0.16, 200, 60, w, h);
        }
    },

    // UI (2816 x 1536) - Title logo, delivery targets, HUD icons
    _buildUiAtlas: function(w, h) {
        var d = this._defPct.bind(this);

        // POSTIE RUN title logo - top center, big
        d('title_logo', 'ui', 0.18, 0.01, 0.64, 0.22, 160, 40, w, h);

        // Delivery House - bottom-left
        d('delivery_house', 'ui', 0.04, 0.38, 0.28, 0.50, 32, 32, w, h);
        // Parcel Locker - bottom-center
        d('delivery_locker', 'ui', 0.38, 0.38, 0.18, 0.50, 24, 32, w, h);
    },

    // EFFECTS (2816 x 1536)
    _buildEffectsAtlas: function(w, h) {
        var d = this._defPct.bind(this);
        d('explosion_0', 'effects', 0.00, 0.02, 0.06, 0.13, 8, 8, w, h);
        d('explosion_1', 'effects', 0.08, 0.00, 0.12, 0.18, 14, 14, w, h);
        d('explosion_2', 'effects', 0.22, 0.00, 0.14, 0.20, 20, 20, w, h);
        d('explosion_3', 'effects', 0.38, 0.00, 0.18, 0.24, 26, 26, w, h);
        d('smoke', 'effects', 0.58, 0.00, 0.16, 0.22, 20, 20, w, h);
        d('water_drop', 'effects', 0.00, 0.52, 0.04, 0.06, 3, 3, w, h);
    }
};
