// Peak Performance: Last Delivery -- pseudo-3D segment road
// Classic segment-based projection (the technique behind Enduro's chase
// cam and every OutRun-style pseudo-3D racer since -- see README.md sec 3).
// Road is built once as one continuous track spanning all five legs;
// each leg contributes a run of segments with its own curviness and
// colour pair. Entities (traffic/hazards) are bucketed into whichever
// segment their world.z currently falls in, and rendered inline as the
// road loop reaches that segment -- so they always sit correctly on the
// curve/perspective.
PPLD.Road = {
    segments: [],
    legStartIndex: [],   // segment index where each leg begins
    legEndIndex: [],     // segment index where each leg ends (exclusive)
    cameraDepth: 1,

    init: function () {
        var C = PPLD.CONST;
        this.cameraDepth = 1 / Math.tan((C.FIELD_OF_VIEW / 2) * Math.PI / 180);
        this.buildTrack();
    },

    buildTrack: function () {
        var C = PPLD.CONST;
        this.segments = [];
        this.legStartIndex = [];
        this.legEndIndex = [];

        for (var li = 0; li < C.LEGS.length; li++) {
            var leg = C.LEGS[li];
            this.legStartIndex[li] = this.segments.length;
            this.buildLeg(leg);
            this.legEndIndex[li] = this.segments.length;
        }
    },

    // Alternates straights and curve sections, driven by the leg's
    // "curviness" (0..1). Flat road (no hills) -- see README sec 3/9.
    buildLeg: function (leg) {
        var remaining = leg.lengthSegments;
        // Always open on a short straight so the leg-intro banner has a
        // calm beat before the first curve.
        remaining -= this.addStraight(Math.min(40, remaining), leg);

        while (remaining > 0) {
            var roll = Math.random();
            var pieceLen;
            if (roll < leg.curviness) {
                var curveMag = (0.4 + Math.random() * 1.4) * (0.5 + leg.curviness);
                if (Math.random() < 0.5) curveMag = -curveMag;
                pieceLen = Math.min(30 + Math.floor(Math.random() * 40), remaining);
                remaining -= this.addCurve(pieceLen, curveMag, leg);
            } else {
                pieceLen = Math.min(20 + Math.floor(Math.random() * 40), remaining);
                remaining -= this.addStraight(pieceLen, leg);
            }
        }
    },

    addStraight: function (n, leg) {
        return this.addRoadPiece(n, 0, leg);
    },

    // Eases curve in over the first third, holds, eases out over the
    // last third -- avoids a jarring snap into/out of a bend.
    addCurve: function (n, curve, leg) {
        var third = Math.max(1, Math.floor(n / 3));
        var count = 0;
        for (var i = 0; i < n; i++) {
            var c;
            if (i < third) c = curve * (i / third);
            else if (i > n - third) c = curve * ((n - i) / third);
            else c = curve;
            this.pushSegment(c, leg);
            count++;
        }
        return count;
    },

    addRoadPiece: function (n, curve, leg) {
        for (var i = 0; i < n; i++) this.pushSegment(curve, leg);
        return n;
    },

    pushSegment: function (curve, leg) {
        var C = PPLD.CONST;
        var index = this.segments.length;
        this.segments.push({
            index: index,
            curve: curve,
            leg: leg,
            checkpoint: false,
            p1: { world: { z: index * C.SEGMENT_LENGTH }, camera: {}, screen: {} },
            p2: { world: { z: (index + 1) * C.SEGMENT_LENGTH }, camera: {}, screen: {} },
            cars: [],
            hazards: []
        });
    },

    findSegmentIndex: function (z) {
        var C = PPLD.CONST;
        var i = Math.floor(z / C.SEGMENT_LENGTH);
        if (i < 0) i = 0;
        if (i >= this.segments.length) i = this.segments.length - 1;
        return i;
    },

    totalLength: function () {
        return this.segments.length * PPLD.CONST.SEGMENT_LENGTH;
    },

    legLength: function (legId) {
        var C = PPLD.CONST;
        return C.LEGS[legId].lengthSegments * C.SEGMENT_LENGTH;
    },

    legStartZ: function (legId) {
        return this.legStartIndex[legId] * PPLD.CONST.SEGMENT_LENGTH;
    },

    legEndZ: function (legId) {
        return this.legEndIndex[legId] * PPLD.CONST.SEGMENT_LENGTH;
    },

    checkpointZs: function (legId) {
        var C = PPLD.CONST;
        var start = this.legStartZ(legId), end = this.legEndZ(legId);
        var span = end - start, out = [];
        for (var i = 1; i <= C.CHECKPOINTS_PER_LEG; i++) {
            out.push(start + span * (i / (C.CHECKPOINTS_PER_LEG + 1)));
        }
        return out;
    },

    project: function (p, cameraX, cameraY, cameraZ, width, height, roadWidth) {
        p.camera.x = (p.world.x || 0) - cameraX;
        p.camera.y = (p.world.y || 0) - cameraY;
        p.camera.z = (p.world.z || 0) - cameraZ;
        p.screen.scale = this.cameraDepth / Math.max(1, p.camera.z);
        p.screen.x = Math.round((width / 2) + (p.screen.scale * p.camera.x * width / 2));
        p.screen.y = Math.round((height / 2) - (p.screen.scale * p.camera.y * height / 2));
        p.screen.w = Math.round(p.screen.scale * roadWidth * width / 2);
    },

    // Renders the road + bucketed traffic/hazard sprites for the current
    // frame. `world` = { playerZ, playerX, cars, hazards }.
    render: function (ctx, world, legIndex) {
        var C = PPLD.CONST;
        var width = C.CANVAS_W, height = C.CANVAS_H;
        var leg = C.LEGS[legIndex];
        var roadWidth = C.ROAD_WIDTH;

        this.drawSky(ctx, leg);

        var baseIndex = this.findSegmentIndex(world.playerZ);
        var baseSegment = this.segments[baseIndex];
        if (!baseSegment) return;
        var basePercent = (world.playerZ % C.SEGMENT_LENGTH) / C.SEGMENT_LENGTH;

        // Bucket entities into their current segment for inline drawing.
        this.bucketEntities(world.cars, world.hazards);

        var maxy = height;
        var x = 0, dx = -(baseSegment.curve * basePercent);
        var drawn = [];

        var n, segIdx;
        for (n = 0; n < C.DRAW_DISTANCE; n++) {
            segIdx = baseIndex + n;
            if (segIdx >= this.segments.length) break;
            var segment = this.segments[segIdx];

            this.project(segment.p1, world.playerX * roadWidth - x, C.CAMERA_HEIGHT,
                world.playerZ, width, height, roadWidth);
            this.project(segment.p2, world.playerX * roadWidth - (x + dx), C.CAMERA_HEIGHT,
                world.playerZ, width, height, roadWidth);

            x += dx;
            dx += segment.curve;

            if (segment.p1.camera.z <= this.cameraDepth ||
                segment.p2.screen.y >= segment.p1.screen.y ||
                segment.p2.screen.y >= maxy) {
                continue;
            }

            var depthT = Math.max(0, Math.min(1, n / C.DRAW_DISTANCE));
            this.drawSegment(ctx, segment, leg, width, maxy, depthT);
            drawn.push({ segment: segment, depthT: depthT });

            maxy = segment.p2.screen.y;
        }

        // Draw sprites back-to-front (farthest segment first == reverse
        // of the loop we just ran, since we rendered near->far... draw in
        // reverse of `drawn`, i.e. far segments were pushed last-ish? We
        // rendered near(n=0)->far, so `drawn` is already near-to-far;
        // sprites must paint far-to-near so nearer ones occlude farther
        // ones correctly.
        for (n = drawn.length - 1; n >= 0; n--) {
            this.drawSegmentEntities(ctx, drawn[n].segment, width);
        }

        this.clearBuckets();
    },

    bucketEntities: function (cars, hazards) {
        var i, c;
        for (i = 0; i < cars.length; i++) {
            c = cars[i];
            var si = this.findSegmentIndex(c.z);
            var seg = this.segments[si];
            if (seg) seg.cars.push(c);
        }
        for (i = 0; i < hazards.length; i++) {
            c = hazards[i];
            var hi = this.findSegmentIndex(c.z);
            var hseg = this.segments[hi];
            if (hseg) hseg.hazards.push(c);
        }
    },

    clearBuckets: function () {
        // Only clear the small window we could have touched -- cheap
        // enough to just clear every segment's arrays each frame since
        // JS array truncation is O(1) amortised via length=0.
        for (var i = 0; i < this.segments.length; i++) {
            var s = this.segments[i];
            if (s.cars.length) s.cars.length = 0;
            if (s.hazards.length) s.hazards.length = 0;
        }
    },

    drawSky: function (ctx, leg) {
        var C = PPLD.CONST;
        var grd = ctx.createLinearGradient(0, 0, 0, C.CANVAS_H * 0.42);
        grd.addColorStop(0, leg.sky[0]);
        grd.addColorStop(1, leg.sky[1]);
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, C.CANVAS_W, C.CANVAS_H);
    },

    drawSegment: function (ctx, segment, leg, width, maxy, depthT) {
        var p1 = segment.p1.screen, p2 = segment.p2.screen;
        var idx = segment.index;
        var alt = Math.floor(idx / PPLD.CONST.RUMBLE_LENGTH) % 2 === 0;
        var grassColor = alt ? leg.grass[0] : leg.grass[1];
        var roadColor = alt ? leg.road[0] : leg.road[1];
        var rumbleColor = alt ? leg.rumble[0] : leg.rumble[1];

        // Depth fade toward the sky colour for a cheap fog/atmosphere cue.
        var fadeTo = leg.sky[0];
        grassColor = this.mixColor(grassColor, fadeTo, depthT * 0.35);
        roadColor = this.mixColor(roadColor, fadeTo, depthT * 0.35);
        rumbleColor = this.mixColor(rumbleColor, fadeTo, depthT * 0.35);

        // Grass -- full width of the row.
        ctx.fillStyle = grassColor;
        ctx.fillRect(0, p2.y, width, Math.max(1, p1.y - p2.y));

        // Rumble strip (slightly wider than the road).
        this.polygon(ctx, p1.x - p1.w * 1.14, p1.y, p1.x + p1.w * 1.14, p1.y,
            p2.x + p2.w * 1.14, p2.y, p2.x - p2.w * 1.14, p2.y, rumbleColor);

        // Road surface.
        this.polygon(ctx, p1.x - p1.w, p1.y, p1.x + p1.w, p1.y,
            p2.x + p2.w, p2.y, p2.x - p2.w, p2.y, roadColor);

        // Lane centre dashes -- only every other RUMBLE_LENGTH grouping,
        // like Enduro's own dashed centre line.
        if (Math.floor(idx / PPLD.CONST.LANE_MARKER_LENGTH) % 2 === 0) {
            var laneW1 = p1.w * 0.04, laneW2 = p2.w * 0.04;
            this.polygon(ctx, p1.x - laneW1, p1.y, p1.x + laneW1, p1.y,
                p2.x + laneW2, p2.y, p2.x - laneW2, p2.y, leg.lane);
        }
    },

    drawSegmentEntities: function (ctx, segment, width) {
        var p = segment.p1.screen;
        var i;
        for (i = 0; i < segment.hazards.length; i++) {
            this.drawSprite(ctx, segment, segment.hazards[i], width, 'hazard');
        }
        for (i = 0; i < segment.cars.length; i++) {
            this.drawSprite(ctx, segment, segment.cars[i], width, 'car');
        }
    },

    drawSprite: function (ctx, segment, entity, width, kind) {
        var scale = segment.p1.screen.scale;
        if (!scale || scale <= 0) return;
        var roadCenterX = segment.p1.screen.x;
        var spriteX = roadCenterX + (scale * entity.x * PPLD.CONST.ROAD_WIDTH * width / 2);
        var spriteY = segment.p1.screen.y;
        var spriteScale = scale * 1.6;
        var w = entity.w * spriteScale, h = entity.h * spriteScale;
        if (w < 1 || h < 1) return;

        if (kind === 'car') {
            PPLD.Sprites.drawVehicle(ctx, spriteX, spriteY, w, h, entity);
        } else {
            PPLD.Sprites.drawHazard(ctx, spriteX, spriteY, w, h, entity);
        }
    },

    mixColor: function (hex, hex2, t) {
        var c1 = this.hexToRgb(hex), c2 = this.hexToRgb(hex2);
        var r = Math.round(c1.r + (c2.r - c1.r) * t);
        var g = Math.round(c1.g + (c2.g - c1.g) * t);
        var b = Math.round(c1.b + (c2.b - c1.b) * t);
        return 'rgb(' + r + ',' + g + ',' + b + ')';
    },

    hexToRgb: function (hex) {
        hex = hex.replace('#', '');
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        var num = parseInt(hex, 16);
        return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
    },

    polygon: function (ctx, x1, y1, x2, y2, x3, y3, x4, y4, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.lineTo(x4, y4);
        ctx.closePath();
        ctx.fill();
    }
};
