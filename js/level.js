// Postie Run - Level System
PR.Level = {
    current: 0,
    data: null,
    tilemap: null,
    spawnIndex: 0,
    deliveryReached: false,
    levelTimer: 0,
    bossSpawned: false,

    init: function() {
        this.tilemap = {
            grid: [],
            cols: 0,
            rows: 0,
            theme: 0
        };
    },

    load: function(levelIndex) {
        this.current = levelIndex;
        this.data = PR.LevelData[levelIndex];
        this.spawnIndex = 0;
        this.deliveryReached = false;
        this.levelTimer = 0;
        this.bossSpawned = false;

        // Build tilemap
        this._buildTilemap();

        // Reset subsystems
        PR.Enemies.init();
        PR.Projectiles.init();
        PR.Pickups.init();
        PR.Particles.init();

        // Setup camera
        PR.Camera.init(this.data.width);

        // Setup player position
        PR.Player.x = 40;
        PR.Player.y = this.data.groundY * PR.CONST.TILE_SIZE - PR.Player.h - 16;
        PR.Player.vx = 0;
        PR.Player.vy = 0;
        PR.Player.grounded = false;
    },

    _buildTilemap: function() {
        var d = this.data;
        var cols = Math.ceil(d.width / PR.CONST.TILE_SIZE);
        var rows = Math.ceil(PR.CONST.CANVAS_H / PR.CONST.TILE_SIZE) + 1; // 16 rows
        this.tilemap.cols = cols;
        this.tilemap.rows = rows;
        this.tilemap.theme = d.theme;

        // Initialize grid to air
        this.tilemap.grid = [];
        for (var r = 0; r < rows; r++) {
            this.tilemap.grid[r] = [];
            for (var c = 0; c < cols; c++) {
                this.tilemap.grid[r][c] = 0; // 0 = air
            }
        }

        // Fill ground
        var groundRow = d.groundY || (rows - 3);
        for (var gc = 0; gc < cols; gc++) {
            // Surface
            this.tilemap.grid[groundRow][gc] = 1; // 1 = ground surface
            // Below surface
            for (var gr = groundRow + 1; gr < rows; gr++) {
                this.tilemap.grid[gr][gc] = 2; // 2 = dirt
            }
        }

        // Apply terrain variations
        if (d.terrain) {
            for (var t = 0; t < d.terrain.length; t++) {
                var seg = d.terrain[t];
                var startCol = Math.floor(seg.x / PR.CONST.TILE_SIZE);
                var endCol = Math.floor((seg.x + seg.w) / PR.CONST.TILE_SIZE);
                for (var tc = startCol; tc < endCol && tc < cols; tc++) {
                    if (seg.type === 'pit') {
                        // Remove ground
                        for (var pr = 0; pr < rows; pr++) {
                            this.tilemap.grid[pr][tc] = 0;
                        }
                    } else if (seg.type === 'raised') {
                        var newGround = groundRow - seg.height;
                        this.tilemap.grid[newGround][tc] = 1;
                        for (var rr = newGround + 1; rr < groundRow; rr++) {
                            this.tilemap.grid[rr][tc] = 2;
                        }
                    } else if (seg.type === 'lowered') {
                        // Remove ground at normal level, add lower
                        this.tilemap.grid[groundRow][tc] = 0;
                        var lowRow = groundRow + seg.depth;
                        if (lowRow < rows) {
                            this.tilemap.grid[lowRow][tc] = 1;
                        }
                    }
                }
            }
        }

        // Apply platforms
        if (d.platforms) {
            for (var p = 0; p < d.platforms.length; p++) {
                var plat = d.platforms[p];
                var pStartCol = Math.floor(plat.x / PR.CONST.TILE_SIZE);
                var pRow = Math.floor(plat.y / PR.CONST.TILE_SIZE);
                var pWidth = Math.ceil(plat.w / PR.CONST.TILE_SIZE);
                for (var pc = pStartCol; pc < pStartCol + pWidth && pc < cols; pc++) {
                    this.tilemap.grid[pRow][pc] = 3; // 3 = platform
                }
            }
        }
    },

    update: function() {
        this.levelTimer++;

        // Check spawns
        while (this.spawnIndex < this.data.spawns.length) {
            var spawn = this.data.spawns[this.spawnIndex];
            if (spawn.x <= PR.Camera.x + PR.CONST.CANVAS_W + 48) {
                this._doSpawn(spawn);
                this.spawnIndex++;
            } else {
                break;
            }
        }

        // Check delivery
        if (!this.deliveryReached && PR.Player.x >= this.data.width - 60) {
            // Boss level check
            if (this.data.boss && !this.bossSpawned) {
                this.bossSpawned = true;
                PR.Enemies.spawn(this.data.boss.type,
                    PR.Camera.x + PR.CONST.CANVAS_W - 60,
                    this.data.groundY * PR.CONST.TILE_SIZE - 40);
                // Lock camera for boss fight
                PR.Camera.levelWidth = PR.Camera.x + PR.CONST.CANVAS_W;
            } else if (!this.data.boss || (this.bossSpawned && this._bossDefeated())) {
                this.deliveryReached = true;
                PR.Particles.emit(PR.Player.x + 8, PR.Player.y - 4, 'delivery');
                PR.Audio.play('level_complete');
            }
        }
    },

    _bossDefeated: function() {
        for (var i = 0; i < PR.Enemies.list.length; i++) {
            if (PR.Enemies.list[i].isBoss) return false;
        }
        return this.bossSpawned;
    },

    _doSpawn: function(spawn) {
        var groundY = this.data.groundY * PR.CONST.TILE_SIZE;
        switch (spawn.type) {
            case 'dog':
                PR.Enemies.spawn('dog', spawn.x, groundY - 12);
                break;
            case 'magpie':
                PR.Enemies.spawn('magpie', spawn.x, PR.Utils.randInt(30, 80));
                break;
            case 'seagull':
                PR.Enemies.spawn('seagull', spawn.x, PR.Utils.randInt(30, 80));
                break;
            case 'van':
                PR.Enemies.spawn('van', spawn.x, groundY - 24, { fromRight: true });
                break;
            case 'person':
                PR.Enemies.spawn('person', spawn.x, groundY - 24);
                break;
            case 'bin':
                PR.Enemies.spawn('bin', spawn.x, groundY - 16, { rolling: spawn.rolling || false });
                break;
            case 'sprinkler':
                PR.Enemies.spawn('sprinkler', spawn.x, groundY - 8);
                break;
            case 'mower':
                PR.Enemies.spawn('mower', spawn.x, groundY - 14);
                break;
            case 'cat':
                PR.Enemies.spawn('cat', spawn.x, groundY - 28);
                break;
            case 'hose':
                PR.Enemies.spawn('hose', spawn.x, groundY - 8);
                break;
            case 'emu':
                PR.Enemies.spawn('emu', spawn.x, groundY - 24);
                break;
            case 'dropbear':
                PR.Enemies.spawn('dropbear', spawn.x, PR.Utils.randInt(20, 60));
                break;
            case 'roadtrain':
                PR.Enemies.spawn('roadtrain', spawn.x, groundY - 22);
                break;
            case 'pickup':
                PR.Pickups.spawn(spawn.x, groundY - 20, spawn.pickupType || 'health');
                break;
        }
    },

    render: function(ctx) {
        if (!this.data) return;

        // Draw background
        this._renderBackground(ctx);

        // Draw tilemap
        this._renderTilemap(ctx);

        // Draw delivery target at end of level
        this._renderDeliveryTarget(ctx);
    },

    _renderBackground: function(ctx) {
        var pal = PR.CONST.PALETTES[this.data.theme];

        // Sky gradient
        var skyGrad = ctx.createLinearGradient(0, 0, 0, PR.CONST.CANVAS_H);
        skyGrad.addColorStop(0, pal.sky);
        skyGrad.addColorStop(1, pal.skyBottom);
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, PR.CONST.CANVAS_W, PR.CONST.CANVAS_H);

        // Sun (outback has bigger sun)
        if (this.data.theme === PR.CONST.THEME_OUTBACK) {
            PR.SpriteCache.draw(ctx, 'sun', 260, 15, false);
        } else {
            PR.SpriteCache.draw(ctx, 'sun', 270, 20, false);
        }

        // Clouds (parallax 0.1)
        var cloudOffset = PR.Camera.parallaxX(0.05);
        for (var c = 0; c < 8; c++) {
            var cx = (c * 120 + 20) - (cloudOffset % (8 * 120));
            if (cx > -40 && cx < PR.CONST.CANVAS_W + 40) {
                PR.SpriteCache.draw(ctx, 'cloud', cx, 15 + (c % 3) * 12, false);
            }
        }

        // Far background layer (parallax 0.2)
        var farOffset = PR.Camera.parallaxX(0.2);
        var thId = this.data.theme;
        for (var f = 0; f < 20; f++) {
            var fx = (f * 80) - farOffset;
            if (fx > -40 && fx < PR.CONST.CANVAS_W + 40) {
                var groundY = this.data.groundY * PR.CONST.TILE_SIZE;
                if (thId === PR.CONST.THEME_URBAN) {
                    PR.SpriteCache.draw(ctx, 'building', fx, groundY - 60, false);
                } else if (thId === PR.CONST.THEME_REGIONAL && f % 4 === 0) {
                    PR.SpriteCache.draw(ctx, 'silo', fx, groundY - 50, false);
                } else {
                    PR.SpriteCache.draw(ctx, 'bg_house_far_' + thId, fx, groundY - 30, false);
                }
            }
        }

        // Near background layer (parallax 0.5)
        var nearOffset = PR.Camera.parallaxX(0.5);
        for (var n = 0; n < 30; n++) {
            var nx = (n * 60) - nearOffset;
            if (nx > -50 && nx < PR.CONST.CANVAS_W + 50) {
                var gY = this.data.groundY * PR.CONST.TILE_SIZE;
                if (n % 3 === 0) {
                    // Tree
                    var treeKey;
                    if (thId === PR.CONST.THEME_OUTBACK) treeKey = 'dead_tree';
                    else if (thId === PR.CONST.THEME_COASTAL) treeKey = 'palm_tree';
                    else treeKey = 'bg_tree_' + thId;
                    PR.SpriteCache.draw(ctx, treeKey, nx, gY - 34, false);
                } else if (n % 3 === 1) {
                    PR.SpriteCache.draw(ctx, 'bg_house_near_' + thId, nx, gY - 36, false);
                } else {
                    PR.SpriteCache.draw(ctx, 'bg_fence_' + thId, nx, gY - 16, false);
                }
            }
        }
    },

    _renderTilemap: function(ctx) {
        var tm = this.tilemap;
        var startCol = Math.floor(PR.Camera.x / PR.CONST.TILE_SIZE);
        var endCol = startCol + Math.ceil(PR.CONST.CANVAS_W / PR.CONST.TILE_SIZE) + 1;
        var thId = tm.theme;

        for (var r = 0; r < tm.rows; r++) {
            for (var c = startCol; c <= endCol && c < tm.cols; c++) {
                if (c < 0) continue;
                var tile = tm.grid[r][c];
                if (tile === 0) continue;

                var tx = c * PR.CONST.TILE_SIZE;
                var ty = r * PR.CONST.TILE_SIZE;

                var key;
                if (tile === 1) key = 'ground_' + thId;
                else if (tile === 2) key = 'dirt_' + thId;
                else if (tile === 3) key = 'platform_' + thId;
                else key = 'ground_' + thId;

                PR.SpriteCache.draw(ctx, key, tx, ty, false);
            }
        }
    },

    _renderDeliveryTarget: function(ctx) {
        if (!this.data) return;
        var dx = this.data.width - 40;
        var dy = this.data.groundY * PR.CONST.TILE_SIZE - 32;

        if (dx > PR.Camera.x - 40 && dx < PR.Camera.x + PR.CONST.CANVAS_W + 40) {
            var key = this.data.deliveryType === 'locker' ? 'delivery_locker' : 'delivery_house';
            PR.SpriteCache.draw(ctx, key, dx, dy, false);

            // Pulsing arrow above delivery point
            if (!this.deliveryReached) {
                var arrowY = dy - 14 + Math.sin(this.levelTimer * 0.08) * 4;
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.moveTo(dx + 12, arrowY + 8);
                ctx.lineTo(dx + 16, arrowY);
                ctx.lineTo(dx + 20, arrowY + 8);
                ctx.closePath();
                ctx.fill();
            }
        }
    }
};

// Tilemap helper
PR.Level.tilemap.isSolid = function(col, row) {
    if (!PR.Level.tilemap.grid) return false;
    if (row < 0 || row >= PR.Level.tilemap.rows) return false;
    if (col < 0 || col >= PR.Level.tilemap.cols) return false;
    return PR.Level.tilemap.grid[row][col] > 0;
};
