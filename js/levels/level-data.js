// Postie Run - All 20 Level Definitions
PR.LevelData = [
    // ============================================================
    // SUBURBAN LEVELS (1-4)
    // ============================================================
    { // Level 1: Morning Shift
        name: "Morning Shift",
        theme: 0, width: 2400, groundY: 9,
        deliveryType: 'house',
        deliveryAddress: "14 Wattle Street",
        spawns: [
            { x: 300, type: 'bin' },
            { x: 500, type: 'pickup', pickupType: 'health' },
            { x: 650, type: 'dog' },
            { x: 900, type: 'bin' },
            { x: 1000, type: 'bin' },
            { x: 1200, type: 'magpie' },
            { x: 1400, type: 'dog' },
            { x: 1500, type: 'pickup', pickupType: 'cannon' },
            { x: 1700, type: 'sprinkler' },
            { x: 1900, type: 'dog' },
            { x: 2000, type: 'magpie' },
            { x: 2100, type: 'bin' }
        ],
        terrain: [],
        platforms: [
            { x: 800, y: 96, w: 64 },
            { x: 1600, y: 96, w: 48 }
        ]
    },
    { // Level 2: Barking Mad
        name: "Barking Mad",
        theme: 0, width: 2800, groundY: 9,
        deliveryType: 'house',
        deliveryAddress: "7 Banksia Ave",
        spawns: [
            { x: 250, type: 'dog' },
            { x: 400, type: 'dog' },
            { x: 500, type: 'bin' },
            { x: 700, type: 'magpie' },
            { x: 800, type: 'dog' },
            { x: 900, type: 'dog' },
            { x: 1000, type: 'pickup', pickupType: 'spray' },
            { x: 1200, type: 'person' },
            { x: 1400, type: 'dog' },
            { x: 1500, type: 'dog' },
            { x: 1600, type: 'sprinkler' },
            { x: 1800, type: 'magpie' },
            { x: 1900, type: 'dog' },
            { x: 2000, type: 'pickup', pickupType: 'health' },
            { x: 2200, type: 'dog' },
            { x: 2300, type: 'dog' },
            { x: 2500, type: 'person' }
        ],
        terrain: [
            { x: 1000, w: 64, type: 'raised', height: 2 }
        ],
        platforms: [
            { x: 600, y: 96, w: 48 },
            { x: 1600, y: 80, w: 64 }
        ]
    },
    { // Level 3: Magpie Season
        name: "Magpie Season",
        theme: 0, width: 3000, groundY: 9,
        deliveryType: 'locker',
        deliveryAddress: "Grevillea Park Lockers",
        spawns: [
            { x: 300, type: 'magpie' },
            { x: 400, type: 'magpie' },
            { x: 600, type: 'dog' },
            { x: 700, type: 'bin' },
            { x: 900, type: 'magpie' },
            { x: 1000, type: 'magpie' },
            { x: 1100, type: 'magpie' },
            { x: 1200, type: 'pickup', pickupType: 'stamp' },
            { x: 1400, type: 'person' },
            { x: 1500, type: 'sprinkler' },
            { x: 1700, type: 'magpie' },
            { x: 1800, type: 'dog' },
            { x: 1900, type: 'magpie' },
            { x: 2000, type: 'hose' },
            { x: 2200, type: 'pickup', pickupType: 'health' },
            { x: 2400, type: 'magpie' },
            { x: 2500, type: 'magpie' },
            { x: 2600, type: 'dog' },
            { x: 2700, type: 'person' }
        ],
        terrain: [],
        platforms: [
            { x: 500, y: 80, w: 48 },
            { x: 1300, y: 96, w: 80 },
            { x: 2100, y: 80, w: 48 }
        ]
    },
    { // Level 4: Suburbia Showdown
        name: "Suburbia Showdown",
        theme: 0, width: 3200, groundY: 9,
        deliveryType: 'house',
        deliveryAddress: "22 Eucalyptus Cres",
        spawns: [
            { x: 250, type: 'dog' },
            { x: 350, type: 'bin' },
            { x: 500, type: 'magpie' },
            { x: 600, type: 'cat' },
            { x: 800, type: 'person' },
            { x: 900, type: 'dog' },
            { x: 1000, type: 'dog' },
            { x: 1100, type: 'pickup', pickupType: 'cannon' },
            { x: 1200, type: 'sprinkler' },
            { x: 1300, type: 'magpie' },
            { x: 1400, type: 'magpie' },
            { x: 1500, type: 'van' },
            { x: 1700, type: 'dog' },
            { x: 1800, type: 'person' },
            { x: 1900, type: 'pickup', pickupType: 'health' },
            { x: 2000, type: 'hose' },
            { x: 2200, type: 'mower' },
            { x: 2400, type: 'magpie' },
            { x: 2500, type: 'dog' },
            { x: 2600, type: 'van' },
            { x: 2800, type: 'person' },
            { x: 2900, type: 'cat' }
        ],
        terrain: [
            { x: 600, w: 48, type: 'raised', height: 1 },
            { x: 1800, w: 48, type: 'raised', height: 2 }
        ],
        platforms: [
            { x: 400, y: 80, w: 64 },
            { x: 1000, y: 96, w: 48 },
            { x: 2100, y: 80, w: 80 }
        ]
    },

    // ============================================================
    // URBAN LEVELS (5-8)
    // ============================================================
    { // Level 5: City Limits
        name: "City Limits",
        theme: 1, width: 3000, groundY: 9,
        deliveryType: 'locker',
        deliveryAddress: "CBD Parcel Locker 2041",
        spawns: [
            { x: 300, type: 'person' },
            { x: 500, type: 'bin' },
            { x: 600, type: 'van' },
            { x: 800, type: 'dog' },
            { x: 900, type: 'person' },
            { x: 1000, type: 'pickup', pickupType: 'spray' },
            { x: 1200, type: 'cat' },
            { x: 1300, type: 'van' },
            { x: 1500, type: 'magpie' },
            { x: 1600, type: 'person' },
            { x: 1700, type: 'bin' },
            { x: 1800, type: 'pickup', pickupType: 'health' },
            { x: 2000, type: 'van' },
            { x: 2100, type: 'dog' },
            { x: 2200, type: 'person' },
            { x: 2400, type: 'magpie' },
            { x: 2600, type: 'cat' },
            { x: 2700, type: 'van' }
        ],
        terrain: [],
        platforms: [
            { x: 400, y: 80, w: 64 },
            { x: 900, y: 64, w: 48 },
            { x: 1400, y: 80, w: 96 },
            { x: 2300, y: 80, w: 64 }
        ]
    },
    { // Level 6: Rush Hour
        name: "Rush Hour",
        theme: 1, width: 3400, groundY: 9,
        deliveryType: 'house',
        deliveryAddress: "Unit 5/180 King St",
        spawns: [
            { x: 300, type: 'van' },
            { x: 500, type: 'person' },
            { x: 600, type: 'person' },
            { x: 700, type: 'dog' },
            { x: 800, type: 'van' },
            { x: 1000, type: 'magpie' },
            { x: 1100, type: 'magpie' },
            { x: 1200, type: 'pickup', pickupType: 'stamp' },
            { x: 1300, type: 'cat' },
            { x: 1500, type: 'van' },
            { x: 1600, type: 'person' },
            { x: 1700, type: 'bin', rolling: true },
            { x: 1800, type: 'dog' },
            { x: 1900, type: 'van' },
            { x: 2000, type: 'pickup', pickupType: 'health' },
            { x: 2200, type: 'person' },
            { x: 2300, type: 'magpie' },
            { x: 2400, type: 'van' },
            { x: 2600, type: 'dog' },
            { x: 2700, type: 'dog' },
            { x: 2800, type: 'person' },
            { x: 3000, type: 'van' },
            { x: 3100, type: 'cat' }
        ],
        terrain: [
            { x: 800, w: 64, type: 'raised', height: 1 }
        ],
        platforms: [
            { x: 500, y: 64, w: 48 },
            { x: 1100, y: 80, w: 64 },
            { x: 2000, y: 64, w: 80 },
            { x: 2700, y: 80, w: 48 }
        ]
    },
    { // Level 7: Shopping Strip
        name: "Shopping Strip",
        theme: 1, width: 3600, groundY: 9,
        deliveryType: 'locker',
        deliveryAddress: "Highgate Mall Lockers",
        spawns: [
            { x: 300, type: 'person' },
            { x: 400, type: 'cat' },
            { x: 600, type: 'van' },
            { x: 700, type: 'dog' },
            { x: 900, type: 'bin' },
            { x: 1000, type: 'bin' },
            { x: 1100, type: 'person' },
            { x: 1200, type: 'pickup', pickupType: 'cannon' },
            { x: 1400, type: 'van' },
            { x: 1500, type: 'magpie' },
            { x: 1600, type: 'magpie' },
            { x: 1800, type: 'mower' },
            { x: 2000, type: 'person' },
            { x: 2100, type: 'van' },
            { x: 2200, type: 'pickup', pickupType: 'health' },
            { x: 2400, type: 'dog' },
            { x: 2500, type: 'dog' },
            { x: 2600, type: 'van' },
            { x: 2800, type: 'person' },
            { x: 2900, type: 'magpie' },
            { x: 3000, type: 'cat' },
            { x: 3200, type: 'van' },
            { x: 3300, type: 'person' }
        ],
        terrain: [],
        platforms: [
            { x: 350, y: 64, w: 64 },
            { x: 900, y: 80, w: 80 },
            { x: 1700, y: 64, w: 48 },
            { x: 2600, y: 80, w: 64 }
        ]
    },
    { // Level 8: Urban Jungle
        name: "Urban Jungle",
        theme: 1, width: 3800, groundY: 9,
        deliveryType: 'house',
        deliveryAddress: "42 Collins Street",
        spawns: [
            { x: 300, type: 'van' },
            { x: 400, type: 'dog' },
            { x: 500, type: 'person' },
            { x: 600, type: 'magpie' },
            { x: 700, type: 'cat' },
            { x: 900, type: 'van' },
            { x: 1000, type: 'pickup', pickupType: 'edv' },
            { x: 1200, type: 'person' },
            { x: 1300, type: 'person' },
            { x: 1400, type: 'van' },
            { x: 1500, type: 'dog' },
            { x: 1600, type: 'magpie' },
            { x: 1700, type: 'magpie' },
            { x: 1800, type: 'bin', rolling: true },
            { x: 1900, type: 'pickup', pickupType: 'health' },
            { x: 2100, type: 'van' },
            { x: 2200, type: 'person' },
            { x: 2300, type: 'cat' },
            { x: 2500, type: 'van' },
            { x: 2600, type: 'dog' },
            { x: 2700, type: 'dog' },
            { x: 2800, type: 'pickup', pickupType: 'stamp' },
            { x: 3000, type: 'van' },
            { x: 3100, type: 'person' },
            { x: 3200, type: 'magpie' },
            { x: 3400, type: 'van' },
            { x: 3500, type: 'person' }
        ],
        terrain: [
            { x: 1400, w: 64, type: 'raised', height: 2 },
            { x: 2400, w: 48, type: 'raised', height: 1 }
        ],
        platforms: [
            { x: 600, y: 64, w: 64 },
            { x: 1100, y: 80, w: 48 },
            { x: 2000, y: 64, w: 80 },
            { x: 3000, y: 80, w: 64 }
        ]
    },

    // ============================================================
    // REGIONAL LEVELS (9-12)
    // ============================================================
    { // Level 9: Country Road
        name: "Country Road",
        theme: 2, width: 3200, groundY: 9,
        deliveryType: 'house',
        deliveryAddress: "Lot 4 Murray Highway",
        spawns: [
            { x: 400, type: 'dog' },
            { x: 600, type: 'mower' },
            { x: 800, type: 'bin' },
            { x: 1000, type: 'magpie' },
            { x: 1100, type: 'magpie' },
            { x: 1200, type: 'pickup', pickupType: 'cannon' },
            { x: 1400, type: 'sprinkler' },
            { x: 1600, type: 'dog' },
            { x: 1700, type: 'person' },
            { x: 1800, type: 'van' },
            { x: 2000, type: 'mower' },
            { x: 2100, type: 'pickup', pickupType: 'health' },
            { x: 2300, type: 'emu' },
            { x: 2500, type: 'dog' },
            { x: 2600, type: 'magpie' },
            { x: 2800, type: 'mower' },
            { x: 2900, type: 'person' }
        ],
        terrain: [],
        platforms: [
            { x: 700, y: 96, w: 64 },
            { x: 1500, y: 80, w: 48 },
            { x: 2200, y: 96, w: 80 }
        ]
    },
    { // Level 10: The Pub Run
        name: "The Pub Run",
        theme: 2, width: 3400, groundY: 9,
        deliveryType: 'house',
        deliveryAddress: "Royal Hotel, Main St",
        spawns: [
            { x: 300, type: 'person' },
            { x: 500, type: 'dog' },
            { x: 600, type: 'sprinkler' },
            { x: 800, type: 'hose' },
            { x: 900, type: 'emu' },
            { x: 1000, type: 'pickup', pickupType: 'spray' },
            { x: 1200, type: 'mower' },
            { x: 1300, type: 'van' },
            { x: 1500, type: 'person' },
            { x: 1600, type: 'dog' },
            { x: 1700, type: 'magpie' },
            { x: 1900, type: 'sprinkler' },
            { x: 2000, type: 'emu' },
            { x: 2100, type: 'pickup', pickupType: 'health' },
            { x: 2300, type: 'van' },
            { x: 2400, type: 'person' },
            { x: 2600, type: 'dog' },
            { x: 2700, type: 'mower' },
            { x: 2900, type: 'emu' },
            { x: 3000, type: 'person' },
            { x: 3100, type: 'magpie' }
        ],
        terrain: [
            { x: 1000, w: 80, type: 'raised', height: 1 }
        ],
        platforms: [
            { x: 400, y: 80, w: 64 },
            { x: 1400, y: 96, w: 48 },
            { x: 2200, y: 80, w: 64 }
        ]
    },
    { // Level 11: Wheat Belt Express
        name: "Wheat Belt Express",
        theme: 2, width: 3600, groundY: 9,
        deliveryType: 'locker',
        deliveryAddress: "Gundagai PO Lockers",
        spawns: [
            { x: 300, type: 'emu' },
            { x: 500, type: 'dog' },
            { x: 700, type: 'van' },
            { x: 800, type: 'mower' },
            { x: 1000, type: 'magpie' },
            { x: 1100, type: 'magpie' },
            { x: 1200, type: 'emu' },
            { x: 1300, type: 'pickup', pickupType: 'stamp' },
            { x: 1500, type: 'person' },
            { x: 1600, type: 'sprinkler' },
            { x: 1800, type: 'van' },
            { x: 1900, type: 'emu' },
            { x: 2000, type: 'dog' },
            { x: 2100, type: 'pickup', pickupType: 'health' },
            { x: 2300, type: 'mower' },
            { x: 2400, type: 'person' },
            { x: 2600, type: 'van' },
            { x: 2700, type: 'emu' },
            { x: 2800, type: 'magpie' },
            { x: 3000, type: 'dog' },
            { x: 3100, type: 'person' },
            { x: 3300, type: 'emu' }
        ],
        terrain: [
            { x: 600, w: 48, type: 'raised', height: 2 },
            { x: 2000, w: 64, type: 'raised', height: 1 }
        ],
        platforms: [
            { x: 900, y: 80, w: 80 },
            { x: 1700, y: 96, w: 48 },
            { x: 2500, y: 80, w: 64 }
        ]
    },
    { // Level 12: Harvest Havoc
        name: "Harvest Havoc",
        theme: 2, width: 3800, groundY: 9,
        deliveryType: 'house',
        deliveryAddress: "Willow Farm, RMB 247",
        spawns: [
            { x: 300, type: 'mower' },
            { x: 400, type: 'emu' },
            { x: 600, type: 'van' },
            { x: 700, type: 'dog' },
            { x: 800, type: 'person' },
            { x: 900, type: 'pickup', pickupType: 'edv' },
            { x: 1100, type: 'emu' },
            { x: 1200, type: 'emu' },
            { x: 1300, type: 'mower' },
            { x: 1500, type: 'van' },
            { x: 1600, type: 'magpie' },
            { x: 1700, type: 'magpie' },
            { x: 1800, type: 'pickup', pickupType: 'health' },
            { x: 2000, type: 'person' },
            { x: 2100, type: 'sprinkler' },
            { x: 2200, type: 'hose' },
            { x: 2400, type: 'emu' },
            { x: 2500, type: 'van' },
            { x: 2700, type: 'dog' },
            { x: 2800, type: 'mower' },
            { x: 3000, type: 'emu' },
            { x: 3100, type: 'pickup', pickupType: 'stamp' },
            { x: 3200, type: 'van' },
            { x: 3400, type: 'person' },
            { x: 3500, type: 'emu' }
        ],
        terrain: [],
        platforms: [
            { x: 500, y: 80, w: 64 },
            { x: 1400, y: 64, w: 48 },
            { x: 2300, y: 80, w: 80 },
            { x: 3200, y: 96, w: 48 }
        ]
    },

    // ============================================================
    // COASTAL LEVELS (13-16)
    // ============================================================
    { // Level 13: Beach Run
        name: "Beach Run",
        theme: 3, width: 3200, groundY: 9,
        deliveryType: 'house',
        deliveryAddress: "3 Ocean Parade",
        spawns: [
            { x: 300, type: 'seagull' },
            { x: 500, type: 'dog' },
            { x: 600, type: 'cat' },
            { x: 800, type: 'seagull' },
            { x: 900, type: 'seagull' },
            { x: 1000, type: 'pickup', pickupType: 'spray' },
            { x: 1200, type: 'person' },
            { x: 1400, type: 'bin' },
            { x: 1500, type: 'dog' },
            { x: 1600, type: 'seagull' },
            { x: 1800, type: 'van' },
            { x: 1900, type: 'pickup', pickupType: 'health' },
            { x: 2100, type: 'sprinkler' },
            { x: 2200, type: 'seagull' },
            { x: 2400, type: 'cat' },
            { x: 2500, type: 'dog' },
            { x: 2700, type: 'person' },
            { x: 2800, type: 'seagull' },
            { x: 2900, type: 'van' }
        ],
        terrain: [],
        platforms: [
            { x: 700, y: 80, w: 64 },
            { x: 1300, y: 96, w: 48 },
            { x: 2000, y: 80, w: 80 }
        ]
    },
    { // Level 14: Boardwalk Blitz
        name: "Boardwalk Blitz",
        theme: 3, width: 3400, groundY: 9,
        deliveryType: 'locker',
        deliveryAddress: "Surf Club Lockers",
        spawns: [
            { x: 300, type: 'seagull' },
            { x: 400, type: 'seagull' },
            { x: 600, type: 'cat' },
            { x: 700, type: 'van' },
            { x: 900, type: 'person' },
            { x: 1000, type: 'dog' },
            { x: 1100, type: 'seagull' },
            { x: 1200, type: 'pickup', pickupType: 'cannon' },
            { x: 1400, type: 'bin', rolling: true },
            { x: 1500, type: 'van' },
            { x: 1700, type: 'seagull' },
            { x: 1800, type: 'seagull' },
            { x: 1900, type: 'person' },
            { x: 2000, type: 'pickup', pickupType: 'health' },
            { x: 2200, type: 'cat' },
            { x: 2300, type: 'van' },
            { x: 2500, type: 'dog' },
            { x: 2600, type: 'seagull' },
            { x: 2800, type: 'person' },
            { x: 2900, type: 'van' },
            { x: 3100, type: 'seagull' }
        ],
        terrain: [
            { x: 800, w: 48, type: 'raised', height: 1 },
            { x: 2100, w: 64, type: 'raised', height: 2 }
        ],
        platforms: [
            { x: 500, y: 64, w: 80 },
            { x: 1300, y: 80, w: 48 },
            { x: 2400, y: 80, w: 64 }
        ]
    },
    { // Level 15: Tide's Coming In
        name: "Tide's Coming In",
        theme: 3, width: 3600, groundY: 9,
        deliveryType: 'house',
        deliveryAddress: "17 Coral Crescent",
        spawns: [
            { x: 300, type: 'dog' },
            { x: 400, type: 'seagull' },
            { x: 600, type: 'van' },
            { x: 700, type: 'person' },
            { x: 900, type: 'seagull' },
            { x: 1000, type: 'seagull' },
            { x: 1100, type: 'cat' },
            { x: 1200, type: 'pickup', pickupType: 'stamp' },
            { x: 1400, type: 'van' },
            { x: 1500, type: 'sprinkler' },
            { x: 1600, type: 'hose' },
            { x: 1800, type: 'seagull' },
            { x: 1900, type: 'dog' },
            { x: 2000, type: 'person' },
            { x: 2100, type: 'pickup', pickupType: 'health' },
            { x: 2300, type: 'van' },
            { x: 2400, type: 'seagull' },
            { x: 2500, type: 'seagull' },
            { x: 2700, type: 'cat' },
            { x: 2800, type: 'person' },
            { x: 3000, type: 'van' },
            { x: 3100, type: 'dog' },
            { x: 3200, type: 'seagull' },
            { x: 3300, type: 'person' }
        ],
        terrain: [],
        platforms: [
            { x: 500, y: 80, w: 64 },
            { x: 1300, y: 64, w: 80 },
            { x: 2200, y: 80, w: 48 },
            { x: 2900, y: 80, w: 64 }
        ]
    },
    { // Level 16: Storm Surge
        name: "Storm Surge",
        theme: 3, width: 3800, groundY: 9,
        deliveryType: 'locker',
        deliveryAddress: "Marina Parcel Point",
        spawns: [
            { x: 300, type: 'seagull' },
            { x: 400, type: 'seagull' },
            { x: 500, type: 'van' },
            { x: 600, type: 'dog' },
            { x: 800, type: 'person' },
            { x: 900, type: 'cat' },
            { x: 1000, type: 'pickup', pickupType: 'edv' },
            { x: 1200, type: 'van' },
            { x: 1300, type: 'seagull' },
            { x: 1400, type: 'seagull' },
            { x: 1500, type: 'person' },
            { x: 1600, type: 'bin', rolling: true },
            { x: 1800, type: 'van' },
            { x: 1900, type: 'sprinkler' },
            { x: 2000, type: 'pickup', pickupType: 'health' },
            { x: 2200, type: 'seagull' },
            { x: 2300, type: 'dog' },
            { x: 2400, type: 'van' },
            { x: 2600, type: 'person' },
            { x: 2700, type: 'seagull' },
            { x: 2800, type: 'cat' },
            { x: 3000, type: 'van' },
            { x: 3100, type: 'pickup', pickupType: 'stamp' },
            { x: 3200, type: 'seagull' },
            { x: 3300, type: 'person' },
            { x: 3500, type: 'van' }
        ],
        terrain: [
            { x: 700, w: 48, type: 'raised', height: 2 },
            { x: 2100, w: 64, type: 'raised', height: 1 }
        ],
        platforms: [
            { x: 400, y: 64, w: 64 },
            { x: 1100, y: 80, w: 80 },
            { x: 1700, y: 64, w: 48 },
            { x: 2500, y: 80, w: 64 },
            { x: 3400, y: 80, w: 48 }
        ]
    },

    // ============================================================
    // OUTBACK LEVELS (17-20)
    // ============================================================
    { // Level 17: The Long Road
        name: "The Long Road",
        theme: 4, width: 3400, groundY: 9,
        deliveryType: 'house',
        deliveryAddress: "Mulga Station",
        spawns: [
            { x: 400, type: 'emu' },
            { x: 600, type: 'dropbear' },
            { x: 800, type: 'dog' },
            { x: 1000, type: 'emu' },
            { x: 1100, type: 'pickup', pickupType: 'cannon' },
            { x: 1300, type: 'dropbear' },
            { x: 1500, type: 'van' },
            { x: 1600, type: 'emu' },
            { x: 1800, type: 'person' },
            { x: 1900, type: 'pickup', pickupType: 'health' },
            { x: 2100, type: 'emu' },
            { x: 2200, type: 'dropbear' },
            { x: 2400, type: 'roadtrain' },
            { x: 2600, type: 'emu' },
            { x: 2700, type: 'dog' },
            { x: 2900, type: 'dropbear' },
            { x: 3000, type: 'pickup', pickupType: 'stamp' },
            { x: 3100, type: 'emu' }
        ],
        terrain: [],
        platforms: [
            { x: 700, y: 80, w: 64 },
            { x: 1400, y: 96, w: 48 },
            { x: 2300, y: 80, w: 80 }
        ]
    },
    { // Level 18: Dust Storm
        name: "Dust Storm",
        theme: 4, width: 3600, groundY: 9,
        deliveryType: 'locker',
        deliveryAddress: "Broken Hill PO Lockers",
        spawns: [
            { x: 300, type: 'emu' },
            { x: 400, type: 'emu' },
            { x: 600, type: 'dropbear' },
            { x: 800, type: 'roadtrain' },
            { x: 900, type: 'dog' },
            { x: 1000, type: 'pickup', pickupType: 'edv' },
            { x: 1200, type: 'emu' },
            { x: 1300, type: 'dropbear' },
            { x: 1400, type: 'person' },
            { x: 1600, type: 'emu' },
            { x: 1700, type: 'van' },
            { x: 1900, type: 'pickup', pickupType: 'health' },
            { x: 2100, type: 'roadtrain' },
            { x: 2200, type: 'emu' },
            { x: 2300, type: 'dropbear' },
            { x: 2500, type: 'dog' },
            { x: 2600, type: 'emu' },
            { x: 2800, type: 'van' },
            { x: 2900, type: 'dropbear' },
            { x: 3100, type: 'emu' },
            { x: 3200, type: 'roadtrain' },
            { x: 3300, type: 'person' }
        ],
        terrain: [
            { x: 1000, w: 64, type: 'raised', height: 2 },
            { x: 2400, w: 48, type: 'raised', height: 1 }
        ],
        platforms: [
            { x: 500, y: 80, w: 64 },
            { x: 1500, y: 64, w: 48 },
            { x: 2700, y: 80, w: 80 }
        ]
    },
    { // Level 19: No Man's Land
        name: "No Man's Land",
        theme: 4, width: 4000, groundY: 9,
        deliveryType: 'house',
        deliveryAddress: "Woop Woop Station",
        spawns: [
            { x: 300, type: 'emu' },
            { x: 400, type: 'dropbear' },
            { x: 500, type: 'emu' },
            { x: 700, type: 'roadtrain' },
            { x: 800, type: 'dog' },
            { x: 900, type: 'emu' },
            { x: 1000, type: 'pickup', pickupType: 'stamp' },
            { x: 1200, type: 'dropbear' },
            { x: 1300, type: 'dropbear' },
            { x: 1400, type: 'van' },
            { x: 1600, type: 'emu' },
            { x: 1700, type: 'emu' },
            { x: 1800, type: 'person' },
            { x: 1900, type: 'pickup', pickupType: 'health' },
            { x: 2100, type: 'roadtrain' },
            { x: 2200, type: 'emu' },
            { x: 2300, type: 'dropbear' },
            { x: 2500, type: 'van' },
            { x: 2600, type: 'emu' },
            { x: 2700, type: 'dog' },
            { x: 2800, type: 'pickup', pickupType: 'cannon' },
            { x: 3000, type: 'roadtrain' },
            { x: 3100, type: 'emu' },
            { x: 3200, type: 'dropbear' },
            { x: 3300, type: 'person' },
            { x: 3500, type: 'emu' },
            { x: 3600, type: 'van' },
            { x: 3700, type: 'emu' }
        ],
        terrain: [
            { x: 600, w: 48, type: 'raised', height: 2 },
            { x: 1500, w: 80, type: 'raised', height: 1 },
            { x: 2800, w: 48, type: 'raised', height: 2 }
        ],
        platforms: [
            { x: 400, y: 64, w: 64 },
            { x: 1100, y: 80, w: 48 },
            { x: 2000, y: 64, w: 80 },
            { x: 3000, y: 80, w: 64 }
        ]
    },
    { // Level 20: FINAL DELIVERY (Boss: Giant Rottweiler)
        name: "Final Delivery",
        theme: 4, width: 4200, groundY: 9,
        deliveryType: 'house',
        deliveryAddress: "The Last House",
        boss: { type: 'rottweiler' },
        spawns: [
            { x: 300, type: 'emu' },
            { x: 400, type: 'dog' },
            { x: 600, type: 'dropbear' },
            { x: 700, type: 'emu' },
            { x: 800, type: 'roadtrain' },
            { x: 900, type: 'pickup', pickupType: 'stamp' },
            { x: 1100, type: 'emu' },
            { x: 1200, type: 'dropbear' },
            { x: 1300, type: 'van' },
            { x: 1400, type: 'person' },
            { x: 1500, type: 'emu' },
            { x: 1600, type: 'pickup', pickupType: 'health' },
            { x: 1800, type: 'roadtrain' },
            { x: 1900, type: 'emu' },
            { x: 2000, type: 'dropbear' },
            { x: 2100, type: 'dog' },
            { x: 2200, type: 'pickup', pickupType: 'edv' },
            { x: 2400, type: 'emu' },
            { x: 2500, type: 'van' },
            { x: 2600, type: 'dropbear' },
            { x: 2700, type: 'emu' },
            { x: 2800, type: 'roadtrain' },
            { x: 2900, type: 'pickup', pickupType: 'health' },
            { x: 3000, type: 'person' },
            { x: 3100, type: 'emu' },
            { x: 3200, type: 'dropbear' },
            { x: 3300, type: 'pickup', pickupType: 'stamp' },
            { x: 3500, type: 'emu' },
            { x: 3600, type: 'emu' },
            { x: 3700, type: 'van' },
            { x: 3800, type: 'pickup', pickupType: 'health' }
        ],
        terrain: [
            { x: 800, w: 64, type: 'raised', height: 2 },
            { x: 1700, w: 48, type: 'raised', height: 1 },
            { x: 2700, w: 64, type: 'raised', height: 2 }
        ],
        platforms: [
            { x: 500, y: 64, w: 80 },
            { x: 1000, y: 80, w: 48 },
            { x: 2000, y: 64, w: 64 },
            { x: 3000, y: 80, w: 80 },
            { x: 3800, y: 80, w: 48 }
        ]
    }
];
