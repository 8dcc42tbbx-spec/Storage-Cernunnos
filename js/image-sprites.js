// Postie Run - Image-Based Sprite Loading System (v2)
// Loads PNG sprite sheets from assets/ and scales them to game resolution.
// Falls back silently to PR.SpriteCache if images fail to load.
// Gemini images are high-res (~1024px) so we crop + scale to game size.

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
                    console.log('[ImageSprites] Loaded ' + name + ' (' + img.width + 'x' + img.height + ')');
                    // Build atlas AFTER image loads so we know dimensions
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
            console.log('[ImageSprites] Done: ' + this.loadedSheets + ' loaded, ' + this.failedSheets + ' fallback.');
        }
    },

    // Draw sprite from atlas, scaling from source rect to game-size dest rect
    // atlas entry: { sheet, sx, sy, sw, sh, dw, dh }
    draw: function(ctx, key, x, y, flipX) {
        if (!this.enabled) return false;
        var e = this.atlas[key];
        if (!e) return false;
        var img = this.sheets[e.sheet];
        if (!img) return false;

        x = Math.round(x);
        y = Math.round(y);
        var dw = e.dw;
        var dh = e.dh;

        if (flipX) {
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(img, e.sx, e.sy, e.sw, e.sh, -x - dw, y, dw, dh);
            ctx.restore();
        } else {
            ctx.drawImage(img, e.sx, e.sy, e.sw, e.sh, x, y, dw, dh);
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

    // Helper: define atlas entry with source rect and game-size dest
    _def: function(key, sheet, sx, sy, sw, sh, dw, dh) {
        this.atlas[key] = { sheet: sheet, sx: sx, sy: sy, sw: sw, sh: sh, dw: dw, dh: dh };
    },

    // Helper: define atlas entry using percentage-based coordinates
    // (px, py) = top-left as fraction of image size (0-1)
    // (pw, ph) = size as fraction of image size (0-1)
    // (dw, dh) = destination game-pixel size
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

    // Build atlas entries for a specific sheet once we know its dimensions
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

    // ================================================================
    // PLAYER - Ernie sprite sheet
    // Layout from Gemini: loose arrangement, roughly:
    //   Row 1: 2 idle frames (top ~20% of image)
    //   Row 2: 4 run frames (~20-40%)
    //   Row 3: 2 jump/crouch frames (~40-55%)
    //   Row 4: 2 shoot/throw frames (~55-70%)
    //   Row 5: 1 hurt frame (~70-85%)
    //   Row 6: 3 death frames (~85-100%)
    // Each frame is roughly 1/5 to 1/4 of image width
    // ================================================================
    _buildPlayerAtlas: function(w, h) {
        var d = this._defPct.bind(this);
        // Idle (2 frames, top row)
        d('player_idle_0', 'player', 0.00, 0.00, 0.22, 0.20, 16, 24, w, h);
        d('player_idle_1', 'player', 0.22, 0.00, 0.22, 0.20, 16, 24, w, h);

        // Run (4 frames, second row)
        d('player_run_0', 'player', 0.00, 0.20, 0.22, 0.20, 16, 24, w, h);
        d('player_run_1', 'player', 0.22, 0.20, 0.22, 0.20, 16, 24, w, h);
        d('player_run_2', 'player', 0.44, 0.20, 0.22, 0.20, 16, 24, w, h);
        d('player_run_3', 'player', 0.66, 0.20, 0.22, 0.20, 16, 24, w, h);

        // Jump, Fall (third row)
        d('player_jump', 'player', 0.00, 0.40, 0.22, 0.18, 16, 24, w, h);
        d('player_fall', 'player', 0.22, 0.40, 0.22, 0.18, 16, 24, w, h);

        // Shoot, Crouch (fourth row)
        d('player_shoot', 'player', 0.00, 0.55, 0.25, 0.18, 16, 24, w, h);
        d('player_crouch', 'player', 0.30, 0.55, 0.25, 0.18, 16, 24, w, h);

        // Hurt (fifth row)
        d('player_hurt', 'player', 0.00, 0.72, 0.25, 0.15, 16, 24, w, h);

        // Death frames (bottom)
        d('player_die_0', 'player', 0.00, 0.85, 0.25, 0.15, 16, 24, w, h);
        d('player_die_1', 'player', 0.30, 0.85, 0.30, 0.15, 24, 12, w, h);
    },

    // ================================================================
    // eDV - Two frames side by side
    // ================================================================
    _buildEdvAtlas: function(w, h) {
        var d = this._defPct.bind(this);
        d('edv',        'edv', 0.00, 0.05, 0.48, 0.90, 32, 20, w, h);
        d('edv_manned', 'edv', 0.50, 0.05, 0.48, 0.90, 32, 20, w, h);
    },

    // ================================================================
    // ENEMIES - Large composite with labeled sections
    // Layout from Gemini (approximate regions):
    //   Top-left: dogs, magpies (small sprites)
    //   Top-right: Amazon van (large)
    //   Mid-left: person, bin, mower, cat
    //   Mid-right: emu, drop bear
    //   Bottom-left: road train
    //   Bottom-center: rottweiler boss
    //   Bottom-right: chihuahua
    // ================================================================
    _buildEnemiesAtlas: function(w, h) {
        var d = this._defPct.bind(this);

        // Dogs (top-left, 2 frames)
        d('dog_0', 'enemies', 0.00, 0.00, 0.15, 0.12, 16, 12, w, h);
        d('dog_1', 'enemies', 0.15, 0.00, 0.15, 0.12, 16, 12, w, h);

        // Magpies (top, after dogs, 2 frames + swoop)
        d('magpie_0',    'enemies', 0.32, 0.00, 0.10, 0.10, 16, 12, w, h);
        d('magpie_1',    'enemies', 0.42, 0.00, 0.10, 0.10, 16, 12, w, h);
        d('magpie_swoop','enemies', 0.52, 0.00, 0.10, 0.12, 16, 16, w, h);

        // Seagulls - reuse magpie coordinates if no separate seagull in image
        d('seagull_0', 'enemies', 0.32, 0.00, 0.10, 0.10, 16, 12, w, h);
        d('seagull_1', 'enemies', 0.42, 0.00, 0.10, 0.10, 16, 12, w, h);

        // Van (top-right, large)
        d('van', 'enemies', 0.68, 0.00, 0.30, 0.18, 48, 28, w, h);

        // Person (mid-left, 2 frames)
        d('person_0', 'enemies', 0.00, 0.20, 0.12, 0.18, 16, 24, w, h);
        d('person_1', 'enemies', 0.12, 0.20, 0.12, 0.18, 16, 24, w, h);

        // Bin (mid, small)
        d('bin', 'enemies', 0.26, 0.22, 0.08, 0.14, 12, 16, w, h);

        // Sprinkler
        d('sprinkler', 'enemies', 0.35, 0.25, 0.08, 0.08, 12, 8, w, h);

        // Mower (mid)
        d('mower', 'enemies', 0.42, 0.20, 0.14, 0.12, 20, 14, w, h);

        // Cat (mid-right, 2 frames)
        d('cat_0', 'enemies', 0.00, 0.42, 0.10, 0.12, 12, 14, w, h);
        d('cat_1', 'enemies', 0.10, 0.42, 0.10, 0.12, 14, 14, w, h);

        // Hose
        d('hose', 'enemies', 0.22, 0.42, 0.06, 0.06, 8, 8, w, h);

        // Emu (mid-right, 2 frames)
        d('emu_0', 'enemies', 0.60, 0.28, 0.14, 0.22, 20, 24, w, h);
        d('emu_1', 'enemies', 0.74, 0.28, 0.14, 0.22, 20, 24, w, h);

        // Drop bear
        d('dropbear', 'enemies', 0.88, 0.28, 0.11, 0.14, 14, 14, w, h);

        // Road train (bottom-left, wide)
        d('roadtrain', 'enemies', 0.00, 0.58, 0.50, 0.16, 64, 24, w, h);

        // Rottweiler boss (bottom-center, 2 frames, large)
        d('rottweiler_0', 'enemies', 0.30, 0.65, 0.30, 0.25, 48, 40, w, h);
        d('rottweiler_1', 'enemies', 0.60, 0.65, 0.30, 0.25, 48, 40, w, h);

        // Chihuahua (bottom-right, tiny, 2 frames)
        d('chihuahua_0', 'enemies', 0.82, 0.88, 0.08, 0.08, 10, 8, w, h);
        d('chihuahua_1', 'enemies', 0.90, 0.88, 0.08, 0.08, 10, 8, w, h);
    },

    // ================================================================
    // PROJECTILES & PICKUPS
    // Top section: projectiles (parcel, cannon, letter, stamps, card, stamp mark)
    // Bottom section: pickup boxes
    // ================================================================
    _buildProjectilesAtlas: function(w, h) {
        var d = this._defPct.bind(this);

        // Parcel (top-left)
        d('proj_parcel', 'projectiles', 0.00, 0.00, 0.10, 0.14, 8, 6, w, h);
        // Cannon parcel
        d('proj_cannon', 'projectiles', 0.12, 0.00, 0.10, 0.12, 6, 5, w, h);
        // Letter
        d('proj_letter', 'projectiles', 0.24, 0.00, 0.08, 0.08, 5, 3, w, h);

        // Ninja stamp (4 rotation frames, middle area)
        d('proj_stamp_0', 'projectiles', 0.02, 0.28, 0.12, 0.18, 10, 10, w, h);
        d('proj_stamp_1', 'projectiles', 0.16, 0.28, 0.12, 0.18, 10, 10, w, h);
        d('proj_stamp_2', 'projectiles', 0.30, 0.28, 0.12, 0.18, 10, 10, w, h);
        d('proj_stamp_3', 'projectiles', 0.44, 0.28, 0.12, 0.18, 10, 10, w, h);

        // DELIVERED stamp mark
        d('stamp_mark', 'projectiles', 0.58, 0.28, 0.18, 0.14, 14, 8, w, h);

        // Enemy card projectile
        d('proj_card', 'projectiles', 0.80, 0.28, 0.10, 0.10, 8, 6, w, h);

        // Pickup boxes (bottom row)
        d('pickup_cannon', 'projectiles', 0.00, 0.68, 0.14, 0.22, 12, 10, w, h);
        d('pickup_spray',  'projectiles', 0.18, 0.68, 0.14, 0.22, 12, 10, w, h);
        d('pickup_stamp',  'projectiles', 0.36, 0.68, 0.14, 0.22, 12, 10, w, h);
        d('pickup_health', 'projectiles', 0.54, 0.68, 0.14, 0.22, 10, 10, w, h);
        d('pickup_edv',    'projectiles', 0.72, 0.68, 0.16, 0.22, 14, 10, w, h);
    },

    // ================================================================
    // BACKGROUNDS - 5 themes, each with ground tile + far + near parallax
    // Layout: 6 panels (2 rows x 3 columns)
    //   Top row: Suburban, Urban, Regional
    //   Bottom row: Regional(alt), Coastal, Outback
    // Each panel has: ground tile (left), far parallax (top-right), near parallax (bottom-right)
    // ================================================================
    _buildBackgroundsAtlas: function(w, h) {
        var d = this._defPct.bind(this);

        // For backgrounds, we extract ground tiles from the small squares shown
        // Theme 0 = Suburban (top-left panel)
        d('ground_0', 'backgrounds', 0.00, 0.06, 0.06, 0.10, 16, 16, w, h);
        d('dirt_0',   'backgrounds', 0.00, 0.06, 0.06, 0.10, 16, 16, w, h);
        d('road_0',   'backgrounds', 0.00, 0.06, 0.06, 0.10, 16, 16, w, h);
        d('platform_0','backgrounds', 0.00, 0.06, 0.06, 0.05, 16, 8, w, h);

        // Theme 1 = Urban (top-center panel)
        d('ground_1', 'backgrounds', 0.34, 0.06, 0.06, 0.10, 16, 16, w, h);
        d('dirt_1',   'backgrounds', 0.34, 0.06, 0.06, 0.10, 16, 16, w, h);
        d('road_1',   'backgrounds', 0.34, 0.06, 0.06, 0.10, 16, 16, w, h);
        d('platform_1','backgrounds', 0.34, 0.06, 0.06, 0.05, 16, 8, w, h);

        // Theme 2 = Regional (top-right panel)
        d('ground_2', 'backgrounds', 0.68, 0.06, 0.06, 0.10, 16, 16, w, h);
        d('dirt_2',   'backgrounds', 0.68, 0.06, 0.06, 0.10, 16, 16, w, h);
        d('road_2',   'backgrounds', 0.68, 0.06, 0.06, 0.10, 16, 16, w, h);
        d('platform_2','backgrounds', 0.68, 0.06, 0.06, 0.05, 16, 8, w, h);

        // Theme 3 = Coastal (bottom-center panel)
        d('ground_3', 'backgrounds', 0.34, 0.56, 0.06, 0.10, 16, 16, w, h);
        d('dirt_3',   'backgrounds', 0.34, 0.56, 0.06, 0.10, 16, 16, w, h);
        d('road_3',   'backgrounds', 0.34, 0.56, 0.06, 0.10, 16, 16, w, h);
        d('platform_3','backgrounds', 0.34, 0.56, 0.06, 0.05, 16, 8, w, h);

        // Theme 4 = Outback (bottom-right panel)
        d('ground_4', 'backgrounds', 0.68, 0.56, 0.06, 0.10, 16, 16, w, h);
        d('dirt_4',   'backgrounds', 0.68, 0.56, 0.06, 0.10, 16, 16, w, h);
        d('road_4',   'backgrounds', 0.68, 0.56, 0.06, 0.10, 16, 16, w, h);
        d('platform_4','backgrounds', 0.68, 0.56, 0.06, 0.05, 16, 8, w, h);

        // Background houses/trees/fences - use near parallax panels as source
        // These are wide strips, we'll sample chunks from them
        for (var t = 0; t < 5; t++) {
            // Use the programmatic fallback for these complex composites
            // The parallax backgrounds don't tile-map well from the Gemini composites
            // Just map ground tiles for now
            d('bg_house_far_' + t,  'backgrounds', 0.06, 0.02 + (t < 3 ? 0 : 0.50), 0.26, 0.18, 32, 24, w, h);
            d('bg_house_near_' + t, 'backgrounds', 0.06, 0.20 + (t < 3 ? 0 : 0.50), 0.26, 0.25, 40, 32, w, h);
            d('bg_tree_' + t,       'backgrounds', 0.06, 0.20 + (t < 3 ? 0 : 0.50), 0.08, 0.25, 20, 32, w, h);
            d('bg_fence_' + t,      'backgrounds', 0.20, 0.35 + (t < 3 ? 0 : 0.50), 0.10, 0.08, 16, 16, w, h);
        }

        // Special elements - use fallback (programmatic sprites work fine)
        // dead_tree, palm_tree, building, silo, cloud, sun not mapped
    },

    // ================================================================
    // UI - Title logo, house, locker, HUD icons
    // Layout: Title at top, house bottom-left, locker center, icons bottom-right
    // ================================================================
    _buildUiAtlas: function(w, h) {
        var d = this._defPct.bind(this);

        // Delivery house (bottom-left area)
        d('delivery_house',  'ui', 0.02, 0.30, 0.35, 0.50, 32, 32, w, h);
        // Parcel locker (center area)
        d('delivery_locker', 'ui', 0.40, 0.30, 0.25, 0.50, 24, 32, w, h);
    },

    // ================================================================
    // EFFECTS - Explosions, dust, water, muzzle
    // Layout: Explosion frames (top row), dust (mid), water (mid-low), muzzle (bottom)
    // ================================================================
    _buildEffectsAtlas: function(w, h) {
        var d = this._defPct.bind(this);

        // Explosion frames (top, 4 expanding + 1 smoke)
        d('explosion_0', 'effects', 0.00, 0.00, 0.10, 0.18, 8,  8,  w, h);
        d('explosion_1', 'effects', 0.14, 0.00, 0.16, 0.20, 16, 16, w, h);
        d('explosion_2', 'effects', 0.32, 0.00, 0.18, 0.22, 20, 20, w, h);
        d('explosion_3', 'effects', 0.52, 0.00, 0.22, 0.25, 28, 28, w, h);

        // Water drop (tiny)
        d('water_drop', 'effects', 0.00, 0.70, 0.04, 0.04, 2, 2, w, h);
    }
};
