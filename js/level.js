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
            theme: 0,
            isSolid: function(col, row) {
                return PR.Level._isSolid(col, row);
            }
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
            if (spawn.x <= PR.Camera.x + PR.Camera.viewW + 48) {
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
                    PR.Camera.x + PR.Camera.viewW - 60,
                    this.data.groundY * PR.CONST.TILE_SIZE - 40);
                // Lock camera for boss fight
                PR.Camera.levelWidth = PR.Camera.x + PR.Camera.viewW;
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
        var camX = PR.Camera.x;
        var camY = PR.Camera.y;
        var vw = PR.Camera.viewW;
        var vh = PR.Camera.viewH;

        // Sky gradient (world space, covers full visible area)
        var skyGrad = ctx.createLinearGradient(0, 0, 0, 200);
        skyGrad.addColorStop(0, pal.sky);
        skyGrad.addColorStop(1, pal.skyBottom);
        ctx.fillStyle = skyGrad;
        ctx.fillRect(camX, camY, vw + 1, vh + 1);

        // Sun (fixed relative to viewport)
        var sunX = camX + vw * 0.85;
        if (this.data.theme === PR.CONST.THEME_OUTBACK) {
            PR.SpriteCache.draw(ctx, 'sun', sunX, camY + 8, false);
        } else {
            PR.SpriteCache.draw(ctx, 'sun', sunX, camY + 12, false);
        }

        // Clouds (parallax, fixed to sky regardless of vertical scroll)
        var cloudOffset = PR.Camera.parallaxX(0.05);
        for (var c = 0; c < 8; c++) {
            var cx = camX + (c * 50 + 10) - (cloudOffset % (8 * 50));
            if (cx > camX - 40 && cx < camX + vw + 40) {
                PR.SpriteCache.draw(ctx, 'cloud', cx, camY + 8 + (c % 3) * 8, false);
            }
        }

        // Far background layer (parallax 0.2)
        var farOffset = PR.Camera.parallaxX(0.2);
        var thId = this.data.theme;
        var groundY = this.data.groundY * PR.CONST.TILE_SIZE;
        for (var f = 0; f < 30; f++) {
            var fsx = (f * 80) - farOffset;
            if (fsx > -40 && fsx < vw + 40) {
                var fwx = camX + fsx;
                if (thId === PR.CONST.THEME_URBAN) {
                    PR.SpriteCache.draw(ctx, 'building', fwx, groundY - 60, false);
                } else if (thId === PR.CONST.THEME_REGIONAL && f % 4 === 0) {
                    PR.SpriteCache.draw(ctx, 'silo', fwx, groundY - 50, false);
                } else {
                    PR.SpriteCache.draw(ctx, 'bg_house_far_' + thId, fwx, groundY - 30, false);
                }
            }
        }

        // Near background layer (parallax 0.5)
        var nearOffset = PR.Camera.parallaxX(0.5);
        for (var n = 0; n < 40; n++) {
            var nsx = (n * 60) - nearOffset;
            if (nsx > -50 && nsx < vw + 50) {
                var nwx = camX + nsx;
                if (n % 3 === 0) {
                    var treeKey;
                    if (thId === PR.CONST.THEME_OUTBACK) treeKey = 'dead_tree';
                    else if (thId === PR.CONST.THEME_COASTAL) treeKey = 'palm_tree';
                    else treeKey = 'bg_tree_' + thId;
                    PR.SpriteCache.draw(ctx, treeKey, nwx, groundY - 34, false);
                } else if (n % 3 === 1) {
                    PR.SpriteCache.draw(ctx, 'bg_house_near_' + thId, nwx, groundY - 36, false);
                } else {
                    PR.SpriteCache.draw(ctx, 'bg_fence_' + thId, nwx, groundY - 16, false);
                }
            }
        }
    },

    _renderTilemap: function(ctx) {
        var tm = this.tilemap;
        var ts = PR.CONST.TILE_SIZE;
        var startCol = Math.floor(PR.Camera.x / ts);
        var endCol = startCol + Math.ceil(PR.Camera.viewW / ts) + 1;
        var startRow = Math.max(0, Math.floor(PR.Camera.y / ts));
        var endRow = Math.min(tm.rows - 1, startRow + Math.ceil(PR.Camera.viewH / ts) + 1);
        var thId = tm.theme;

        for (var r = startRow; r <= endRow; r++) {
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

        if (dx > PR.Camera.x - 40 && dx < PR.Camera.x + PR.Camera.viewW + 40) {
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

// Tilemap isSolid helper - defined as standalone function since tilemap is null until init()
PR.Level._isSolid = function(col, row) {
    var tm = PR.Level.tilemap;
    if (!tm || !tm.grid) return false;
    if (row < 0 || row >= tm.rows) return false;
    if (col < 0 || col >= tm.cols) return false;
    return tm.grid[row][col] > 0;
};
