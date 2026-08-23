// Peak Performance: Last Delivery -- procedural placeholder sprites.
// No PNGs exist yet (see prompts/art-prompts.md for the real SNES-style
// art to generate later) -- these draw simple, readable canvas shapes in
// the same palette the art prompts specify, so the game is fully
// playable now and drop-in-compatible with real sprites later.
PPLD.Sprites = {

    drawVehicle: function (ctx, x, y, w, h, entity) {
        var type = PPLD.CONST.VEHICLE_TYPES[entity.type] || PPLD.CONST.VEHICLE_TYPES.sedan;
        var color = entity.hit ? '#ff6b5c' : type.color;
        ctx.save();
        ctx.translate(x, y);

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(0, h * 0.06, w * 0.48, h * 0.14, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.fillStyle = color;
        this.roundRect(ctx, -w / 2, -h, w, h * 0.82, w * 0.08);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.55)';
        ctx.lineWidth = Math.max(1, w * 0.02);
        ctx.stroke();

        // Roof band
        ctx.fillStyle = type.dark;
        ctx.fillRect(-w * 0.32, -h * 0.95, w * 0.64, h * 0.28);

        // Tail lights
        ctx.fillStyle = '#ff3b30';
        ctx.fillRect(-w * 0.46, -h * 0.28, w * 0.12, h * 0.16);
        ctx.fillRect(w * 0.34, -h * 0.28, w * 0.12, h * 0.16);

        ctx.restore();
    },

    drawHazard: function (ctx, x, y, w, h, entity) {
        var type = PPLD.CONST.HAZARD_TYPES[entity.type] || PPLD.CONST.HAZARD_TYPES.parkedcar;
        ctx.save();
        ctx.translate(x, y);

        if (entity.type === 'kangaroo') {
            var hop = Math.sin(entity.animT || 0) * h * 0.18;
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.ellipse(0, 0, w * 0.5, h * 0.12, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = type.color;
            ctx.beginPath();
            ctx.ellipse(0, -h * 0.5 - hop, w * 0.42, h * 0.42, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(-w * 0.1, -h * 0.95 - hop, w * 0.2, h * 0.4);
        } else if (entity.type === 'blackice') {
            ctx.fillStyle = 'rgba(207,232,242,0.55)';
            ctx.beginPath();
            ctx.ellipse(0, -h * 0.3, w * 0.5, h * 1.2, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (entity.type === 'whiteout') {
            // Rendered by weather.js as a screen overlay, not a sprite.
        } else {
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.ellipse(0, h * 0.06, w * 0.48, h * 0.14, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = type.color;
            this.roundRect(ctx, -w / 2, -h, w, h * 0.85, w * 0.06);
            ctx.fill();
            ctx.strokeStyle = 'rgba(0,0,0,0.5)';
            ctx.lineWidth = Math.max(1, w * 0.02);
            ctx.stroke();
        }
        ctx.restore();
    },

    // Player van drawn in fixed screen position; `lean` -1..1 for steer
    // tilt, `braking`/`night` toggle light states per README sec 8/
    // prompts art-prompts.md Prompt 1.
    drawPlayer: function (ctx, cx, cy, lean, braking, night, hitFlash) {
        var C = PPLD.CONST.COL;
        var w = 46, h = 40;
        ctx.save();
        ctx.translate(cx + lean * 10, cy);
        ctx.rotate(lean * 0.06);

        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(0, h * 0.42, w * 0.55, h * 0.14, 0, 0, Math.PI * 2);
        ctx.fill();

        if (night) {
            ctx.fillStyle = 'rgba(255,233,168,0.18)';
            ctx.beginPath();
            ctx.moveTo(-w * 0.4, -h * 0.1);
            ctx.lineTo(-w * 1.1, h * 0.9);
            ctx.lineTo(w * 1.1, h * 0.9);
            ctx.lineTo(w * 0.4, -h * 0.1);
            ctx.closePath();
            ctx.fill();
        }

        ctx.fillStyle = hitFlash ? '#ffffff' : C.VAN_RED;
        this.roundRect(ctx, -w / 2, -h * 0.5, w, h * 0.86, 6);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = C.VAN_ROOF;
        ctx.fillRect(-w * 0.34, -h * 0.48, w * 0.68, h * 0.22);
        ctx.fillStyle = C.VAN_WINDOW;
        ctx.fillRect(-w * 0.28, -h * 0.26, w * 0.56, h * 0.16);

        ctx.fillStyle = braking ? C.BRAKE_RED : '#7a1216';
        ctx.fillRect(-w * 0.46, h * 0.14, w * 0.14, h * 0.14);
        ctx.fillRect(w * 0.32, h * 0.14, w * 0.14, h * 0.14);
        if (braking) {
            ctx.shadowColor = C.BRAKE_RED;
            ctx.shadowBlur = 8;
            ctx.fillRect(-w * 0.46, h * 0.14, w * 0.14, h * 0.14);
            ctx.fillRect(w * 0.32, h * 0.14, w * 0.14, h * 0.14);
            ctx.shadowBlur = 0;
        }

        if (night) {
            ctx.fillStyle = C.HEADLIGHT;
            ctx.fillRect(-w * 0.42, -h * 0.5, w * 0.1, h * 0.08);
            ctx.fillRect(w * 0.32, -h * 0.5, w * 0.1, h * 0.08);
        }

        ctx.restore();
    },

    // Coach portrait bust for the HUD popup -- expression: 'neutral' |
    // 'pumped' | 'alert'; talking: bool drives the mouth-open frame.
    drawCoachPortrait: function (ctx, cx, cy, r, expression, talking) {
        var C = PPLD.CONST.COL;
        ctx.save();
        ctx.translate(cx, cy);

        ctx.fillStyle = C.UI_GOLD;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1a1420';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2);
        ctx.fill();

        // Jacket shoulders
        ctx.fillStyle = C.COACH_RED;
        ctx.beginPath();
        ctx.ellipse(0, r * 0.62, r * 0.72, r * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = C.COACH_SKIN;
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.12, r * 0.42, r * 0.48, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hair bun
        ctx.fillStyle = C.COACH_HAIR;
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.5, r * 0.4, r * 0.22, 0, 0, Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, -r * 0.72, r * 0.16, 0, Math.PI * 2);
        ctx.fill();

        // Eyebrows (alert = angled in)
        ctx.strokeStyle = C.COACH_HAIR;
        ctx.lineWidth = Math.max(1, r * 0.06);
        ctx.beginPath();
        if (expression === 'alert') {
            ctx.moveTo(-r * 0.28, -r * 0.28); ctx.lineTo(-r * 0.06, -r * 0.2);
            ctx.moveTo(r * 0.28, -r * 0.28); ctx.lineTo(r * 0.06, -r * 0.2);
        } else {
            ctx.moveTo(-r * 0.26, -r * 0.24); ctx.lineTo(-r * 0.06, -r * 0.26);
            ctx.moveTo(r * 0.26, -r * 0.24); ctx.lineTo(r * 0.06, -r * 0.26);
        }
        ctx.stroke();

        // Mouth: talking alternates open/closed
        ctx.fillStyle = '#5a2620';
        if (talking) {
            ctx.beginPath();
            ctx.ellipse(0, r * 0.18, r * (expression === 'pumped' ? 0.22 : 0.14),
                r * (expression === 'pumped' ? 0.16 : 0.09), 0, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillRect(-r * 0.14, r * 0.16, r * 0.28, r * 0.05);
        }

        ctx.restore();
    },

    roundRect: function (ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }
};
