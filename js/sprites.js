// Postie Run - Sprite Cache and Programmatic Sprite Drawing
PR.SpriteCache = {
    cache: {},

    init: function() {
        PR.SpritePlayer.register();
        PR.SpriteEnemies.register();
        PR.SpriteEffects.register();
        PR.SpriteEnvironment.register();
    },

    create: function(key, width, height, drawFn) {
        var c = document.createElement('canvas');
        c.width = width;
        c.height = height;
        var ctx = c.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        drawFn(ctx);
        this.cache[key] = { canvas: c, w: width, h: height };
    },

    draw: function(ctx, key, x, y, flipX) {
        var s = this.cache[key];
        if (!s) return;
        x = Math.round(x);
        y = Math.round(y);
        if (flipX) {
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(s.canvas, -x - s.w, y);
            ctx.restore();
        } else {
            ctx.drawImage(s.canvas, x, y);
        }
    },

    get: function(key) {
        return this.cache[key];
    }
};

// Pixel map renderer utility
PR.SpriteRenderer = {
    // Draw from a pixel map: array of strings, each char maps to palette color
    fromPixelMap: function(ctx, data, palette) {
        for (var row = 0; row < data.length; row++) {
            for (var col = 0; col < data[row].length; col++) {
                var ch = data[row][col];
                if (ch === '.' || ch === ' ') continue;
                ctx.fillStyle = palette[ch];
                ctx.fillRect(col, row, 1, 1);
            }
        }
    },

    // Draw outlined rect
    outlinedRect: function(ctx, x, y, w, h, fill, stroke) {
        if (stroke) {
            ctx.fillStyle = stroke;
            ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
        }
        ctx.fillStyle = fill;
        ctx.fillRect(x, y, w, h);
    },

    // Draw circle approximation with pixels
    circle: function(ctx, cx, cy, r, color) {
        ctx.fillStyle = color;
        for (var y = -r; y <= r; y++) {
            for (var x = -r; x <= r; x++) {
                if (x * x + y * y <= r * r) {
                    ctx.fillRect(cx + x, cy + y, 1, 1);
                }
            }
        }
    }
};

