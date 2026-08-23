// Peak Performance: Last Delivery -- constants & leg data
var PPLD = {};

PPLD.CONST = {
    // Display
    CANVAS_W: 320,
    CANVAS_H: 224,

    // Touch controls -- fixed translucent joystick (steer) bottom-left,
    // accelerate button bottom-right. All in canvas-space pixels (the
    // same 320x224 space everything else draws in). Grab/hold zones are
    // deliberately much bigger than the visuals -- a full bottom-left/
    // bottom-right quadrant each -- so a thumb doesn't need to land
    // precisely on the small drawn circle.
    TOUCH: {
        ZONE_TOP_Y: 94,       // catch zones start below this y
        ZONE_SPLIT_X: 160,    // left half = joystick catch, right = accel catch
        JOY_CX: 50, JOY_CY: 168, JOY_R: 28, JOY_NUB_R: 13,
        ACCEL_CX: 270, ACCEL_CY: 168, ACCEL_R: 30
    },

    // Pseudo-3D segment-road projection (Enduro/OutRun-style chase cam)
    SEGMENT_LENGTH: 200,
    ROAD_WIDTH: 1600,
    // Calibrated against the 320x224 canvas so a car/hazard within a few
    // hundred world units (i.e. anywhere near collision range) actually
    // projects onto the visible screen instead of far below it -- see
    // the "nothing visible" bug write-up in git history for the numbers.
    CAMERA_HEIGHT: 240,
    FIELD_OF_VIEW: 110,
    DRAW_DISTANCE: 150,
    RUMBLE_LENGTH: 3,
    LANE_MARKER_LENGTH: 5,

    // Player physics (world units / second)
    MAX_SPEED: 3200,
    ACCEL: 1900,
    BRAKE: -3800,
    COAST_DECEL: -950,
    OFFROAD_DECEL: -2700,
    OFFROAD_MAX_SPEED: 1450,
    OFFROAD_LIMIT: 1.0,        // |playerX| beyond this is off the bitumen
    HARD_WALL: 2.6,            // |playerX| beyond this bounces the van back
    CENTRIFUGAL: 0.0038,       // curve pull on playerX, scaled by speed
    STEER_RATE: 2.7,           // playerX units / second at full steer input

    // Traffic
    MAX_TRAFFIC: 8,
    TRAFFIC_MIN_GAP: 1400,     // world units between spawned cars
    TRAFFIC_SPAWN_AHEAD: 9000,
    TRAFFIC_RECYCLE_BEHIND: 2200,
    COLLISION_WINDOW: 130,     // world-z tolerance for a hit
    COLLISION_INVULN: 1.1,     // seconds of grace after a hit

    // Hazards
    MAX_HAZARDS: 3,
    HAZARD_SPAWN_AHEAD: 8000,
    HAZARD_RECYCLE_BEHIND: 2200,
    HAZARD_MIN_GAP: 2600,

    // Endurance clock (real seconds -- the actual fail-state resource)
    TIME_START: 480,
    TIME_OVERTAKE_BONUS: 2,
    TIME_CHECKPOINT_BONUS: 18,
    TIME_LEG_CLEAR_BONUS: 25,
    TIME_HAZARD_PENALTY: 10,
    TIME_TRAFFIC_PENALTY: 6,
    LOW_TIME_WARNING: 45,

    // Fictional dashboard clock, purely cosmetic: 8:30pm -> midnight,
    // mapped from the fraction of TIME_START remaining.
    CLOCK_START_MIN: 20 * 60 + 30,   // 8:30pm, in minutes-of-day
    CLOCK_END_MIN: 24 * 60,          // midnight

    CHECKPOINTS_PER_LEG: 3,

    STATE_TITLE: 0,
    STATE_LEG_INTRO: 1,
    STATE_PLAYING: 2,
    STATE_LEG_CLEAR: 3,
    STATE_RESULTS_WIN: 4,
    STATE_RESULTS_LOSE: 5,
    STATE_PAUSED: 6,

    // `xw` = normalized half-width used for lane placement/collision
    // (independent of `w`/`h`, which are just the placeholder sprite's
    // pixel size). Player's own normalized half-width is PLAYER_XW.
    PLAYER_XW: 0.13,

    VEHICLE_TYPES: {
        sedan:     { w: 70,  h: 34, color: '#c0392b', dark: '#7a2419', xw: 0.15 },
        ute:       { w: 74,  h: 32, color: '#e8e8e8', dark: '#a8a8a8', xw: 0.16 },
        tractor:   { w: 56,  h: 44, color: '#3d6b35', dark: '#274522', xw: 0.13 },
        roadtrain: { w: 96,  h: 46, color: '#5a4230', dark: '#382a1e', xw: 0.22 },
        rival:     { w: 72,  h: 36, color: '#2c5f8a', dark: '#1c3f5c', xw: 0.16 }
    },

    // Positional hazards only -- leg 2's "road train" hazard is just the
    // first roadtrain traffic spawn (see entities.js), and leg 5's
    // "whiteout" is a weather pulse (see weather.js), neither is a
    // spawned hazard entity.
    HAZARD_TYPES: {
        parkedcar: { w: 68, h: 32, color: '#8a6d4b', label: 'parked car', xw: 0.15 },
        kangaroo:  { w: 30, h: 40, color: '#9c8064', label: 'kangaroo', xw: 0.09 },
        blackice:  { w: 90, h: 10, color: '#cfe8f2', label: 'black ice', xw: 0.17 }
    },

    // The five legs -- palettes are [light, dark] alternating shade pairs,
    // same technique across every leg, different mood per leg (see
    // ../prompts/art-prompts.md envs 4-8 and README.md sec 3-4/8).
    LEGS: [
        {
            id: 0, key: 'suburban', name: 'Suburban Sprint',
            lengthSegments: 480, curviness: 0.30,
            weather: 'clear', night: false,
            sky: ['#8ec9ec', '#c7ecf8'],
            road: ['#6b6b6b', '#616161'],
            rumble: ['#b6483a', '#e2e2e2'],
            grass: ['#4a7a2e', '#3a6a1e'],
            lane: '#d8d060',
            hazard: 'parkedcar',
            traffic: ['sedan', 'ute'],
            trafficDensity: 0.55
        },
        {
            id: 1, key: 'highway', name: 'Highway Dash',
            lengthSegments: 560, curviness: 0.45,
            weather: 'rain', night: false, dusk: true,
            sky: ['#3a2a55', '#e08a3c'],
            road: ['#47474e', '#3f3f46'],
            rumble: ['#d8d8d8', '#332222'],
            grass: ['#355622', '#2a4a1a'],
            lane: '#d8d060',
            hazard: 'roadtrain',
            traffic: ['sedan', 'ute', 'roadtrain'],
            trafficDensity: 0.7
        },
        {
            id: 2, key: 'country', name: 'Country Backroads',
            lengthSegments: 560, curviness: 0.6,
            weather: 'fog', night: true,
            sky: ['#0c1220', '#28324a'],
            road: ['#37373c', '#2f2f34'],
            rumble: ['#cfcfcf', '#2a2a2a'],
            grass: ['#12200f', '#0d180b'],
            lane: '#9a9a55',
            hazard: 'kangaroo',
            traffic: ['sedan', 'tractor'],
            trafficDensity: 0.45
        },
        {
            id: 3, key: 'mountain', name: 'Mountain Pass',
            lengthSegments: 620, curviness: 0.75,
            weather: 'snow', night: true,
            sky: ['#050a18', '#132038'],
            road: ['#5a6472', '#525c68'],
            rumble: ['#e8f0f5', '#3a4048'],
            grass: ['#1c2a1c', '#141f14'],
            lane: '#c8d8e0',
            hazard: 'blackice',
            traffic: ['sedan', 'ute'],
            trafficDensity: 0.5
        },
        {
            id: 4, key: 'final', name: 'Last Delivery',
            lengthSegments: 680, curviness: 0.85,
            weather: 'blizzard', night: true,
            sky: ['#08060f', '#241a30'],
            road: ['#dfe8ee', '#cfd8e0'],
            rumble: ['#ffffff', '#c8d0d8'],
            grass: ['#1a1a24', '#12121a'],
            lane: '#e8e8f0',
            hazard: 'whiteout',
            traffic: ['sedan', 'ute', 'roadtrain', 'tractor', 'rival'],
            trafficDensity: 0.8
        }
    ],

    COL: {
        VAN_RED: '#c8202a',
        VAN_ROOF: '#f2f0ea',
        VAN_WINDOW: '#2b3440',
        BRAKE_RED: '#ff3b30',
        HEADLIGHT: '#ffe9a8',
        COACH_RED: '#c8202a',
        COACH_SKIN: '#e8b98f',
        COACH_HAIR: '#1e1812',
        UI_WHITE: '#ffffff',
        UI_GOLD: '#ffd166',
        UI_RED: '#e63946',
        UI_SHADOW: 'rgba(0,0,0,0.55)',
        UI_BG: 'rgba(10,8,20,0.72)'
    }
};
