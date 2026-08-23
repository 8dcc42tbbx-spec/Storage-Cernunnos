// Peak Performance: Last Delivery -- player physics, traffic, hazards,
// checkpoints. Everyone travels the same direction (no oncoming lane --
// see README.md sec 3), so "passing" just means the player's world.z
// overtakes a slower car's world.z while their lane positions clear.
PPLD.Entities = {
    player: null,
    cars: [],
    hazards: [],
    events: [],   // drained each frame by game.js/coach.js/hud.js/audio.js

    resetRun: function () {
        this.player = {
            x: 0, z: 0, speed: 0,
            hitTimer: 0, offRoad: false
        };
        this.cars = [];
        this.hazards = [];
        this.events = [];
        this.nextCarId = 1;
    },

    startLeg: function (legIndex) {
        var C = PPLD.CONST;
        var leg = C.LEGS[legIndex];
        this.player.z = PPLD.Road.legStartZ(legIndex);
        this.player.x = 0;
        this.player.hitTimer = 0;
        this.cars.length = 0;
        this.hazards.length = 0;

        var i;
        for (i = 0; i < C.MAX_TRAFFIC; i++) {
            this.cars.push(this.makeCar(leg, this.player.z + 1200 + i * 900));
        }
        for (i = 0; i < C.MAX_HAZARDS; i++) {
            if (this.legHasSpawnedHazard(leg)) {
                this.hazards.push(this.makeHazard(leg, this.player.z + 2200 + i * 2600));
            }
        }
        this.roadtrainSeen = false;
        this.firstHazardSeen = false;
        this.checkpointsHit = {};
    },

    legHasSpawnedHazard: function (leg) {
        return leg.hazard === 'parkedcar' || leg.hazard === 'kangaroo' || leg.hazard === 'blackice';
    },

    makeCar: function (leg, z) {
        var C = PPLD.CONST;
        var type = leg.traffic[Math.floor(Math.random() * leg.traffic.length)];
        var t = C.VEHICLE_TYPES[type];
        return {
            id: this.nextCarId++, type: type,
            x: (Math.random() * 1.4 - 0.7),
            z: z,
            speed: 900 + Math.random() * 900 * leg.trafficDensity,
            w: t.w, h: t.h, xw: t.xw,
            passed: false, hit: false, hitTimer: 0,
            wasAhead: true
        };
    },

    makeHazard: function (leg, z) {
        var C = PPLD.CONST;
        var t = C.HAZARD_TYPES[leg.hazard];
        return {
            type: leg.hazard, z: z,
            x: (Math.random() * 1.2 - 0.6),
            w: t.w, h: t.h, xw: t.xw,
            animT: Math.random() * Math.PI * 2,
            passed: false
        };
    },

    update: function (dt, legIndex, input) {
        var C = PPLD.CONST;
        var leg = C.LEGS[legIndex];
        var p = this.player;
        this.events.length = 0;

        // --- steering & speed ---
        var steer = input.steer;
        p.x += steer * C.STEER_RATE * dt;

        var segIdx = PPLD.Road.findSegmentIndex(p.z);
        var segment = PPLD.Road.segments[segIdx];
        var curve = segment ? segment.curve : 0;
        p.x -= curve * C.CENTRIFUGAL * (p.speed / C.MAX_SPEED);

        p.offRoad = Math.abs(p.x) > C.OFFROAD_LIMIT;

        if (Math.abs(p.x) > C.HARD_WALL) {
            p.x = C.HARD_WALL * (p.x > 0 ? 1 : -1);
            p.speed *= 0.55;
        }

        if (input.accel) p.speed += C.ACCEL * dt;
        else if (input.brake) p.speed += C.BRAKE * dt;
        else p.speed += C.COAST_DECEL * dt;

        var maxSpeed = p.offRoad ? C.OFFROAD_MAX_SPEED : C.MAX_SPEED;
        if (p.offRoad) p.speed += C.OFFROAD_DECEL * dt;
        p.speed = Math.max(0, Math.min(maxSpeed, p.speed));

        p.z += p.speed * dt;
        if (p.hitTimer > 0) p.hitTimer -= dt;

        // --- traffic ---
        var i, car;
        for (i = 0; i < this.cars.length; i++) {
            car = this.cars[i];
            car.z += car.speed * dt;
            if (car.hitTimer > 0) car.hitTimer -= dt; else car.hit = false;

            var relZ = car.z - p.z;
            var isAhead = relZ > 0;

            if (car.type === 'roadtrain' && !this.roadtrainSeen && relZ > 0 && relZ < 6000) {
                this.roadtrainSeen = true;
                this.events.push({ type: 'hazard-sight', key: 'roadtrain' });
            }

            if (Math.abs(relZ) < C.COLLISION_WINDOW && p.hitTimer <= 0 &&
                Math.abs(car.x - p.x) < (car.xw + C.PLAYER_XW)) {
                p.speed *= 0.4;
                p.hitTimer = C.COLLISION_INVULN;
                car.hit = true;
                car.hitTimer = 0.5;
                this.events.push({ type: 'collision-traffic', penalty: C.TIME_TRAFFIC_PENALTY });
            } else if (car.wasAhead && !isAhead && !car.passed) {
                car.passed = true;
                this.events.push({ type: 'overtake' });
            }
            car.wasAhead = isAhead;

            if (car.z < p.z - C.TRAFFIC_RECYCLE_BEHIND) {
                var respawnZ = p.z + C.TRAFFIC_SPAWN_AHEAD * (0.5 + Math.random());
                var fresh = this.makeCar(leg, respawnZ);
                this.cars[i] = fresh;
            }
        }

        // --- hazards ---
        for (i = 0; i < this.hazards.length; i++) {
            var hz = this.hazards[i];
            hz.animT += dt * 4;
            if (hz.type === 'kangaroo') {
                hz.x += Math.sin(hz.animT * 0.5) * dt * 0.25;
            }
            var hrelZ = hz.z - p.z;

            if (!this.firstHazardSeen && hrelZ > 0 && hrelZ < 6000) {
                this.firstHazardSeen = true;
                this.events.push({ type: 'hazard-sight', key: hz.type });
            }

            if (Math.abs(hrelZ) < C.COLLISION_WINDOW && p.hitTimer <= 0 &&
                Math.abs(hz.x - p.x) < (hz.xw + C.PLAYER_XW)) {
                p.speed *= 0.35;
                p.hitTimer = C.COLLISION_INVULN;
                this.events.push({ type: 'collision-hazard', penalty: C.TIME_HAZARD_PENALTY });
            }

            if (hz.z < p.z - C.HAZARD_RECYCLE_BEHIND) {
                var hrespawnZ = p.z + C.HAZARD_SPAWN_AHEAD * (0.5 + Math.random());
                this.hazards[i] = this.makeHazard(leg, hrespawnZ);
            }
        }

        // --- checkpoints ---
        var cps = PPLD.Road.checkpointZs(legIndex);
        for (i = 0; i < cps.length; i++) {
            if (!this.checkpointsHit[i] && p.z >= cps[i]) {
                this.checkpointsHit[i] = true;
                this.events.push({ type: 'checkpoint', index: i });
            }
        }

        // --- leg clear ---
        if (p.z >= PPLD.Road.legEndZ(legIndex)) {
            this.events.push({ type: 'leg-clear' });
        }

        return this.events;
    }
};