// ============================================================
// PLAYER SPRITES
// ============================================================
PR.SpritePlayer = {
    pal: {
        'R': '#CC2200', 'r': '#AA1800', // Red shirt/cap
        'Y': '#FFD700', 'y': '#CCAA00', // Hi-vis yellow
        'S': '#F5C6A0', 's': '#D4A880', // Skin, skin shadow
        'H': '#4A3020',                  // Hair
        'P': '#1A1A5A', 'p': '#101040', // Pants
        'B': '#2A2A2A', 'b': '#1A1A1A', // Boots
        'W': '#FFFFFF', 'w': '#DDDDDD', // White
        'T': '#8B4513', 't': '#6B3010', // Satchel/tan
        'K': '#000000',                  // Outline
        'G': '#888888',                  // Grey
    },

    register: function() {
        var pal = this.pal;

        // IDLE frame 0 (16x24)
        PR.SpriteCache.create('player_idle_0', 16, 24, function(ctx) {
            PR.SpriteRenderer.fromPixelMap(ctx, [
                '......KKK.......',
                '.....KRRRKK.....',
                '.....KRRRRK.....',
                '....KWWKKKK.....',
                '....KSSSSK......',
                '....KSsSSK......',
                '....KSSSSK......',
                '.....KSSK.......',
                '....KRRRRK......',
                '...KRYYRRRK.....',
                '...KRYYRRRK.....',
                '...KRRRRRTK.....',
                '...KRRRRtTK.....',
                '....KSSK.TK.....',
                '....KSSK........',
                '...KPPPPK.......',
                '...KPPPPK.......',
                '...KPK.KPK......',
                '...KPK.KPK......',
                '..KBBK.KBBK.....',
                '..KBBK.KBBK.....',
                '................',
                '................',
                '................'
            ], pal);
        });

        // IDLE frame 1 (breathing)
        PR.SpriteCache.create('player_idle_1', 16, 24, function(ctx) {
            PR.SpriteRenderer.fromPixelMap(ctx, [
                '......KKK.......',
                '.....KRRRKK.....',
                '.....KRRRRK.....',
                '....KWWKKKK.....',
                '....KSSSSK......',
                '....KSsSSK......',
                '....KSSSSK......',
                '.....KSSK.......',
                '....KRRRRK......',
                '...KRYYRRRK.....',
                '...KRYYRRRK.....',
                '...KRRRRRTK.....',
                '...KRRRRtTK.....',
                '....KSSK.TK.....',
                '....KSSK........',
                '...KPPPPK.......',
                '...KPPPPK.......',
                '...KPK.KPK......',
                '...KPK.KPK......',
                '..KBBK.KBBK.....',
                '..KBBK.KBBK.....',
                '................',
                '................',
                '................'
            ], pal);
        });

        // RUN frames (4 frames)
        var runFrames = [
            [ // run_0 - contact
                '......KKK.......',
                '.....KRRRKK.....',
                '.....KRRRRK.....',
                '....KWWKKKK.....',
                '....KSSSSK......',
                '....KSsSSK......',
                '....KSSSSK......',
                '.....KSSK.......',
                '....KRRRRK......',
                '...KRYYRRKK.....',
                '...KRYYRRRK.....',
                '...KRRRRRTK.....',
                '...KRRRRtTK.....',
                '....KSSK........',
                '...KPPPPK.......',
                '...KPPPPK.......',
                '..KPK...KPK.....',
                '.KPK.....KPK....',
                '.KBK.....KBK....',
                'KBBK.....KBBK...',
                '................',
                '................',
                '................',
                '................'
            ],
            [ // run_1 - passing
                '......KKK.......',
                '.....KRRRKK.....',
                '.....KRRRRK.....',
                '....KWWKKKK.....',
                '....KSSSSK......',
                '....KSsSSK......',
                '....KSSSSK......',
                '.....KSSK.......',
                '....KRRRRK......',
                '...KRYYRRKK.....',
                '...KRYYRRRK.....',
                '...KRRRRRTK.....',
                '...KRRRRtTK.....',
                '....KSSK........',
                '...KPPPPK.......',
                '....KPPK........',
                '....KPKPK.......',
                '...KBKKBK.......',
                '...KBK.KBK......',
                '................',
                '................',
                '................',
                '................',
                '................'
            ],
            [ // run_2 - flight
                '.....KKK........',
                '....KRRRKK......',
                '....KRRRRK......',
                '...KWWKKKK......',
                '...KSSSSK.......',
                '...KSsSSK.......',
                '...KSSSSK.......',
                '....KSSK........',
                '...KRRRRK.......',
                '..KRYYRRKK......',
                '..KRYYRRRK......',
                '..KRRRRRTK......',
                '..KRRRRtTK......',
                '...KSSK.........',
                '..KPPPPK........',
                '..KPPPPK........',
                '...KPK.KPK......',
                '....KBK.KBK.....',
                '.....KBK.KBK....',
                '................',
                '................',
                '................',
                '................',
                '................'
            ],
            [ // run_3 - contact other leg
                '......KKK.......',
                '.....KRRRKK.....',
                '.....KRRRRK.....',
                '....KWWKKKK.....',
                '....KSSSSK......',
                '....KSsSSK......',
                '....KSSSSK......',
                '.....KSSK.......',
                '....KRRRRK......',
                '...KRYYRRKK.....',
                '...KRYYRRRK.....',
                '...KRRRRRTK.....',
                '...KRRRRtTK.....',
                '....KSSK........',
                '...KPPPPK.......',
                '...KPPPPK.......',
                '....KPK.KPK.....',
                '.....KPK.KPK....',
                '....KBK...KBK...',
                '...KBBK...KBBK..',
                '................',
                '................',
                '................',
                '................'
            ]
        ];

        for (var i = 0; i < runFrames.length; i++) {
            (function(idx) {
                PR.SpriteCache.create('player_run_' + idx, 16, 24, function(ctx) {
                    PR.SpriteRenderer.fromPixelMap(ctx, runFrames[idx], pal);
                });
            })(i);
        }

        // JUMP frame
        PR.SpriteCache.create('player_jump', 16, 24, function(ctx) {
            PR.SpriteRenderer.fromPixelMap(ctx, [
                '......KKK.......',
                '.....KRRRKK.....',
                '.....KRRRRK.....',
                '....KWWKKKK.....',
                '....KSSSSK......',
                '....KSsSSK......',
                '....KSSSSK......',
                '.....KSSK.......',
                '..KSKKRRRRK.....',
                '..KSSKRYYRK.....',
                '...KKRYYRRKK....',
                '...KRRRRRTK.....',
                '...KRRRRtTK.....',
                '....KSSKK.......',
                '...KPPPPK.......',
                '..KPPK.KPPK.....',
                '.KPK....KPK.....',
                '.KBK.....KBK....',
                'KBBK.....KBBK...',
                '................',
                '................',
                '................',
                '................',
                '................'
            ], pal);
        });

        // FALL frame
        PR.SpriteCache.create('player_fall', 16, 24, function(ctx) {
            PR.SpriteRenderer.fromPixelMap(ctx, [
                '......KKK.......',
                '.....KRRRKK.....',
                '.....KRRRRK.....',
                '....KWWKKKK.....',
                '....KSSSSK......',
                '....KSsSSK......',
                '....KSSSSK......',
                '.....KSSK.......',
                '...KKKRRRRK.....',
                '..KSSKRYYRK.....',
                '..KSSRYYRRKK....',
                '...KRRRRRTK.....',
                '...KRRRRtTK.....',
                '....KSSKK.......',
                '...KPPPPK.......',
                '...KPPPPK.......',
                '..KPK...KPK.....',
                '..KBK...KBK.....',
                '.KBBK...KBBK....',
                '................',
                '................',
                '................',
                '................',
                '................'
            ], pal);
        });

        // SHOOT frame
        PR.SpriteCache.create('player_shoot', 16, 24, function(ctx) {
            PR.SpriteRenderer.fromPixelMap(ctx, [
                '......KKK.......',
                '.....KRRRKK.....',
                '.....KRRRRK.....',
                '....KWWKKKK.....',
                '....KSSSSK......',
                '....KSsSSK......',
                '....KSSSSK......',
                '.....KSSK.......',
                '....KRRRRKSSK...',
                '...KRYYRRKSSKK..',
                '...KRYYRR.KSSK..',
                '...KRRRRR..KK...',
                '...KRRRRtTK.....',
                '....KSSK.TK.....',
                '....KSSK........',
                '...KPPPPK.......',
                '...KPPPPK.......',
                '...KPK.KPK......',
                '..KBBK.KBBK.....',
                '..KBBK.KBBK.....',
                '................',
                '................',
                '................',
                '................'
            ], pal);
        });

        // CROUCH frame
        PR.SpriteCache.create('player_crouch', 16, 24, function(ctx) {
            PR.SpriteRenderer.fromPixelMap(ctx, [
                '................',
                '................',
                '................',
                '................',
                '................',
                '......KKK.......',
                '.....KRRRKK.....',
                '.....KRRRRK.....',
                '....KWWKKKK.....',
                '....KSSSSK......',
                '....KSsSSK......',
                '....KSSSSK......',
                '.....KSSK.......',
                '....KRRRRK......',
                '...KRYYRRRK.....',
                '...KRRRRRTK.....',
                '...KRRRRtTK.....',
                '....KSSK.TK.....',
                '..KPPPPPPK......',
                '.KPPPPPPPPK.....',
                '.KBBK..KBBK.....',
                '................',
                '................',
                '................'
            ], pal);
        });

        // HURT frame
        PR.SpriteCache.create('player_hurt', 16, 24, function(ctx) {
            PR.SpriteRenderer.fromPixelMap(ctx, [
                '................',
                '......KKK.......',
                '.....KRRRKK.....',
                '.....KRRRRK.....',
                '....KWWKKKK.....',
                '....KSSSSK......',
                '....KssSsK......',
                '....KSSSSK......',
                '.....KSSK.......',
                '..KSKKRRRRK.....',
                '.KSSKRYYRRKK....',
                '..KKRYYRRRK.....',
                '...KRRRRRTK.....',
                '...KRRRRtTK.....',
                '....KSSKK.......',
                '...KPPPPK.......',
                '....KPPK........',
                '...KPK.KPK......',
                '..KBBK.KBBK.....',
                '................',
                '................',
                '................',
                '................',
                '................'
            ], pal);
        });

        // DEATH frames (2 frames)
        PR.SpriteCache.create('player_die_0', 16, 24, function(ctx) {
            PR.SpriteRenderer.fromPixelMap(ctx, [
                '................',
                '................',
                '................',
                '................',
                '...KKK..........',
                '..KRRRKK........',
                '..KRRRRK........',
                '.KWWKKKK........',
                '.KSSSSK.........',
                '.KssSsK.........',
                '.KSSSSK.........',
                '..KSSK..........',
                '.KRRRRK.........',
                'KRYYRRRK........',
                'KRRRRRTK........',
                '.KSSK.TK........',
                'KPPPPPPK........',
                'KPPPPPPK........',
                'KBBKKBBK........',
                '................',
                '................',
                '................',
                '................',
                '................'
            ], pal);
        });

        PR.SpriteCache.create('player_die_1', 24, 12, function(ctx) {
            PR.SpriteRenderer.fromPixelMap(ctx, [
                '.......KKKK.KKK.KKKKKK.',
                '......KRRRRKSSSKPPKKBBK.',
                '.KKK..KRRRRKSSSKPPKKBBK.',
                'KRRRKKKRRRRKSSSKPPK.....',
                'KRRRRKKYYRRKRRTK........',
                'KWWKKKKYYRRKRTK.........',
                'KSSSSK.KRRRKRK..........',
                'KssSsK..KKK.............',
                'KSSSSK..................',
                '.KKK....................',
                '........................',
                '........................'
            ], pal);
        });

        // eDV vehicle sprite (32x20)
        PR.SpriteCache.create('edv', 32, 20, function(ctx) {
            var ep = {
                'R': '#CC2200', 'r': '#AA1800',
                'W': '#F0F0F0', 'w': '#DDDDDD',
                'G': '#888888', 'g': '#666666',
                'K': '#000000',
                'S': '#F5C6A0',
                'B': '#333333',
                'Y': '#FFD700',
                'L': '#AADDFF'
            };
            PR.SpriteRenderer.fromPixelMap(ctx, [
                '........KKKKKKKK........',
                '.......KRRRRRRRRK.......',
                '......KRRRRRRRRRRK......',
                '.....KRRRRRRRRRRRRK.....',
                '....KRRRRRRRRRRRRRRKK...',
                '...KLLKRRRRRRRRRRWWWK...',
                '..KLLKKRRRRRRRRRRWWWWK..',
                '.KWWWWWWWWWWWWWWWWWWWWK.',
                'KWWWWWWWWWWWWWWWWWWWWWWK',
                'KRRRRRRRRRRRRRRRRRRRRRK.',
                'KRRRRRRRRRRRRRRRRRRRRK..',
                'KRRWWRRRRRRRRRRRRRRRRK..',
                'KRRWWRRRRRYRRRRRRRRRRK..',
                'KRRRRRRRRRRRRRRRRWWRRK..',
                'KRRRRRRRRRRRRRRRRWWRRK..',
                'KRRRRRRRRRRRRRRRRRRRK...',
                '.KKKKKKKKKKKKKKKKKKKK...',
                '.KgBBBgKKKKKKKKgBBBgK..',
                'KBBBBBBKkkkkkKBBBBBBBK.',
                '.KgBBBgK......KgBBBgK..',
            ], ep);
        });

        // eDV with Ernie in it (32x20)
        PR.SpriteCache.create('edv_manned', 32, 20, function(ctx) {
            var ep = {
                'R': '#CC2200', 'r': '#AA1800',
                'W': '#F0F0F0', 'w': '#DDDDDD',
                'G': '#888888', 'g': '#666666',
                'K': '#000000',
                'S': '#F5C6A0', 's': '#D4A880',
                'B': '#333333',
                'Y': '#FFD700',
                'L': '#AADDFF',
                'H': '#4A3020',
                'C': '#CC2200'
            };
            PR.SpriteRenderer.fromPixelMap(ctx, [
                '........KKKKKKKK........',
                '..KKK..KRRRRRRRRK.......',
                '.KCCCKKRRRRRRRRRRK......',
                '.KCCCKRRRRRRRRRRRK......',
                '.KSSSKRRRRRRRRRRRRKK....',
                '.KSsSKLKRRRRRRRRWWWK...',
                '..KKKKLLKRRRRRRRRWWWWK..',
                '.KWWWWWWWWWWWWWWWWWWWWK.',
                'KWWWWWWWWWWWWWWWWWWWWWWK',
                'KRRRRRRRRRRRRRRRRRRRRRK.',
                'KRRRRRRRRRRRRRRRRRRRRK..',
                'KRRWWRRRRRRRRRRRRRRRRK..',
                'KRRWWRRRRRYRRRRRRRRRRK..',
                'KRRRRRRRRRRRRRRRRWWRRK..',
                'KRRRRRRRRRRRRRRRRWWRRK..',
                'KRRRRRRRRRRRRRRRRRRRK...',
                '.KKKKKKKKKKKKKKKKKKKK...',
                '.KgBBBgKKKKKKKKgBBBgK..',
                'KBBBBBBKkkkkkKBBBBBBBK.',
                '.KgBBBgK......KgBBBgK..',
            ], ep);
        });
    }
};
