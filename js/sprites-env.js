// Postie Run - Environment / Background Sprites
PR.SpriteEnvironment = {
    register: function() {
        // Register tile sprites for each theme
        var themes = PR.CONST.PALETTES;

        for (var t = 0; t < 5; t++) {
            (function(themeId) {
                var p = themes[themeId];

                // Ground surface tile
                PR.SpriteCache.create('ground_' + themeId, 16, 16, function(ctx) {
                    ctx.fillStyle = p.ground;
                    ctx.fillRect(0, 0, 16, 16);
                    ctx.fillStyle = p.groundDark;
                    ctx.fillRect(0, 0, 16, 2);
                    // Texture
                    for (var i = 0; i < 4; i++) {
                        ctx.fillStyle = p.groundDark;
                        ctx.fillRect(PR.Utils.randInt(0, 14), PR.Utils.randInt(3, 14), 2, 1);
                    }
                });

                // Ground subsurface (dirt)
                PR.SpriteCache.create('dirt_' + themeId, 16, 16, function(ctx) {
                    ctx.fillStyle = p.groundDark;
                    ctx.fillRect(0, 0, 16, 16);
                    for (var i = 0; i < 3; i++) {
                        ctx.fillStyle = p.ground;
                        ctx.fillRect(PR.Utils.randInt(0, 14), PR.Utils.randInt(0, 14), 2, 1);
                    }
                });

                // Road tile
                PR.SpriteCache.create('road_' + themeId, 16, 16, function(ctx) {
                    ctx.fillStyle = p.road;
                    ctx.fillRect(0, 0, 16, 16);
                    // Road line (dashed)
                    ctx.fillStyle = p.roadLine;
                    ctx.fillRect(4, 7, 8, 2);
                });

                // Platform (fence/awning)
                PR.SpriteCache.create('platform_' + themeId, 16, 8, function(ctx) {
                    ctx.fillStyle = p.fence;
                    ctx.fillRect(0, 0, 16, 8);
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(0, 0, 16, 1);
                    ctx.fillRect(0, 7, 16, 1);
                    // Pickets
                    ctx.fillRect(2, 0, 1, 8);
                    ctx.fillRect(7, 0, 1, 8);
                    ctx.fillRect(13, 0, 1, 8);
                });

            })(t);
        }

        // Register background drawing functions (these draw onto full-width canvases per level)
        // Background layer sprites - houses for each theme
        for (var th = 0; th < 5; th++) {
            (function(themeId) {
                var p = themes[themeId];

                // Far background house silhouette
                PR.SpriteCache.create('bg_house_far_' + themeId, 32, 24, function(ctx) {
                    ctx.fillStyle = p.house2;
                    ctx.fillRect(2, 8, 28, 16);
                    // Roof
                    ctx.fillStyle = p.roof;
                    ctx.beginPath();
                    ctx.moveTo(16, 0);
                    ctx.lineTo(32, 10);
                    ctx.lineTo(0, 10);
                    ctx.closePath();
                    ctx.fill();
                    // Windows
                    ctx.fillStyle = '#FFEEAA';
                    ctx.globalAlpha = 0.5;
                    ctx.fillRect(5, 13, 4, 4);
                    ctx.fillRect(14, 13, 4, 4);
                    ctx.fillRect(23, 13, 4, 4);
                    ctx.globalAlpha = 1;
                });

                // Near background house
                PR.SpriteCache.create('bg_house_near_' + themeId, 40, 32, function(ctx) {
                    ctx.fillStyle = p.house1;
                    ctx.fillRect(2, 10, 36, 22);
                    // Roof
                    ctx.fillStyle = p.roof;
                    ctx.beginPath();
                    ctx.moveTo(20, 0);
                    ctx.lineTo(40, 12);
                    ctx.lineTo(0, 12);
                    ctx.closePath();
                    ctx.fill();
                    // Door
                    ctx.fillStyle = '#6B3A1A';
                    ctx.fillRect(16, 20, 8, 12);
                    // Windows
                    ctx.fillStyle = '#AADDFF';
                    ctx.fillRect(4, 15, 8, 8);
                    ctx.fillRect(28, 15, 8, 8);
                    // Window frames
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(7, 15, 2, 8);
                    ctx.fillRect(4, 18, 8, 2);
                    ctx.fillRect(31, 15, 2, 8);
                    ctx.fillRect(28, 18, 8, 2);
                });

                // Tree
                PR.SpriteCache.create('bg_tree_' + themeId, 20, 32, function(ctx) {
                    // Trunk
                    ctx.fillStyle = p.treeTrunk;
                    ctx.fillRect(8, 16, 4, 16);
                    // Canopy
                    ctx.fillStyle = p.tree;
                    PR.SpriteRenderer.circle(ctx, 10, 10, 8, p.tree);
                    PR.SpriteRenderer.circle(ctx, 6, 12, 5, p.tree);
                    PR.SpriteRenderer.circle(ctx, 14, 12, 5, p.tree);
                });

                // Fence segment
                PR.SpriteCache.create('bg_fence_' + themeId, 16, 16, function(ctx) {
                    ctx.fillStyle = p.fence;
                    // Posts
                    ctx.fillRect(1, 4, 2, 12);
                    ctx.fillRect(13, 4, 2, 12);
                    // Rails
                    ctx.fillRect(0, 6, 16, 2);
                    ctx.fillRect(0, 12, 16, 2);
                    // Post caps
                    ctx.fillRect(0, 3, 4, 2);
                    ctx.fillRect(12, 3, 4, 2);
                });

            })(th);
        }

        // OUTBACK specific: dead tree
        PR.SpriteCache.create('dead_tree', 16, 28, function(ctx) {
            ctx.fillStyle = '#7B5230';
            ctx.fillRect(6, 8, 4, 20);
            ctx.fillRect(2, 6, 4, 3);
            ctx.fillRect(10, 4, 4, 3);
            ctx.fillRect(0, 4, 3, 2);
            ctx.fillRect(13, 2, 3, 2);
        });

        // COASTAL specific: palm tree
        PR.SpriteCache.create('palm_tree', 20, 36, function(ctx) {
            ctx.fillStyle = '#8B6B4B';
            ctx.fillRect(8, 12, 4, 24);
            ctx.fillRect(9, 10, 2, 4);
            // Fronds
            ctx.fillStyle = '#40884A';
            // Left frond
            ctx.fillRect(0, 4, 10, 2);
            ctx.fillRect(1, 2, 8, 2);
            ctx.fillRect(2, 6, 6, 2);
            // Right frond
            ctx.fillRect(10, 4, 10, 2);
            ctx.fillRect(11, 2, 8, 2);
            ctx.fillRect(12, 6, 6, 2);
            // Top frond
            ctx.fillRect(6, 0, 8, 2);
            ctx.fillRect(8, 0, 4, 4);
            // Coconuts
            ctx.fillStyle = '#6B4020';
            ctx.fillRect(7, 8, 2, 2);
            ctx.fillRect(11, 9, 2, 2);
        });

        // URBAN specific: building silhouette
        PR.SpriteCache.create('building', 32, 48, function(ctx) {
            ctx.fillStyle = '#707080';
            ctx.fillRect(0, 0, 32, 48);
            ctx.fillStyle = '#606070';
            ctx.fillRect(0, 0, 32, 2);
            // Windows grid
            for (var row = 0; row < 6; row++) {
                for (var col = 0; col < 4; col++) {
                    ctx.fillStyle = Math.random() > 0.3 ? '#FFEEAA' : '#445566';
                    ctx.globalAlpha = 0.6;
                    ctx.fillRect(3 + col * 7, 4 + row * 7, 4, 4);
                }
            }
            ctx.globalAlpha = 1;
        });

        // REGIONAL specific: silo
        PR.SpriteCache.create('silo', 16, 40, function(ctx) {
            ctx.fillStyle = '#BBAA88';
            ctx.fillRect(2, 8, 12, 32);
            // Dome top
            PR.SpriteRenderer.circle(ctx, 8, 8, 6, '#CCBB99');
            // Bands
            ctx.fillStyle = '#999988';
            ctx.fillRect(2, 16, 12, 1);
            ctx.fillRect(2, 24, 12, 1);
            ctx.fillRect(2, 32, 12, 1);
        });

        // Clouds
        PR.SpriteCache.create('cloud', 32, 12, function(ctx) {
            ctx.fillStyle = '#FFFFFF';
            ctx.globalAlpha = 0.7;
            PR.SpriteRenderer.circle(ctx, 10, 6, 5, '#FFFFFF');
            PR.SpriteRenderer.circle(ctx, 18, 5, 6, '#FFFFFF');
            PR.SpriteRenderer.circle(ctx, 26, 7, 4, '#FFFFFF');
            PR.SpriteRenderer.circle(ctx, 14, 8, 4, '#FFFFFF');
            PR.SpriteRenderer.circle(ctx, 22, 8, 4, '#FFFFFF');
            ctx.globalAlpha = 1;
        });

        // Sun
        PR.SpriteCache.create('sun', 16, 16, function(ctx) {
            PR.SpriteRenderer.circle(ctx, 8, 8, 6, '#FFE844');
            PR.SpriteRenderer.circle(ctx, 8, 8, 4, '#FFFF88');
        });
    }
};
