// Postie Run - Image-Based Sprite System (v8)
// Loads Gemini PNG sprite sheets with transparent backgrounds
// and maps regions to game sprite keys via monkey-patching PR.SpriteCache.draw.

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
                    self.sheets[name] = img;
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
        var originalDraw = PR.SpriteCache.draw;
        var imgSprites = this;
        PR.SpriteCache.draw = function(ctx, key, x, y, flipX) {
            if (imgSprites.draw(ctx, key, x, y, flipX)) return;
            originalDraw.call(PR.SpriteCache, ctx, key, x, y, flipX);
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
        d('player_idle_0', 'player', 0.01, 0.00, 0.24, 0.16, 16, 24, w, h);
        d('player_idle_1', 'player', 0.28, 0.00, 0.24, 0.16, 16, 24, w, h);
        d('player_run_0',  'player', 0.00, 0.17, 0.21, 0.15, 16, 24, w, h);
        d('player_run_1',  'player', 0.23, 0.17, 0.21, 0.15, 16, 24, w, h);
        d('player_run_2',  'player', 0.46, 0.17, 0.21, 0.15, 16, 24, w, h);
        d('player_run_3',  'player', 0.69, 0.17, 0.21, 0.15, 16, 24, w, h);
        d('player_jump',   'player', 0.01, 0.34, 0.25, 0.14, 16, 24, w, h);
        d('player_fall',   'player', 0.30, 0.34, 0.25, 0.14, 16, 24, w, h);
        d('player_shoot',  'player', 0.01, 0.51, 0.28, 0.15, 18, 24, w, h);
        d('player_crouch', 'player', 0.35, 0.51, 0.28, 0.15, 18, 24, w, h);
        d('player_hurt',   'player', 0.01, 0.69, 0.24, 0.13, 16, 24, w, h);
        d('player_die_0',  'player', 0.01, 0.84, 0.22, 0.14, 16, 24, w, h);
        d('player_die_1',  'player', 0.26, 0.86, 0.35, 0.13, 24, 16, w, h);
    },

    // EDV (3712 x 1152)
    _buildEdvAtlas: function(w, h) {
        var d = this._defPct.bind(this);
        d('edv',        'edv', 0.01, 0.03, 0.46, 0.94, 32, 20, w, h);
        d('edv_manned', 'edv', 0.52, 0.03, 0.46, 0.94, 32, 20, w, h);
    },

    // ENEMIES (2816 x 1536)
    _buildEnemiesAtlas: function(w, h) {
        var d = this._defPct.bind(this);
        d('dog_0',     'enemies', 0.00, 0.02, 0.10, 0.14, 16, 12, w, h);
        d('dog_1',     'enemies', 0.11, 0.02, 0.10, 0.14, 16, 12, w, h);
        d('magpie_0',  'enemies', 0.22, 0.01, 0.07, 0.11, 16, 12, w, h);
        d('magpie_1',  'enemies', 0.30, 0.01, 0.07, 0.11, 16, 12, w, h);
        d('magpie_swoop', 'enemies', 0.38, 0.00, 0.08, 0.13, 16, 16, w, h);
        d('seagull_0', 'enemies', 0.22, 0.01, 0.07, 0.11, 16, 12, w, h);
        d('seagull_1', 'enemies', 0.30, 0.01, 0.07, 0.11, 16, 12, w, h);
        d('van',       'enemies', 0.58, 0.00, 0.40, 0.34, 48, 28, w, h);
        d('person_0',  'enemies', 0.00, 0.22, 0.09, 0.22, 16, 24, w, h);
        d('person_1',  'enemies', 0.10, 0.22, 0.09, 0.22, 16, 24, w, h);
        d('bin',       'enemies', 0.22, 0.23, 0.06, 0.16, 12, 16, w, h);
        d('mower',     'enemies', 0.30, 0.22, 0.14, 0.16, 20, 14, w, h);
        d('emu_0',     'enemies', 0.50, 0.17, 0.13, 0.28, 20, 24, w, h);
        d('emu_1',     'enemies', 0.64, 0.17, 0.13, 0.28, 20, 24, w, h);
        d('dropbear',  'enemies', 0.82, 0.21, 0.11, 0.18, 14, 14, w, h);
        d('cat_0',     'enemies', 0.00, 0.49, 0.08, 0.14, 12, 14, w, h);
        d('cat_1',     'enemies', 0.10, 0.49, 0.10, 0.14, 14, 14, w, h);
        d('roadtrain', 'enemies', 0.00, 0.64, 0.50, 0.20, 64, 24, w, h);
        d('rottweiler_0', 'enemies', 0.34, 0.58, 0.22, 0.38, 48, 40, w, h);
        d('rottweiler_1', 'enemies', 0.57, 0.58, 0.22, 0.38, 48, 40, w, h);
        d('chihuahua_0', 'enemies', 0.82, 0.82, 0.08, 0.14, 10, 8, w, h);
        d('chihuahua_1', 'enemies', 0.91, 0.82, 0.08, 0.14, 10, 8, w, h);
    },

    // PROJECTILES & PICKUPS (2816 x 1536)
    _buildProjectilesAtlas: function(w, h) {
        var d = this._defPct.bind(this);
        d('proj_parcel',  'projectiles', 0.02, 0.02, 0.09, 0.13, 8, 6, w, h);
        d('proj_cannon',  'projectiles', 0.14, 0.02, 0.09, 0.13, 6, 5, w, h);
        d('proj_letter',  'projectiles', 0.27, 0.03, 0.06, 0.09, 5, 3, w, h);
        d('proj_stamp_0', 'projectiles', 0.01, 0.28, 0.10, 0.18, 10, 10, w, h);
        d('proj_stamp_1', 'projectiles', 0.13, 0.28, 0.10, 0.18, 10, 10, w, h);
        d('proj_stamp_2', 'projectiles', 0.25, 0.28, 0.10, 0.18, 10, 10, w, h);
        d('proj_stamp_3', 'projectiles', 0.37, 0.28, 0.10, 0.18, 10, 10, w, h);
        d('stamp_mark',   'projectiles', 0.50, 0.29, 0.16, 0.15, 14, 8, w, h);
        d('proj_card',    'projectiles', 0.74, 0.30, 0.10, 0.14, 8, 6, w, h);
        d('pickup_cannon', 'projectiles', 0.01, 0.65, 0.14, 0.30, 12, 12, w, h);
        d('pickup_spray',  'projectiles', 0.17, 0.65, 0.14, 0.30, 12, 12, w, h);
        d('pickup_stamp',  'projectiles', 0.33, 0.65, 0.14, 0.30, 12, 12, w, h);
        d('pickup_health', 'projectiles', 0.50, 0.65, 0.14, 0.30, 12, 12, w, h);
        d('pickup_edv',    'projectiles', 0.67, 0.65, 0.15, 0.30, 14, 12, w, h);
    },

    // BACKGROUNDS (2816 x 1536)
    // Clean 2x3 grid - no title bars or label text in new version.
    // Each panel: far parallax strip (top ~40%), near parallax strip (bottom ~50%)
    // Ground tiles use programmatic sprites (no atlas entries here).
    _buildBackgroundsAtlas: function(w, h) {
        var d = this._defPct.bind(this);

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

            // Far parallax strip - sky/cityscape panorama (top portion of panel)
            d('parallax_far_' + t, 'backgrounds',
                p.px + 0.04, p.py + 0.02, 0.28, 0.19, 200, 56, w, h);

            // Near parallax strip - houses/buildings panorama (bottom portion of panel)
            d('parallax_near_' + t, 'backgrounds',
                p.px + 0.005, p.py + 0.25, 0.325, 0.22, 240, 80, w, h);
        }
    },

    // UI (2816 x 1536)
    _buildUiAtlas: function(w, h) {
        var d = this._defPct.bind(this);
        d('title_logo',     'ui', 0.14, 0.00, 0.72, 0.25, 180, 50, w, h);
        d('delivery_house', 'ui', 0.04, 0.36, 0.28, 0.52, 32, 32, w, h);
        d('delivery_locker','ui', 0.38, 0.36, 0.20, 0.52, 24, 32, w, h);
        d('hud_hat',        'ui', 0.68, 0.44, 0.07, 0.10, 8, 6, w, h);
        d('hud_heart',      'ui', 0.76, 0.44, 0.07, 0.10, 8, 8, w, h);
        d('hud_arrow',      'ui', 0.84, 0.44, 0.07, 0.10, 8, 8, w, h);
    },

    // EFFECTS (2816 x 1536)
    _buildEffectsAtlas: function(w, h) {
        var d = this._defPct.bind(this);
        d('explosion_0', 'effects', 0.01, 0.01, 0.06, 0.12, 8, 8, w, h);
        d('explosion_1', 'effects', 0.09, 0.00, 0.12, 0.18, 14, 14, w, h);
        d('explosion_2', 'effects', 0.23, 0.00, 0.14, 0.21, 20, 20, w, h);
        d('explosion_3', 'effects', 0.39, 0.00, 0.18, 0.25, 26, 26, w, h);
        d('smoke',       'effects', 0.59, 0.00, 0.16, 0.22, 20, 20, w, h);
        d('dust_0',      'effects', 0.01, 0.32, 0.10, 0.14, 8, 8, w, h);
        d('dust_1',      'effects', 0.14, 0.32, 0.10, 0.14, 8, 8, w, h);
        d('dust_2',      'effects', 0.27, 0.32, 0.10, 0.14, 8, 8, w, h);
        d('water_0',     'effects', 0.01, 0.55, 0.12, 0.16, 8, 8, w, h);
        d('water_1',     'effects', 0.16, 0.55, 0.12, 0.16, 8, 8, w, h);
        d('water_2',     'effects', 0.30, 0.55, 0.12, 0.16, 8, 8, w, h);
        d('water_drop',  'effects', 0.01, 0.52, 0.04, 0.06, 3, 3, w, h);
        d('muzzle_0',    'effects', 0.01, 0.78, 0.08, 0.10, 6, 6, w, h);
        d('muzzle_1',    'effects', 0.12, 0.78, 0.10, 0.12, 6, 6, w, h);
    }
};
