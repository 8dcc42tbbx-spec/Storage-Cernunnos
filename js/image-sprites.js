// Postie Run - Image-Based Sprite System (v9)
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
    // Generous source rects to avoid clipping sprites
    _buildPlayerAtlas: function(w, h) {
        var d = this._defPct.bind(this);
        d('player_idle_0', 'player', 0.00, 0.00, 0.27, 0.17, 16, 24, w, h);
        d('player_idle_1', 'player', 0.26, 0.00, 0.30, 0.17, 16, 24, w, h);
        d('player_run_0',  'player', 0.00, 0.17, 0.23, 0.16, 16, 24, w, h);
        d('player_run_1',  'player', 0.22, 0.17, 0.23, 0.16, 16, 24, w, h);
        d('player_run_2',  'player', 0.44, 0.17, 0.23, 0.16, 16, 24, w, h);
        d('player_run_3',  'player', 0.67, 0.17, 0.23, 0.16, 16, 24, w, h);
        d('player_jump',   'player', 0.00, 0.33, 0.28, 0.16, 16, 24, w, h);
        d('player_fall',   'player', 0.28, 0.33, 0.28, 0.16, 16, 24, w, h);
        d('player_shoot',  'player', 0.00, 0.50, 0.32, 0.16, 20, 24, w, h);
        d('player_crouch', 'player', 0.32, 0.50, 0.32, 0.16, 20, 24, w, h);
        d('player_hurt',   'player', 0.00, 0.67, 0.28, 0.15, 16, 24, w, h);
        d('player_die_0',  'player', 0.00, 0.82, 0.25, 0.16, 16, 24, w, h);
        d('player_die_1',  'player', 0.24, 0.84, 0.40, 0.15, 26, 16, w, h);
    },

    // EDV (3712 x 1152)
    _buildEdvAtlas: function(w, h) {
        var d = this._defPct.bind(this);
        d('edv',        'edv', 0.00, 0.02, 0.48, 0.96, 32, 20, w, h);
        d('edv_manned', 'edv', 0.50, 0.02, 0.48, 0.96, 32, 20, w, h);
    },

    // ENEMIES (2816 x 1536)
    // Generous source rects to capture full sprites including legs/tails
    _buildEnemiesAtlas: function(w, h) {
        var d = this._defPct.bind(this);
        // Row 1: Dogs, Magpies, Van
        d('dog_0',     'enemies', 0.00, 0.00, 0.11, 0.17, 16, 14, w, h);
        d('dog_1',     'enemies', 0.10, 0.00, 0.11, 0.17, 16, 14, w, h);
        d('magpie_0',  'enemies', 0.21, 0.00, 0.08, 0.13, 16, 14, w, h);
        d('magpie_1',  'enemies', 0.29, 0.00, 0.08, 0.13, 16, 14, w, h);
        d('magpie_swoop', 'enemies', 0.37, 0.00, 0.10, 0.15, 18, 18, w, h);
        d('seagull_0', 'enemies', 0.21, 0.00, 0.08, 0.13, 16, 14, w, h);
        d('seagull_1', 'enemies', 0.29, 0.00, 0.08, 0.13, 16, 14, w, h);
        d('van',       'enemies', 0.56, 0.00, 0.43, 0.37, 48, 28, w, h);

        // Row 2: Person, Bin, Mower, Emu, Drop Bear
        d('person_0',  'enemies', 0.00, 0.20, 0.10, 0.24, 16, 24, w, h);
        d('person_1',  'enemies', 0.10, 0.20, 0.10, 0.24, 16, 24, w, h);
        d('bin',       'enemies', 0.21, 0.22, 0.07, 0.18, 12, 16, w, h);
        d('mower',     'enemies', 0.29, 0.21, 0.15, 0.18, 22, 16, w, h);
        d('emu_0',     'enemies', 0.48, 0.15, 0.15, 0.32, 22, 26, w, h);
        d('emu_1',     'enemies', 0.62, 0.15, 0.15, 0.32, 22, 26, w, h);
        d('dropbear',  'enemies', 0.80, 0.19, 0.13, 0.20, 16, 16, w, h);

        // Row 3: Cat, Road Train, Rottweiler, Chihuahua
        d('cat_0',     'enemies', 0.00, 0.47, 0.09, 0.16, 14, 14, w, h);
        d('cat_1',     'enemies', 0.09, 0.47, 0.11, 0.16, 16, 14, w, h);
        d('roadtrain', 'enemies', 0.00, 0.63, 0.52, 0.22, 64, 24, w, h);
        d('rottweiler_0', 'enemies', 0.32, 0.56, 0.24, 0.40, 48, 40, w, h);
        d('rottweiler_1', 'enemies', 0.55, 0.56, 0.24, 0.40, 48, 40, w, h);
        d('chihuahua_0', 'enemies', 0.80, 0.80, 0.10, 0.16, 12, 10, w, h);
        d('chihuahua_1', 'enemies', 0.90, 0.80, 0.10, 0.16, 12, 10, w, h);
    },

    // PROJECTILES & PICKUPS (2816 x 1536)
    _buildProjectilesAtlas: function(w, h) {
        var d = this._defPct.bind(this);
        d('proj_parcel',  'projectiles', 0.01, 0.01, 0.10, 0.15, 8, 6, w, h);
        d('proj_cannon',  'projectiles', 0.13, 0.01, 0.10, 0.15, 6, 5, w, h);
        d('proj_letter',  'projectiles', 0.26, 0.02, 0.07, 0.10, 5, 3, w, h);
        d('proj_stamp_0', 'projectiles', 0.00, 0.26, 0.11, 0.20, 10, 10, w, h);
        d('proj_stamp_1', 'projectiles', 0.12, 0.26, 0.11, 0.20, 10, 10, w, h);
        d('proj_stamp_2', 'projectiles', 0.24, 0.26, 0.11, 0.20, 10, 10, w, h);
        d('proj_stamp_3', 'projectiles', 0.36, 0.26, 0.11, 0.20, 10, 10, w, h);
        d('stamp_mark',   'projectiles', 0.49, 0.27, 0.17, 0.17, 14, 8, w, h);
        d('proj_card',    'projectiles', 0.73, 0.28, 0.11, 0.16, 8, 6, w, h);
        d('pickup_cannon', 'projectiles', 0.00, 0.63, 0.15, 0.32, 12, 12, w, h);
        d('pickup_spray',  'projectiles', 0.16, 0.63, 0.15, 0.32, 12, 12, w, h);
        d('pickup_stamp',  'projectiles', 0.32, 0.63, 0.15, 0.32, 12, 12, w, h);
        d('pickup_health', 'projectiles', 0.49, 0.63, 0.15, 0.32, 12, 12, w, h);
        d('pickup_edv',    'projectiles', 0.66, 0.63, 0.16, 0.32, 14, 12, w, h);
    },

    // BACKGROUNDS (2816 x 1536)
    // 2x3 grid of panels. Each panel has two strips separated by dashed line:
    //   Top: Far parallax (sky + distant scenery)
    //   Bottom: Near parallax (detailed houses/buildings with ground)
    //
    // Far parallax fills the sky area behind everything.
    // Near parallax sits just above ground, providing midground detail.
    // Game ground tiles are drawn ON TOP, covering any overlap at the bottom.
    _buildBackgroundsAtlas: function(w, h) {
        var d = this._defPct.bind(this);

        var panels = [
            { theme: 0, px: 0.000, py: 0.000 }, // Suburban
            { theme: 1, px: 0.333, py: 0.000 }, // Urban
            { theme: 2, px: 0.667, py: 0.000 }, // Regional
            { theme: 3, px: 0.333, py: 0.500 }, // Coastal
            { theme: 4, px: 0.667, py: 0.500 }  // Outback
        ];

        for (var i = 0; i < panels.length; i++) {
            var p = panels[i];
            var t = p.theme;

            // Far parallax - sky + distant scenery (top ~42% of panel)
            // Wide strip for seamless horizontal tiling
            d('parallax_far_' + t, 'backgrounds',
                p.px + 0.04, p.py + 0.01, 0.29, 0.20, 160, 60, w, h);

            // Near parallax - houses/buildings (bottom ~48% of panel)
            // Includes ground/grass that aligns with game ground tiles
            d('parallax_near_' + t, 'backgrounds',
                p.px + 0.003, p.py + 0.26, 0.33, 0.22, 160, 52, w, h);
        }
    },

    // UI (2816 x 1536)
    _buildUiAtlas: function(w, h) {
        var d = this._defPct.bind(this);
        d('title_logo',     'ui', 0.12, 0.00, 0.76, 0.28, 190, 55, w, h);
        d('delivery_house', 'ui', 0.02, 0.34, 0.30, 0.55, 32, 32, w, h);
        d('delivery_locker','ui', 0.36, 0.34, 0.22, 0.55, 24, 32, w, h);
        d('hud_hat',        'ui', 0.67, 0.42, 0.08, 0.12, 8, 6, w, h);
        d('hud_heart',      'ui', 0.75, 0.42, 0.08, 0.12, 8, 8, w, h);
        d('hud_arrow',      'ui', 0.83, 0.42, 0.08, 0.12, 8, 8, w, h);
    },

    // EFFECTS (2816 x 1536)
    _buildEffectsAtlas: function(w, h) {
        var d = this._defPct.bind(this);
        d('explosion_0', 'effects', 0.00, 0.00, 0.07, 0.14, 8, 8, w, h);
        d('explosion_1', 'effects', 0.08, 0.00, 0.13, 0.20, 14, 14, w, h);
        d('explosion_2', 'effects', 0.22, 0.00, 0.16, 0.23, 20, 20, w, h);
        d('explosion_3', 'effects', 0.38, 0.00, 0.20, 0.27, 26, 26, w, h);
        d('smoke',       'effects', 0.58, 0.00, 0.18, 0.24, 20, 20, w, h);
        d('dust_0',      'effects', 0.00, 0.30, 0.11, 0.16, 8, 8, w, h);
        d('dust_1',      'effects', 0.13, 0.30, 0.11, 0.16, 8, 8, w, h);
        d('dust_2',      'effects', 0.26, 0.30, 0.11, 0.16, 8, 8, w, h);
        d('water_0',     'effects', 0.00, 0.53, 0.13, 0.18, 8, 8, w, h);
        d('water_1',     'effects', 0.15, 0.53, 0.13, 0.18, 8, 8, w, h);
        d('water_2',     'effects', 0.29, 0.53, 0.13, 0.18, 8, 8, w, h);
        d('water_drop',  'effects', 0.00, 0.50, 0.05, 0.07, 3, 3, w, h);
        d('muzzle_0',    'effects', 0.00, 0.76, 0.09, 0.12, 6, 6, w, h);
        d('muzzle_1',    'effects', 0.11, 0.76, 0.11, 0.14, 8, 8, w, h);
    }
};
