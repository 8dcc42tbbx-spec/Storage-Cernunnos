// Postie Run - Image-Based Sprite Loading System (v3)
// Loads PNG sprite sheets from assets/ and scales them to game resolution.
// Falls back silently to PR.SpriteCache if images fail to load.
// Coordinates mapped from actual Gemini-generated sprite sheets.

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

    // Draw sprite from atlas, scaling from source rect to game-size dest rect
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

    // Helper: define with absolute pixel coords
    _def: function(key, sheet, sx, sy, sw, sh, dw, dh) {
        this.atlas[key] = { sheet: sheet, sx: sx, sy: sy, sw: sw, sh: sh, dw: dw, dh: dh };
    },

    // Helper: define with percentage-based coords (0-1 fractions of image size)
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

    // ================================================================
    // PLAYER (1696 x 2528) - Ernie the postie
    // Row 1: 2 idle standing frames
    // Row 2: 4 run cycle frames
    // Row 3: 2 jump/fall frames
    // Row 4: 2 shoot/throw frames (with visible envelope)
    // Row 5: 1 hurt frame
    // Row 6: 3 death frames (stumble, fall, lying)
    // ================================================================
    _buildPlayerAtlas: function(w, h) {
        var d = this._defPct.bind(this);

        // Row 1 - Idle (2 frames, top ~16%)
        d('player_idle_0', 'player', 0.01, 0.00, 0.26, 0.16, 16, 24, w, h);
        d('player_idle_1', 'player', 0.28, 0.00, 0.28, 0.16, 16, 24, w, h);

        // Row 2 - Run (4 frames, ~17-33%)
        d('player_run_0', 'player', 0.00, 0.17, 0.23, 0.16, 16, 24, w, h);
        d('player_run_1', 'player', 0.23, 0.17, 0.23, 0.16, 16, 24, w, h);
        d('player_run_2', 'player', 0.47, 0.17, 0.23, 0.16, 16, 24, w, h);
        d('player_run_3', 'player', 0.70, 0.17, 0.23, 0.16, 16, 24, w, h);

        // Row 3 - Jump/Fall (2 frames, ~34-50%)
        d('player_jump', 'player', 0.00, 0.34, 0.27, 0.15, 16, 24, w, h);
        d('player_fall', 'player', 0.30, 0.34, 0.27, 0.15, 16, 24, w, h);

        // Row 4 - Shoot/Throw (2 frames, ~52-68%)
        d('player_shoot', 'player', 0.00, 0.52, 0.30, 0.16, 18, 24, w, h);
        d('player_crouch','player', 0.34, 0.52, 0.34, 0.16, 18, 24, w, h);

        // Row 5 - Hurt (1 frame, ~70-83%)
        d('player_hurt', 'player', 0.00, 0.70, 0.26, 0.13, 16, 24, w, h);

        // Row 6 - Death (3 frames, ~84-100%)
        d('player_die_0', 'player', 0.00, 0.84, 0.22, 0.15, 16, 24, w, h);
        d('player_die_1', 'player', 0.24, 0.84, 0.32, 0.15, 20, 16, w, h);
        d('player_die_2', 'player', 0.54, 0.86, 0.40, 0.14, 24, 12, w, h);
    },

    // ================================================================
    // eDV (3712 x 1152) - Australia Post delivery vehicle
    // 2 frames side by side: empty and with Ernie driving
    // ================================================================
    _buildEdvAtlas: function(w, h) {
        var d = this._defPct.bind(this);
        d('edv',        'edv', 0.01, 0.04, 0.46, 0.92, 32, 20, w, h);
        d('edv_manned', 'edv', 0.51, 0.04, 0.46, 0.92, 32, 20, w, h);
    },

    // ================================================================
    // ENEMIES (2816 x 1536) - All enemy types with text labels
    // Top: dogs(2), magpies(3), van(1)
    // Mid: person(2), bin(1), mower(1), emu(2), dropbear(1)
    // Lower: cat(2)
    // Bottom: roadtrain(1), rottweiler(2), chihuahua(2)
    // ================================================================
    _buildEnemiesAtlas: function(w, h) {
        var d = this._defPct.bind(this);

        // Dogs - top-left (2 frames, with label "3A" above)
        d('dog_0', 'enemies', 0.00, 0.03, 0.09, 0.12, 16, 12, w, h);
        d('dog_1', 'enemies', 0.10, 0.03, 0.09, 0.12, 16, 12, w, h);

        // Magpies - top-center after dogs (label "3B")
        // 2 flap frames + 1 swoop/dive frame
        d('magpie_0',     'enemies', 0.22, 0.02, 0.065, 0.10, 16, 12, w, h);
        d('magpie_1',     'enemies', 0.29, 0.02, 0.065, 0.10, 16, 12, w, h);
        d('magpie_swoop', 'enemies', 0.37, 0.01, 0.08,  0.12, 16, 16, w, h);

        // Seagulls - reuse magpie frames (no separate seagull sprites)
        d('seagull_0', 'enemies', 0.22, 0.02, 0.065, 0.10, 16, 12, w, h);
        d('seagull_1', 'enemies', 0.29, 0.02, 0.065, 0.10, 16, 12, w, h);

        // Van - top-right, large (label "3C")
        d('van', 'enemies', 0.60, 0.01, 0.38, 0.32, 48, 28, w, h);

        // Person - mid-left (label "3D", 2 angry frames)
        d('person_0', 'enemies', 0.00, 0.23, 0.09, 0.20, 16, 24, w, h);
        d('person_1', 'enemies', 0.10, 0.23, 0.09, 0.20, 16, 24, w, h);

        // Wheelie Bin - mid-center-left (label "3E")
        d('bin', 'enemies', 0.225, 0.24, 0.06, 0.15, 12, 16, w, h);

        // Sprinkler - not in this sheet, falls through to programmatic
        // (no sprinkler visible in the Gemini enemies sheet)

        // Lawn Mower - mid-center (label "3F")
        d('mower', 'enemies', 0.31, 0.22, 0.14, 0.16, 20, 14, w, h);

        // Emu - mid-right (label "3H", 2 frames)
        d('emu_0', 'enemies', 0.545, 0.20, 0.12, 0.24, 20, 24, w, h);
        d('emu_1', 'enemies', 0.675, 0.20, 0.12, 0.24, 20, 24, w, h);

        // Drop Bear (koala) - far right (label "3I")
        d('dropbear', 'enemies', 0.84, 0.22, 0.10, 0.16, 14, 14, w, h);

        // Cat on Fence - left side lower (label "3G", 2 frames)
        d('cat_0', 'enemies', 0.00, 0.50, 0.08, 0.14, 12, 14, w, h);
        d('cat_1', 'enemies', 0.10, 0.50, 0.10, 0.14, 14, 14, w, h);

        // Hose - not in this sheet, falls through to programmatic

        // Road Train - bottom-left, very wide (label "3J")
        d('roadtrain', 'enemies', 0.00, 0.64, 0.48, 0.18, 64, 24, w, h);

        // Rottweiler Boss - bottom-center, large (label "3K", 2 frames)
        d('rottweiler_0', 'enemies', 0.34, 0.60, 0.22, 0.34, 48, 40, w, h);
        d('rottweiler_1', 'enemies', 0.57, 0.60, 0.22, 0.34, 48, 40, w, h);

        // Chihuahua - bottom-right, small (label "3L", 2 frames)
        d('chihuahua_0', 'enemies', 0.82, 0.82, 0.08, 0.14, 10, 8, w, h);
        d('chihuahua_1', 'enemies', 0.91, 0.82, 0.08, 0.14, 10, 8, w, h);
    },

    // ================================================================
    // PROJECTILES & PICKUPS (2816 x 1536)
    // Top: parcel, cannon parcel, letter (with labels)
    // Mid: 4 stamp rotations, DELIVERED stamp, Sorry Card
    // Bottom: 5 pickup crates (Cannon, Spray, Stamp, Health, eDV)
    // ================================================================
    _buildProjectilesAtlas: function(w, h) {
        var d = this._defPct.bind(this);

        // Parcel - top-left (small brown box)
        d('proj_parcel', 'projectiles', 0.02, 0.03, 0.07, 0.12, 8, 6, w, h);
        // Cannon Parcel - with speed lines
        d('proj_cannon', 'projectiles', 0.13, 0.03, 0.09, 0.12, 6, 5, w, h);
        // Letter - small white envelope
        d('proj_letter', 'projectiles', 0.27, 0.04, 0.06, 0.08, 5, 3, w, h);

        // Ninja Stamps - 4 rotation frames (0°, 90°, 180°, 270°)
        d('proj_stamp_0', 'projectiles', 0.01, 0.30, 0.10, 0.18, 10, 10, w, h);
        d('proj_stamp_1', 'projectiles', 0.13, 0.30, 0.10, 0.18, 10, 10, w, h);
        d('proj_stamp_2', 'projectiles', 0.25, 0.30, 0.10, 0.18, 10, 10, w, h);
        d('proj_stamp_3', 'projectiles', 0.37, 0.30, 0.10, 0.18, 10, 10, w, h);

        // DELIVERED stamp mark
        d('stamp_mark', 'projectiles', 0.50, 0.30, 0.15, 0.14, 14, 8, w, h);

        // Sorry We Missed You card (enemy projectile)
        d('proj_card', 'projectiles', 0.74, 0.32, 0.10, 0.12, 8, 6, w, h);

        // Pickup crates - bottom row (5 colored crates)
        d('pickup_cannon', 'projectiles', 0.01, 0.66, 0.13, 0.28, 12, 12, w, h);
        d('pickup_spray',  'projectiles', 0.17, 0.66, 0.13, 0.28, 12, 12, w, h);
        d('pickup_stamp',  'projectiles', 0.33, 0.66, 0.13, 0.28, 12, 12, w, h);
        d('pickup_health', 'projectiles', 0.50, 0.66, 0.13, 0.28, 12, 12, w, h);
        d('pickup_edv',    'projectiles', 0.67, 0.66, 0.14, 0.28, 14, 12, w, h);
    },

    // ================================================================
    // BACKGROUNDS (2816 x 1536) - 6 panels (2x3 grid)
    // NOT mapping ground/dirt/platform tiles - programmatic tiles better
    // NOT mapping individual house/tree/fence sprites - programmatic parallax works
    // Backgrounds sheet is loaded but falls through to programmatic rendering
    // ================================================================
    _buildBackgroundsAtlas: function(w, h) {
        // Intentionally empty - all background sprites (ground tiles,
        // parallax houses, trees, fences) fall through to the programmatic
        // pixel art which tiles and repeats correctly.
        // The Gemini background sheet has panoramic strips that don't
        // work well as individual tiling sprites.
    },

    // ================================================================
    // UI (2816 x 1536) - Title, delivery targets, HUD icons
    // Top: "POSTIE RUN" title logo (large, centered)
    // Bottom-left: House (delivery target)
    // Bottom-center: Parcel Locker (delivery target)
    // Bottom-right: HUD icons (hat, heart, arrow)
    // ================================================================
    _buildUiAtlas: function(w, h) {
        var d = this._defPct.bind(this);

        // Delivery House - bottom-left
        d('delivery_house',  'ui', 0.04, 0.38, 0.28, 0.50, 32, 32, w, h);
        // Parcel Locker - bottom-center
        d('delivery_locker', 'ui', 0.38, 0.38, 0.18, 0.50, 24, 32, w, h);
    },

    // ================================================================
    // EFFECTS (2816 x 1536) - Explosions, dust, water, muzzle
    // Row 1: 5 explosion frames (tiny→small→medium→large→smoke)
    // Row 2: 3 dust puff frames
    // Row 3: 3 water splash frames
    // Row 4: 2 muzzle flash frames
    // ================================================================
    _buildEffectsAtlas: function(w, h) {
        var d = this._defPct.bind(this);

        // Explosion frames - top row, expanding sizes
        d('explosion_0', 'effects', 0.00, 0.02, 0.06, 0.13, 8,  8,  w, h);
        d('explosion_1', 'effects', 0.08, 0.00, 0.12, 0.18, 14, 14, w, h);
        d('explosion_2', 'effects', 0.22, 0.00, 0.14, 0.20, 20, 20, w, h);
        d('explosion_3', 'effects', 0.38, 0.00, 0.18, 0.24, 26, 26, w, h);

        // Smoke puff (5th frame in explosion row)
        d('smoke', 'effects', 0.58, 0.00, 0.16, 0.22, 20, 20, w, h);

        // Water drop (tiny, for sprinkler/hose effects)
        d('water_drop', 'effects', 0.00, 0.52, 0.04, 0.06, 3, 3, w, h);
    }
};
