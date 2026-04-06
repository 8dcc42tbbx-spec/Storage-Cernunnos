// Postie Run - Image-Based Sprite System (v10)
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
    // Each row's sprites are non-overlapping: px[n]+pw[n] < px[n+1]
    _buildPlayerAtlas: function(w, h) {
        var d = this._defPct.bind(this);
        // Row 1: Idle (2 sprites, each in ~50% of width)
        d('player_idle_0', 'player', 0.01, 0.00, 0.21, 0.15, 16, 24, w, h);
        d('player_idle_1', 'player', 0.30, 0.00, 0.21, 0.15, 16, 24, w, h);
        // Row 2: Run (4 sprites, each in ~25% of width)
        d('player_run_0',  'player', 0.01, 0.17, 0.18, 0.14, 16, 24, w, h);
        d('player_run_1',  'player', 0.25, 0.17, 0.18, 0.14, 16, 24, w, h);
        d('player_run_2',  'player', 0.49, 0.17, 0.18, 0.14, 16, 24, w, h);
        d('player_run_3',  'player', 0.73, 0.17, 0.18, 0.14, 16, 24, w, h);
        // Row 3: Jump, Fall (2 sprites)
        d('player_jump',   'player', 0.00, 0.33, 0.24, 0.15, 16, 24, w, h);
        d('player_fall',   'player', 0.32, 0.33, 0.24, 0.15, 16, 24, w, h);
        // Row 4: Shoot, Crouch (2 sprites)
        d('player_shoot',  'player', 0.00, 0.50, 0.28, 0.15, 20, 24, w, h);
        d('player_crouch', 'player', 0.35, 0.50, 0.28, 0.15, 20, 24, w, h);
        // Row 5: Hurt
        d('player_hurt',   'player', 0.00, 0.67, 0.24, 0.14, 16, 24, w, h);
        // Row 6: Die (2 sprites)
        d('player_die_0',  'player', 0.00, 0.82, 0.22, 0.15, 16, 24, w, h);
        d('player_die_1',  'player', 0.28, 0.84, 0.35, 0.14, 26, 16, w, h);
    },

    // EDV (3712 x 1152)
    _buildEdvAtlas: function(w, h) {
        var d = this._defPct.bind(this);
        d('edv',        'edv', 0.00, 0.02, 0.48, 0.96, 32, 20, w, h);
        d('edv_manned', 'edv', 0.50, 0.02, 0.48, 0.96, 32, 20, w, h);
    },

    // ENEMIES (2816 x 1536)
    // Non-overlapping source rects: px[n]+pw[n] < px[n+1] for adjacent frames
    _buildEnemiesAtlas: function(w, h) {
        var d = this._defPct.bind(this);
        // Row 1: Dogs, Magpies, Van
        d('dog_0',     'enemies', 0.000, 0.00, 0.075, 0.15, 16, 14, w, h);
        d('dog_1',     'enemies', 0.085, 0.00, 0.075, 0.15, 16, 14, w, h);
        d('magpie_0',  'enemies', 0.21, 0.00, 0.065, 0.12, 16, 14, w, h);
        d('magpie_1',  'enemies', 0.29, 0.00, 0.065, 0.12, 16, 14, w, h);
        d('magpie_swoop', 'enemies', 0.37, 0.00, 0.08, 0.14, 18, 18, w, h);
        d('seagull_0', 'enemies', 0.21, 0.00, 0.065, 0.12, 16, 14, w, h);
        d('seagull_1', 'enemies', 0.29, 0.00, 0.065, 0.12, 16, 14, w, h);
        d('van',       'enemies', 0.56, 0.00, 0.43, 0.35, 48, 28, w, h);

        // Row 2: Person, Bin, Mower, Emu, Drop Bear
        d('person_0',  'enemies', 0.000, 0.20, 0.08, 0.22, 16, 24, w, h);
        d('person_1',  'enemies', 0.09,  0.20, 0.08, 0.22, 16, 24, w, h);
        d('bin',       'enemies', 0.21, 0.22, 0.06, 0.16, 12, 16, w, h);
        d('mower',     'enemies', 0.29, 0.21, 0.13, 0.16, 22, 16, w, h);
        d('emu_0',     'enemies', 0.48, 0.15, 0.12, 0.30, 22, 26, w, h);
        d('emu_1',     'enemies', 0.62, 0.15, 0.12, 0.30, 22, 26, w, h);
        d('dropbear',  'enemies', 0.80, 0.19, 0.11, 0.18, 16, 16, w, h);

        // Row 3: Cat, Road Train, Rottweiler, Chihuahua
        d('cat_0',     'enemies', 0.000, 0.47, 0.07, 0.14, 14, 14, w, h);
        d('cat_1',     'enemies', 0.08,  0.47, 0.08, 0.14, 16, 14, w, h);
        d('roadtrain', 'enemies', 0.00, 0.63, 0.50, 0.20, 64, 24, w, h);
        d('rottweiler_0', 'enemies', 0.32, 0.56, 0.20, 0.38, 48, 40, w, h);
        d('rottweiler_1', 'enemies', 0.55, 0.56, 0.20, 0.38, 48, 40, w, h);
        d('chihuahua_0', 'enemies', 0.80, 0.80, 0.08, 0.14, 12, 10, w, h);
        d('chihuahua_1', 'enemies', 0.90, 0.80, 0.08, 0.14, 12, 10, w, h);
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
    // 4-column x 2-row grid. Col 0 = ground tiles, Cols 1-3 = theme panels.
    // Each cell is 0.25 wide x 0.50 tall (704 x 768 px).
    // Each panel has two strips separated by a gap:
    //   Top strip: Far parallax (sky + distant scenery) - background layer
    //   Bottom strip: Near parallax (houses/buildings) - midground layer
    // The tilemap provides the foreground layer (ground tiles on top).
    _buildBackgroundsAtlas: function(w, h) {
        var d = this._defPct.bind(this);

        // Panel positions in the 4x2 grid (skipping col 0 ground tiles)
        var panels = [
            { theme: 0, px: 0.250, py: 0.000 }, // Suburban (col 1, row 0)
            { theme: 1, px: 0.500, py: 0.000 }, // Urban (col 2, row 0)
            { theme: 2, px: 0.750, py: 0.000 }, // Regional (col 3, row 0)
            { theme: 3, px: 0.500, py: 0.500 }, // Coastal (col 2, row 1)
            { theme: 4, px: 0.750, py: 0.500 }  // Outback (col 3, row 1)
        ];

        for (var i = 0; i < panels.length; i++) {
            var p = panels[i];
            var t = p.theme;

            // Far parallax - sky + distant scenery (top strip of panel cell)
            // Positioned behind everything, scrolls at 0.2x camera speed
            d('parallax_far_' + t, 'backgrounds',
                p.px + 0.005, p.py + 0.015, 0.24, 0.19, 200, 120, w, h);

            // Near parallax - houses/buildings (bottom strip of panel cell)
            // Sits above ground, scrolls at 0.5x camera speed
            d('parallax_near_' + t, 'backgrounds',
                p.px + 0.005, p.py + 0.27, 0.24, 0.21, 200, 80, w, h);
        }

        // Ground cross-section tiles (col 0, used by tilemap renderer)
        d('ground_tile_grass', 'backgrounds', 0.01, 0.02, 0.08, 0.15, 16, 16, w, h);
        d('ground_tile_sand',  'backgrounds', 0.01, 0.52, 0.08, 0.15, 16, 16, w, h);
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
