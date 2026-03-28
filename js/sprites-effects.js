// Postie Run - Effect & Projectile Sprites
PR.SpriteEffects = {
    register: function() {
        // PARCEL projectile (8x6)
        PR.SpriteCache.create('proj_parcel', 8, 6, function(ctx) {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, 8, 6);
            ctx.fillStyle = '#8B6914';
            ctx.fillRect(1, 1, 6, 4);
            ctx.fillStyle = '#DDCCAA';
            ctx.fillRect(2, 3, 4, 1); // tape
            ctx.fillRect(3, 1, 1, 4); // tape vertical
        });

        // CANNON parcel (6x5) - faster, smaller
        PR.SpriteCache.create('proj_cannon', 6, 5, function(ctx) {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, 6, 5);
            ctx.fillStyle = '#AA7A24';
            ctx.fillRect(1, 1, 4, 3);
            ctx.fillStyle = '#FFDD44';
            ctx.fillRect(4, 1, 1, 3);
        });

        // LETTER SPRAY (5x3)
        PR.SpriteCache.create('proj_letter', 5, 3, function(ctx) {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, 5, 3);
            ctx.fillStyle = '#F0F0F0';
            ctx.fillRect(1, 0, 3, 3);
            ctx.fillStyle = '#4488CC';
            ctx.fillRect(1, 1, 2, 1); // stamp area
        });

        // NINJA STAMP projectile (8x8) - spinning stamp
        for (var f = 0; f < 4; f++) {
            (function(frame) {
                PR.SpriteCache.create('proj_stamp_' + frame, 10, 10, function(ctx) {
                    ctx.save();
                    ctx.translate(5, 5);
                    ctx.rotate(frame * Math.PI / 2);
                    ctx.translate(-5, -5);
                    // Stamp body
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(1, 1, 8, 8);
                    ctx.fillStyle = '#CC0000';
                    ctx.fillRect(2, 2, 6, 6);
                    // "DELIVERED" cross pattern
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(4, 2, 2, 6);
                    ctx.fillRect(2, 4, 6, 2);
                    // Shuriken points
                    ctx.fillStyle = '#880000';
                    ctx.fillRect(0, 4, 2, 2);
                    ctx.fillRect(8, 4, 2, 2);
                    ctx.fillRect(4, 0, 2, 2);
                    ctx.fillRect(4, 8, 2, 2);
                    ctx.restore();
                });
            })(f);
        }

        // "DELIVERED" stamp mark that appears on stamped enemies (12x8)
        PR.SpriteCache.create('stamp_mark', 14, 8, function(ctx) {
            ctx.fillStyle = '#CC0000';
            ctx.globalAlpha = 0.8;
            ctx.fillRect(0, 0, 14, 8);
            ctx.fillStyle = '#FFFFFF';
            // D
            ctx.fillRect(1, 1, 1, 6);
            ctx.fillRect(2, 1, 1, 1);
            ctx.fillRect(2, 6, 1, 1);
            ctx.fillRect(3, 2, 1, 4);
            // E
            ctx.fillRect(5, 1, 1, 6);
            ctx.fillRect(6, 1, 2, 1);
            ctx.fillRect(6, 3, 1, 1);
            ctx.fillRect(6, 6, 2, 1);
            // L
            ctx.fillRect(9, 1, 1, 6);
            ctx.fillRect(10, 6, 2, 1);
            // !
            ctx.fillRect(13, 1, 1, 4);
            ctx.fillRect(13, 6, 1, 1);
        });

        // ENEMY PROJECTILE - "Sorry we missed you" card (8x6)
        PR.SpriteCache.create('proj_card', 8, 6, function(ctx) {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, 8, 6);
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(1, 1, 6, 4);
            ctx.fillStyle = '#CC2200';
            ctx.fillRect(1, 1, 6, 1);
            ctx.fillStyle = '#444444';
            ctx.fillRect(2, 3, 4, 1);
        });

        // EXPLOSION frames (4 frames, increasing size)
        for (var e = 0; e < 4; e++) {
            (function(frame) {
                var size = 8 + frame * 6;
                PR.SpriteCache.create('explosion_' + frame, size, size, function(ctx) {
                    var cx = size / 2, cy = size / 2;
                    var colors = ['#FF2200', '#FF6600', '#FFCC00', '#FFFFFF'];
                    for (var ring = 3; ring >= 0; ring--) {
                        var r = (size / 2) * ((4 - ring) / 4);
                        if (frame < 2) {
                            PR.SpriteRenderer.circle(ctx, cx, cy, Math.floor(r), colors[ring]);
                        } else {
                            // Later frames are more scattered
                            var fade = frame === 3 ? 0.5 : 0.8;
                            ctx.globalAlpha = fade;
                            PR.SpriteRenderer.circle(ctx, cx, cy, Math.floor(r), colors[ring]);
                            ctx.globalAlpha = 1;
                        }
                    }
                    if (frame >= 2) {
                        // Smoke puffs
                        ctx.globalAlpha = 0.4;
                        PR.SpriteRenderer.circle(ctx, cx - 3, cy - 3, 2, '#888888');
                        PR.SpriteRenderer.circle(ctx, cx + 3, cy - 2, 2, '#888888');
                        ctx.globalAlpha = 1;
                    }
                });
            })(e);
        }

        // PICKUP ICONS
        // Cannon pickup
        PR.SpriteCache.create('pickup_cannon', 12, 10, function(ctx) {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, 12, 10);
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(1, 1, 10, 8);
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(3, 3, 6, 4);
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(5, 3, 1, 4);
            // C
            ctx.fillRect(3, 3, 1, 4);
            ctx.fillRect(4, 3, 2, 1);
            ctx.fillRect(4, 6, 2, 1);
        });

        // Spray pickup
        PR.SpriteCache.create('pickup_spray', 12, 10, function(ctx) {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, 12, 10);
            ctx.fillStyle = '#44AAFF';
            ctx.fillRect(1, 1, 10, 8);
            ctx.fillStyle = '#FFFFFF';
            // S
            ctx.fillRect(4, 2, 4, 1);
            ctx.fillRect(3, 3, 2, 1);
            ctx.fillRect(4, 4, 4, 1);
            ctx.fillRect(6, 5, 2, 1);
            ctx.fillRect(3, 6, 4, 1);
        });

        // Stamp pickup
        PR.SpriteCache.create('pickup_stamp', 12, 10, function(ctx) {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, 12, 10);
            ctx.fillStyle = '#CC0000';
            ctx.fillRect(1, 1, 10, 8);
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(3, 2, 6, 1);
            ctx.fillRect(3, 4, 6, 1);
            ctx.fillRect(3, 6, 6, 1);
            ctx.fillRect(5, 2, 2, 6);
        });

        // Health pickup
        PR.SpriteCache.create('pickup_health', 10, 10, function(ctx) {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, 10, 10);
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(1, 1, 8, 8);
            ctx.fillStyle = '#CC0000';
            ctx.fillRect(4, 2, 2, 6);
            ctx.fillRect(2, 4, 6, 2);
        });

        // eDV pickup
        PR.SpriteCache.create('pickup_edv', 14, 10, function(ctx) {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, 14, 10);
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(1, 1, 12, 8);
            ctx.fillStyle = '#CC2200';
            ctx.fillRect(3, 3, 8, 4);
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(8, 3, 3, 2);
        });

        // DELIVERY TARGETS
        // House (32x32)
        PR.SpriteCache.create('delivery_house', 32, 32, function(ctx) {
            // Roof
            ctx.fillStyle = '#8B4513';
            ctx.beginPath();
            ctx.moveTo(16, 2);
            ctx.lineTo(30, 14);
            ctx.lineTo(2, 14);
            ctx.closePath();
            ctx.fill();
            // Walls
            ctx.fillStyle = '#E8D8C0';
            ctx.fillRect(4, 14, 24, 16);
            // Door
            ctx.fillStyle = '#6B3A1A';
            ctx.fillRect(13, 20, 6, 10);
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(17, 25, 1, 1);
            // Windows
            ctx.fillStyle = '#AADDFF';
            ctx.fillRect(6, 17, 5, 5);
            ctx.fillRect(21, 17, 5, 5);
            // Mailbox
            ctx.fillStyle = '#CC2200';
            ctx.fillRect(28, 22, 3, 4);
            ctx.fillRect(29, 20, 1, 2);
            // Outline
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.strokeRect(4, 14, 24, 16);
        });

        // Parcel locker (24x32)
        PR.SpriteCache.create('delivery_locker', 24, 32, function(ctx) {
            // Main body
            ctx.fillStyle = '#CC2200';
            ctx.fillRect(2, 4, 20, 26);
            ctx.fillStyle = '#000000';
            ctx.fillRect(1, 3, 22, 1);
            ctx.fillRect(1, 30, 22, 1);
            ctx.fillRect(1, 3, 1, 28);
            ctx.fillRect(22, 3, 1, 28);
            // Aus Post logo area
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(6, 6, 12, 4);
            // Compartment doors
            for (var row = 0; row < 3; row++) {
                for (var col = 0; col < 3; col++) {
                    ctx.fillStyle = '#AA1800';
                    ctx.fillRect(4 + col * 6, 12 + row * 6, 5, 5);
                    ctx.fillStyle = '#FFD700';
                    ctx.fillRect(7 + col * 6, 14 + row * 6, 1, 1);
                }
            }
        });

        // WATER SPRAY particle (for sprinklers/hoses)
        PR.SpriteCache.create('water_drop', 2, 2, function(ctx) {
            ctx.fillStyle = '#44AAFF';
            ctx.fillRect(0, 0, 2, 2);
        });

        // BOSS HEALTH BAR background
        PR.SpriteCache.create('boss_bar_bg', 200, 8, function(ctx) {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, 200, 8);
            ctx.fillStyle = '#333333';
            ctx.fillRect(1, 1, 198, 6);
        });
    }
};
