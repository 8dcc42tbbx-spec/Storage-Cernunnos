// Postie Run - Game Constants
var PR = {};

PR.CONST = {
    // Display
    CANVAS_W: 320,
    CANVAS_H: 240,
    SCALE: 3,
    ZOOM: 2.5,
    TILE_SIZE: 16,

    // Physics
    GRAVITY: 0.4,
    MAX_FALL: 6,
    FRICTION: 0.85,

    // Player
    PLAYER_SPEED: 1.8,
    PLAYER_JUMP: -5.5,
    PLAYER_MAX_HP: 5,
    PLAYER_LIVES: 3,
    CONTINUES: 3,
    INVINCIBLE_TIME: 90, // frames

    // eDV Vehicle
    EDV_SPEED: 3.0,
    EDV_HP: 10,
    EDV_DURATION: 900, // 15 seconds at 60fps

    // Weapons
    WEAPON_PARCEL: 0,
    WEAPON_CANNON: 1,
    WEAPON_SPRAY: 2,
    WEAPON_STAMP: 3,

    WEAPON_NAMES: ['PARCEL', 'CANNON', 'SPRAY', 'STAMP'],

    // Weapon ammo (default parcel is infinite)
    AMMO_CANNON: 40,
    AMMO_SPRAY: 30,
    AMMO_STAMP: 15,

    // Projectile speeds
    PROJ_PARCEL_SPEED: 3,
    PROJ_CANNON_SPEED: 5,
    PROJ_SPRAY_SPEED: 4,
    PROJ_STAMP_SPEED: 4.5,

    // Enemy types
    ENEMY_DOG: 'dog',
    ENEMY_VAN: 'van',
    ENEMY_MAGPIE: 'magpie',
    ENEMY_PERSON: 'person',
    ENEMY_BIN: 'bin',
    ENEMY_SPRINKLER: 'sprinkler',
    ENEMY_MOWER: 'mower',
    ENEMY_CAT: 'cat',
    ENEMY_HOSE: 'hose',
    ENEMY_EMU: 'emu',
    ENEMY_DROPBEAR: 'dropbear',
    ENEMY_ROADTRAIN: 'roadtrain',
    ENEMY_SEAGULL: 'seagull',
    ENEMY_ROTTWEILER: 'rottweiler',
    ENEMY_CHIHUAHUA: 'chihuahua',

    // Themes
    THEME_SUBURBAN: 0,
    THEME_URBAN: 1,
    THEME_REGIONAL: 2,
    THEME_COASTAL: 3,
    THEME_OUTBACK: 4,

    // Theme palettes
    PALETTES: {
        0: { // Suburban
            sky: '#87CEEB',
            skyBottom: '#B0E0F0',
            ground: '#4A7A2E',
            groundDark: '#3A6A1E',
            road: '#6B6B6B',
            roadLine: '#CCCC44',
            fence: '#C8A870',
            house1: '#E8D8C0',
            house2: '#C4A882',
            roof: '#8B4513',
            tree: '#2D5A1E',
            treeTrunk: '#6B4226'
        },
        1: { // Urban
            sky: '#7AACCF',
            skyBottom: '#A0C8D8',
            ground: '#555555',
            groundDark: '#444444',
            road: '#4A4A4A',
            roadLine: '#CCCC44',
            fence: '#888888',
            house1: '#B0B0B0',
            house2: '#909090',
            roof: '#606060',
            tree: '#2A4A1A',
            treeTrunk: '#5A3A1A'
        },
        2: { // Regional
            sky: '#92D4F0',
            skyBottom: '#C8E8F4',
            ground: '#6B8A3E',
            groundDark: '#5A7A2E',
            road: '#8B7B6B',
            roadLine: '#CCCC44',
            fence: '#A08050',
            house1: '#D8C8A0',
            house2: '#B8A880',
            roof: '#704020',
            tree: '#3A6A20',
            treeTrunk: '#7B5230'
        },
        3: { // Coastal
            sky: '#60C0E8',
            skyBottom: '#A0D8F0',
            ground: '#D4C890',
            groundDark: '#C0B478',
            road: '#E8DCC0',
            roadLine: '#CCCC44',
            fence: '#E0D0B0',
            house1: '#F0E8D8',
            house2: '#D8D0C0',
            roof: '#4488AA',
            tree: '#40884A',
            treeTrunk: '#7B5230'
        },
        4: { // Outback
            sky: '#E8A840',
            skyBottom: '#F0C870',
            ground: '#B85A30',
            groundDark: '#983A20',
            road: '#C07040',
            roadLine: '#CCCC44',
            fence: '#906030',
            house1: '#D0A878',
            house2: '#B89060',
            roof: '#784020',
            tree: '#5A7A30',
            treeTrunk: '#6B4020'
        }
    },

    // Colors
    COL: {
        // Ernie
        POSTIE_RED: '#CC2200',
        POSTIE_YELLOW: '#FFD700',
        SKIN: '#F5C6A0',
        HAIR: '#4A3020',
        PANTS: '#1A1A5A',
        BOOTS: '#2A2A2A',
        SATCHEL: '#8B4513',
        CAP_RED: '#CC2200',
        CAP_WHITE: '#FFFFFF',
        HIVIS: '#FFD700',

        // eDV
        EDV_RED: '#CC2200',
        EDV_WHITE: '#F0F0F0',
        EDV_GREY: '#888888',

        // Enemies
        VAN_BLUE: '#1A3A5C',
        VAN_ORANGE: '#FF9900',
        DOG_BROWN: '#8B5A2B',
        DOG_DARK: '#6B3A1B',
        MAGPIE_BLACK: '#1A1A1A',
        MAGPIE_WHITE: '#E8E8E8',
        PERSON_SKIN: '#E0B090',
        BIN_GREEN: '#2A7A2A',
        BIN_YELLOW: '#D0C020',
        CAT_ORANGE: '#E08820',
        EMU_BROWN: '#6B5040',
        EMU_DARK: '#3A2A20',
        ROTTWEILER_BLACK: '#1A1A1A',
        ROTTWEILER_TAN: '#C08040',
        CHIHUAHUA_TAN: '#D8A860',

        // Effects
        EXPLOSION_ORANGE: '#FF6600',
        EXPLOSION_YELLOW: '#FFCC00',
        EXPLOSION_RED: '#FF2200',
        EXPLOSION_WHITE: '#FFFFFF',
        SPARK_WHITE: '#FFFFFF',
        SPARK_YELLOW: '#FFEE44',
        SMOKE_GREY: '#999999',
        SMOKE_DARK: '#666666',

        // Projectiles
        PARCEL_BROWN: '#8B6914',
        PARCEL_TAPE: '#DDCCAA',
        LETTER_WHITE: '#F0F0F0',
        STAMP_RED: '#CC0000',
        STAMP_INK: '#880000',

        // UI
        UI_WHITE: '#FFFFFF',
        UI_YELLOW: '#FFD700',
        UI_RED: '#FF2200',
        UI_SHADOW: '#000000',
        UI_BG: 'rgba(0,0,0,0.6)'
    },

    // Game states
    STATE_MENU: 0,
    STATE_PLAYING: 1,
    STATE_PAUSED: 2,
    STATE_LEVEL_INTRO: 3,
    STATE_LEVEL_COMPLETE: 4,
    STATE_GAME_OVER: 5,
    STATE_BOSS: 6
};
