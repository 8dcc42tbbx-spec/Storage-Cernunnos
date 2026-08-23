// Peak Performance: Last Delivery -- Coach's full line pool.
// Transcribed from ../coach-lines.md -- keep the two in sync if either
// changes. Kept as pure data, separate from js/coach.js's logic, the
// same way this repo's trivia-trixie keeps its question bank in its own
// file (js/questions.js) apart from game.js.
PPLD.CoachLines = {

    overtake: [
        "Clean rep! That's how you build a route record.",
        "Nice split! Keep that cadence.",
        "That's a PB overtake, driver — mark it down.",
        "Smooth as a gift-wrap corner. Keep flowing.",
        "Drafted right past 'em — save those legs for the sprint.",
        "That's the form, right there. Textbook.",
        "One more parcel closer, one more rep done.",
        "Tidy pass! Ref's giving that a ten.",
        "Feel that? That's Peak season fitness.",
        "Straight through, no fouls. Keep the tempo up."
    ],

    checkpoint: [
        "Checkpoint's ticked off — that's a full set complete!",
        "Gate's clear! Bank that time, driver, you earned it.",
        "That's a personal best split — the clock just said thank you.",
        "Milestone down! Hydrate — well, keep driving, but you know.",
        "Photo finish energy at that gate. Loved it.",
        "That's your second wind kicking in right on schedule.",
        "Gate cleared with time in the bank — that's championship form.",
        "Tick that box — literally, there's a parcel in it."
    ],

    lowClock: [
        "Clock doesn't do extra time tonight, driver — dig in.",
        "This is the final kilometre. Leave it all on the road.",
        "No cool-down laps left — full send to the line.",
        "Heart rate up, driver — that's exactly where it should be.",
        "Second wind time. Find it. Use it.",
        "The depot's not doing penalties tonight — make the clock, don't chase it."
    ],

    legs: [
        { // Leg 1 -- Suburban Sprint
            start: [
                "Warm-up lap, driver — easy pace, eyes open, plenty of parked cars playing defence.",
                "First leg of the circuit — suburbs are your stretching routine before the real work."
            ],
            hazard: {
                parkedcar: [
                    "Watch the driveways — that's an unmarked opponent stepping onto the track.",
                    "Parked car, pulling out — treat it like a surprise substitution."
                ]
            },
            clear: [
                "Suburbs are done — that's your warm-up set complete. Highway's next, and it's a real interval.",
                "Clean lap through the streets! On to the highway — pace yourself, it's longer than it looks."
            ]
        },
        { // Leg 2 -- Highway Dash
            start: [
                "This is your tempo run, driver — steady pace, eyes up, rain's coming in.",
                "Highway's the marathon stretch of tonight's session. Settle in."
            ],
            hazard: {
                roadtrain: [
                    "Road train ahead — that's not an opponent, that's a whole relay team. Patient overtake.",
                    "Big rig, long pass — treat it like a slow lap, not a sprint finish."
                ]
            },
            clear: [
                "Highway's behind you — that's the marathon leg done. Backroads are shorter, but sneakier.",
                "Off the highway, into the quiet — don't relax, the countryside plays dirty."
            ]
        },
        { // Leg 3 -- Country Backroads
            start: [
                "Backroads now — no lane markings, no crowd noise, just you and the dark. Focus drill.",
                "This leg's an agility test, driver. Fog's the blindfold round."
            ],
            hazard: {
                kangaroo: [
                    "Hurdles! Well — roos. Same event, way less predictable.",
                    "That's a wildlife substitution nobody called. Ease off, hop with it."
                ]
            },
            clear: [
                "Fog's behind you — that's the toughest agility drill done. Mountain's next, and it bites back.",
                "Backroads cleared! Small win, big relief. Onto the climb."
            ]
        },
        { // Leg 4 -- Mountain Pass
            start: [
                "Climbing leg, driver — this is your hill-sprint set. Lungs and tyres both working overtime.",
                "Altitude training, unofficially. Keep the pace controlled on the way up."
            ],
            wink: [
                "Yeah, I know it doesn't usually snow here either — call it a bonus interval. Just get up the hill.",
                "Don't ask me why there's snow on an Australian Christmas Eve. Coach doesn't do weather reports, just hill reps."
            ],
            hazard: {
                blackice: [
                    "Ice patch! That's a balance drill nobody signed up for — ease off, don't fight it.",
                    "Slippery footing ahead. Soft hands on the wheel, like it's a hurdle you don't want to clip."
                ]
            },
            clear: [
                "Summit's done! That's your hardest set of the night behind you. One leg left — the big one.",
                "Down off the mountain and still upright — that's a coaching win right there. Final stretch, driver."
            ]
        },
        { // Leg 5 -- Last Delivery
            start: [
                "This is it — the finals. Everything you've trained for tonight comes down to this leg.",
                "Last leg, driver. Whiteout conditions, midnight deadline — coach believes in you anyway."
            ],
            hazard: {
                whiteout: [
                    "Can't see the line? Trust your legs — well, your tyres. You know this road by feel now.",
                    "That's a proper whiteout — like running with your eyes shut. Slow the pace, keep the form."
                ]
            },
            approach: [
                "Porch light's close now, driver. This is your finishing kick — everything you've got, right here.",
                "One parcel, one house, one shot at gold. Bring it home."
            ]
        }
    ],

    runEnd: {
        success: [
            "Gold-medal delivery! That's how you finish a Peak season — flying colours, right under the tree.",
            "Delivered! That's a personal best in every category coach tracks. Go put your feet up — you've earned it.",
            "Photo finish, parcel in hand. That's champion form, driver. Merry Christmas.",
            "Full marks. Clean route, clock in hand, parcel delivered. Best session of the Peak, no contest.",
            "That's the whistle — full time, and you won it. Go enjoy Christmas, you've more than earned it."
        ],
        failure: [
            "Didn't stick the landing tonight, but that's a Peak-season effort right there. Go again?",
            "Clock beat us this time. Happens to everyone once — even coach's had a bad session. Reset and go again.",
            "Not the finish we wanted, but you left it all on the road. That counts for plenty. Again?",
            "Tough one. But you know what — most people don't even lace up for a night like this. Proud of you regardless.",
            "That's a DNF, not a failure, driver. Big difference. Get some rest — we go again next Peak."
        ]
    }
};
