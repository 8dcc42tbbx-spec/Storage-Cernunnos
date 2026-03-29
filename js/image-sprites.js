// Postie Run - Image-Based Sprite Loading System
// Loads PNG sprite sheets from assets/ folder and overrides programmatic sprites
// when available. Falls back silently to PR.SpriteCache if images fail to load.

PR.ImageSprites = {
    loaded: false,
    loading: false,
    progress: 0,        // 0.0 to 1.0
    totalSheets: 7,
    loadedSheets: 0,
    failedSheets: 0,
    sheets: {},          // keyed by sheet name -> Image element
    atlas: {},           // keyed by sprite name -> {sheet, x, y, w, h}
    enabled: true,       // set false to force programmatic sprites

    // ----------------------------------------------------------------
    // Sheet definitions - paths relative to project root
    // ----------------------------------------------------------------
    sheetDefs: {
        player:       'assets/player.png',
        edv:          'assets/edv.png',
        enemies:      'assets/enemies.png',
        projectiles:  'assets/projectiles.png',
        backgrounds:  'assets/backgrounds.png',
        ui:           'assets/ui.png',
        effects:      'assets/effects.png'
    },

    // ----------------------------------------------------------------
    // Initialise - begin loading all sprite sheets
    // ----------------------------------------------------------------
    init: function() {
        if (this.loading || this.loaded) return;
        this.loading = true;
        this.loadedSheets = 0;
        this.failedSheets = 0;
        this.progress = 0;

        this._buildAtlas();
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
                    self._checkComplete();
                };
                img.onerror = function() {
                    // Sheet not found or failed - that is fine, programmatic fallback
                    self.failedSheets++;
                    self._checkComplete();
                };
                img.src = self.sheetDefs[name];
            })(names[i]);
        }
    },

    // ----------------------------------------------------------------
    // Check if all sheets have resolved (loaded or failed)
    // ----------------------------------------------------------------
    _checkComplete: function() {
        var resolved = this.loadedSheets + this.failedSheets;
        this.progress = resolved / this.totalSheets;
        if (resolved >= this.totalSheets) {
            this.loading = false;
            this.loaded = true;
            if (this.loadedSheets > 0) {
                console.log('[ImageSprites] Loaded ' + this.loadedSheets + '/' +
                    this.totalSheets + ' sprite sheets (' +
                    this.failedSheets + ' unavailable, using fallback).');
            } else {
                console.log('[ImageSprites] No sprite sheets found - using programmatic sprites.');
            }
        }
    },

    // ----------------------------------------------------------------
    // Draw a sprite from the image atlas
    // Returns true if drawn, false if not available (caller should fallback)
    // ----------------------------------------------------------------
    draw: function(ctx, key, x, y, flipX) {
        if (!this.enabled) return false;
        var entry = this.atlas[key];
        if (!entry) return false;
        var img = this.sheets[entry.sheet];
        if (!img) return false;

        x = Math.round(x);
        y = Math.round(y);

        if (flipX) {
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(img,
                entry.x, entry.y, entry.w, entry.h,
                -x - entry.w, y, entry.w, entry.h);
            ctx.restore();
        } else {
            ctx.drawImage(img,
                entry.x, entry.y, entry.w, entry.h,
                x, y, entry.w, entry.h);
        }
        return true;
    },

    // ----------------------------------------------------------------
    // Monkey-patch PR.SpriteCache.draw to try image sprites first
    // ----------------------------------------------------------------
    _patchSpriteCache: function() {
        if (this._patched) return;
        this._patched = true;

        var originalDraw = PR.SpriteCache.draw.bind(PR.SpriteCache);
        var imgSprites = this;

        PR.SpriteCache.draw = function(ctx, key, x, y, flipX) {
            // Try image sprite first
            if (imgSprites.draw(ctx, key, x, y, flipX)) {
                return;
            }
            // Fall back to programmatic sprite
            originalDraw(ctx, key, x, y, flipX);
        };
    },

    // ----------------------------------------------------------------
    // Atlas definition - source rectangles within each sprite sheet
    //
    // IMPORTANT: All coordinates below are APPROXIMATE ESTIMATES.
    // They assume a reasonable sprite sheet layout and will need
    // adjustment once actual PNG sprite sheets are placed in assets/.
    //
    // Format: { sheet: 'sheetName', x, y, w, h }
    // where x,y is top-left of the source rectangle in the sheet
    // and w,h is the size to crop.
    // ----------------------------------------------------------------
    _buildAtlas: function() {
        var a = this.atlas;

        // ============================================================
        // PLAYER SPRITES - assets/player.png
        // Expected layout: 16x24 frames in a horizontal strip
        // Row 0: idle(2), run(4), jump, fall, shoot, crouch, hurt, death(2)
        // Coordinates assume 16px wide frames, 24px tall
        // ============================================================

        // Idle frames (2 frames)
        a['player_idle_0']  = { sheet: 'player', x: 0,   y: 0, w: 16, h: 24 };   // approximate
        a['player_idle_1']  = { sheet: 'player', x: 16,  y: 0, w: 16, h: 24 };   // approximate

        // Run frames (4 frames)
        a['player_run_0']   = { sheet: 'player', x: 32,  y: 0, w: 16, h: 24 };   // approximate
        a['player_run_1']   = { sheet: 'player', x: 48,  y: 0, w: 16, h: 24 };   // approximate
        a['player_run_2']   = { sheet: 'player', x: 64,  y: 0, w: 16, h: 24 };   // approximate
        a['player_run_3']   = { sheet: 'player', x: 80,  y: 0, w: 16, h: 24 };   // approximate

        // Jump / Fall
        a['player_jump']    = { sheet: 'player', x: 96,  y: 0, w: 16, h: 24 };   // approximate
        a['player_fall']    = { sheet: 'player', x: 112, y: 0, w: 16, h: 24 };   // approximate

        // Shoot
        a['player_shoot']   = { sheet: 'player', x: 128, y: 0, w: 16, h: 24 };   // approximate

        // Crouch
        a['player_crouch']  = { sheet: 'player', x: 144, y: 0, w: 16, h: 24 };   // approximate

        // Hurt
        a['player_hurt']    = { sheet: 'player', x: 160, y: 0, w: 16, h: 24 };   // approximate

        // Death frames (2 frames - second is wider/shorter: 24x12 lying down)
        a['player_die_0']   = { sheet: 'player', x: 176, y: 0,  w: 16, h: 24 };  // approximate
        a['player_die_1']   = { sheet: 'player', x: 192, y: 12, w: 24, h: 12 };  // approximate

        // ============================================================
        // eDV VEHICLE - assets/edv.png
        // Expected layout: two 32x20 frames side by side
        // ============================================================

        a['edv']            = { sheet: 'edv', x: 0,  y: 0, w: 32, h: 20 };       // approximate - empty vehicle
        a['edv_manned']     = { sheet: 'edv', x: 32, y: 0, w: 32, h: 20 };       // approximate - with driver

        // ============================================================
        // ENEMY SPRITES - assets/enemies.png
        // Expected layout: rows of enemy types
        // Row 0 (y=0):   Dogs 16x12, Magpies 16x12, Seagulls 16x12
        // Row 1 (y=24):  Van 48x28, Persons 16x24
        // Row 2 (y=56):  Bin 12x16, Sprinkler 12x8, Mower 20x14, Cat 12-14x14
        // Row 3 (y=80):  Hose 8x8, Emu 20x24, Dropbear 14x14
        // Row 4 (y=112): Roadtrain 64x24, Boss enemies
        // ============================================================

        // Dogs (2 frames, 16x12 each)
        a['dog_0']          = { sheet: 'enemies', x: 0,   y: 0,  w: 16, h: 12 }; // approximate
        a['dog_1']          = { sheet: 'enemies', x: 16,  y: 0,  w: 16, h: 12 }; // approximate

        // Magpies (2 frames + swoop, 16x12 / 16x16)
        a['magpie_0']       = { sheet: 'enemies', x: 32,  y: 0,  w: 16, h: 12 }; // approximate
        a['magpie_1']       = { sheet: 'enemies', x: 48,  y: 0,  w: 16, h: 12 }; // approximate
        a['magpie_swoop']   = { sheet: 'enemies', x: 64,  y: 0,  w: 16, h: 16 }; // approximate

        // Seagulls (2 frames, 16x12)
        a['seagull_0']      = { sheet: 'enemies', x: 80,  y: 0,  w: 16, h: 12 }; // approximate
        a['seagull_1']      = { sheet: 'enemies', x: 96,  y: 0,  w: 16, h: 12 }; // approximate

        // Van (48x28)
        a['van']            = { sheet: 'enemies', x: 0,   y: 24, w: 48, h: 28 }; // approximate

        // Persons (2 frames, 16x24)
        a['person_0']       = { sheet: 'enemies', x: 48,  y: 24, w: 16, h: 24 }; // approximate
        a['person_1']       = { sheet: 'enemies', x: 64,  y: 24, w: 16, h: 24 }; // approximate

        // Bin (12x16)
        a['bin']            = { sheet: 'enemies', x: 0,   y: 56, w: 12, h: 16 }; // approximate

        // Sprinkler (12x8)
        a['sprinkler']      = { sheet: 'enemies', x: 12,  y: 56, w: 12, h: 8 };  // approximate

        // Mower (20x14)
        a['mower']          = { sheet: 'enemies', x: 24,  y: 56, w: 20, h: 14 }; // approximate

        // Cat (2 frames: 12x14 sitting, 14x14 swiping)
        a['cat_0']          = { sheet: 'enemies', x: 44,  y: 56, w: 12, h: 14 }; // approximate
        a['cat_1']          = { sheet: 'enemies', x: 56,  y: 56, w: 14, h: 14 }; // approximate

        // Hose (8x8)
        a['hose']           = { sheet: 'enemies', x: 0,   y: 80, w: 8,  h: 8 };  // approximate

        // Emu (2 frames, 20x24)
        a['emu_0']          = { sheet: 'enemies', x: 8,   y: 80, w: 20, h: 24 }; // approximate
        a['emu_1']          = { sheet: 'enemies', x: 28,  y: 80, w: 20, h: 24 }; // approximate

        // Dropbear (14x14)
        a['dropbear']       = { sheet: 'enemies', x: 48,  y: 80, w: 14, h: 14 }; // approximate

        // Roadtrain (64x24)
        a['roadtrain']      = { sheet: 'enemies', x: 0,   y: 112, w: 64, h: 24 }; // approximate

        // Boss: Rottweiler (2 frames, 48x40)
        a['rottweiler_0']   = { sheet: 'enemies', x: 64,  y: 112, w: 48, h: 40 }; // approximate
        a['rottweiler_1']   = { sheet: 'enemies', x: 112, y: 112, w: 48, h: 40 }; // approximate

        // Mini-boss: Chihuahua (2 frames, 10x8)
        a['chihuahua_0']    = { sheet: 'enemies', x: 160, y: 112, w: 10, h: 8 };  // approximate
        a['chihuahua_1']    = { sheet: 'enemies', x: 170, y: 112, w: 10, h: 8 };  // approximate

        // ============================================================
        // PROJECTILES & PICKUPS - assets/projectiles.png
        // Expected layout:
        // Row 0: Projectiles - parcel 8x6, cannon 6x5, letter 5x3, stamp(4) 10x10, card 8x6
        // Row 1: Pickups - cannon 12x10, spray 12x10, stamp 12x10, health 10x10, edv 14x10
        // Row 2: Stamp mark 14x8
        // ============================================================

        // Projectiles
        a['proj_parcel']    = { sheet: 'projectiles', x: 0,   y: 0, w: 8,  h: 6 };  // approximate
        a['proj_cannon']    = { sheet: 'projectiles', x: 8,   y: 0, w: 6,  h: 5 };  // approximate
        a['proj_letter']    = { sheet: 'projectiles', x: 14,  y: 0, w: 5,  h: 3 };  // approximate

        // Stamp projectile (4 rotation frames, 10x10)
        a['proj_stamp_0']   = { sheet: 'projectiles', x: 20,  y: 0, w: 10, h: 10 }; // approximate
        a['proj_stamp_1']   = { sheet: 'projectiles', x: 30,  y: 0, w: 10, h: 10 }; // approximate
        a['proj_stamp_2']   = { sheet: 'projectiles', x: 40,  y: 0, w: 10, h: 10 }; // approximate
        a['proj_stamp_3']   = { sheet: 'projectiles', x: 50,  y: 0, w: 10, h: 10 }; // approximate

        // Enemy projectile
        a['proj_card']      = { sheet: 'projectiles', x: 60,  y: 0, w: 8,  h: 6 };  // approximate

        // Stamp mark (left on ground)
        a['stamp_mark']     = { sheet: 'projectiles', x: 68,  y: 0, w: 14, h: 8 };  // approximate

        // Pickups
        a['pickup_cannon']  = { sheet: 'projectiles', x: 0,   y: 16, w: 12, h: 10 }; // approximate
        a['pickup_spray']   = { sheet: 'projectiles', x: 12,  y: 16, w: 12, h: 10 }; // approximate
        a['pickup_stamp']   = { sheet: 'projectiles', x: 24,  y: 16, w: 12, h: 10 }; // approximate
        a['pickup_health']  = { sheet: 'projectiles', x: 36,  y: 16, w: 10, h: 10 }; // approximate
        a['pickup_edv']     = { sheet: 'projectiles', x: 46,  y: 16, w: 14, h: 10 }; // approximate

        // ============================================================
        // BACKGROUNDS - assets/backgrounds.png
        // Expected layout: 5 theme columns, each containing tile types
        // Theme IDs: 0=suburban, 1=urban, 2=regional, 3=outback, 4=coastal
        // Each theme column is 48px wide (3 tile types side by side)
        // Row 0 (y=0):   ground 16x16 per theme
        // Row 1 (y=16):  dirt 16x16 per theme
        // Row 2 (y=32):  road 16x16 per theme
        // Row 3 (y=48):  platform 16x8 per theme
        // Row 4 (y=64):  bg_house_far 32x24 per theme
        // Row 5 (y=96):  bg_house_near 40x32 per theme
        // Row 6 (y=128): bg_tree 20x32 per theme
        // Row 7 (y=160): bg_fence 16x16 per theme
        // ============================================================

        var themeNames = [0, 1, 2, 3, 4]; // theme IDs
        for (var t = 0; t < themeNames.length; t++) {
            var themeId = themeNames[t];
            var tx = t * 48; // approximate - each theme column ~48px wide

            // Ground tiles (16x16)
            a['ground_' + themeId]         = { sheet: 'backgrounds', x: tx,      y: 0,   w: 16, h: 16 }; // approximate
            a['dirt_' + themeId]           = { sheet: 'backgrounds', x: tx,      y: 16,  w: 16, h: 16 }; // approximate
            a['road_' + themeId]           = { sheet: 'backgrounds', x: tx,      y: 32,  w: 16, h: 16 }; // approximate
            a['platform_' + themeId]       = { sheet: 'backgrounds', x: tx,      y: 48,  w: 16, h: 8 };  // approximate

            // Background decorations per theme
            a['bg_house_far_' + themeId]   = { sheet: 'backgrounds', x: tx,      y: 64,  w: 32, h: 24 }; // approximate
            a['bg_house_near_' + themeId]  = { sheet: 'backgrounds', x: tx,      y: 96,  w: 40, h: 32 }; // approximate
            a['bg_tree_' + themeId]        = { sheet: 'backgrounds', x: tx,      y: 128, w: 20, h: 32 }; // approximate
            a['bg_fence_' + themeId]       = { sheet: 'backgrounds', x: tx,      y: 160, w: 16, h: 16 }; // approximate
        }

        // Special trees and structures (not per-theme)
        a['dead_tree']      = { sheet: 'backgrounds', x: 0,   y: 192, w: 16, h: 28 }; // approximate - outback dead tree
        a['palm_tree']      = { sheet: 'backgrounds', x: 16,  y: 192, w: 20, h: 36 }; // approximate - coastal palm tree
        a['building']       = { sheet: 'backgrounds', x: 36,  y: 192, w: 32, h: 48 }; // approximate - urban building
        a['silo']           = { sheet: 'backgrounds', x: 68,  y: 192, w: 16, h: 40 }; // approximate - regional silo

        // Sky elements
        a['cloud']          = { sheet: 'backgrounds', x: 84,  y: 192, w: 32, h: 12 }; // approximate
        a['sun']            = { sheet: 'backgrounds', x: 116, y: 192, w: 16, h: 16 }; // approximate

        // ============================================================
        // UI ELEMENTS - assets/ui.png
        // Expected layout:
        // Row 0: Delivery house 32x32, Delivery locker 24x32
        // Row 1: Boss health bar bg 200x8
        // ============================================================

        a['delivery_house']  = { sheet: 'ui', x: 0,   y: 0,  w: 32, h: 32 }; // approximate
        a['delivery_locker'] = { sheet: 'ui', x: 32,  y: 0,  w: 24, h: 32 }; // approximate
        a['boss_bar_bg']     = { sheet: 'ui', x: 0,   y: 32, w: 200, h: 8 }; // approximate

        // ============================================================
        // EFFECTS - assets/effects.png
        // Expected layout:
        // Row 0: Explosion frames (5 frames at various sizes: 12,16,20,24,16)
        // Row 1: Water drop 2x2
        // ============================================================

        // Explosion frames (5 sizes: 12, 16, 20, 24, 16)
        a['explosion_0']    = { sheet: 'effects', x: 0,   y: 0,  w: 12, h: 12 }; // approximate
        a['explosion_1']    = { sheet: 'effects', x: 12,  y: 0,  w: 16, h: 16 }; // approximate
        a['explosion_2']    = { sheet: 'effects', x: 28,  y: 0,  w: 20, h: 20 }; // approximate
        a['explosion_3']    = { sheet: 'effects', x: 48,  y: 0,  w: 24, h: 24 }; // approximate
        a['explosion_4']    = { sheet: 'effects', x: 72,  y: 0,  w: 16, h: 16 }; // approximate

        // Water drop
        a['water_drop']     = { sheet: 'effects', x: 88,  y: 0,  w: 2,  h: 2 };  // approximate
    }
};
