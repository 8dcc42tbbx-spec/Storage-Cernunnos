// Steady Gains - exercise library. Every exercise is doable with the home kit
// (flat bench, 2.5-20 kg dumbbells, 5/7/12 kg kettlebells, L/M/H bands, mat,
// bike) and carries an Ankle Load Rating (ALR, see PLAN.md section 2):
//
//   0  ankle uninvolved (lying, seated with feet resting, side-lying)
//   1  light, static, flat-footed load or a passive kneeling position
//   2  standing, two-footed, loaded -- locked unless the user opts in
//   3  single-leg, impact, balance or loaded ankle range of motion -- never
//
// No ALR-3 exercise is in the library at all; safety.js also refuses them in
// case one is ever added. Extra flags the safety filter reads:
//   footLoaded   - pushes through a planted foot (needs the flat-foot check)
//   ankleContact - a band or weight rests on the foot/ankle (always refused)
//
// loadFactor.x scales the reference exercise's estimated 1RM to give a
// starting weight when this exercise is first introduced.

function ex(def) {
    const unit = def.unit || "reps";
    return {
        alr: 0,
        footLoaded: false,
        ankleContact: false,
        perSide: false,
        unit,
        needs: [],
        rest: 75,
        progression: def.implement === "band" ? "band"
            : (def.implement === "dumbbell" || def.implement === "kettlebell") ? "load"
                : unit === "seconds" ? "time" : "reps",
        alternatives: [],
        harder: null,
        bandable: false,
        startLoad: null,
        loadFactor: null,
        cap: unit === "seconds" ? 60 : 20,
        cues: [],
        ...def
    };
}

export const LIBRARY = [
    // ---- Push ----
    ex({ id: "db_bench", name: "DB bench press", pattern: "horizontal_push", region: "upper", implement: "dumbbell",
        needs: ["bench"], rest: 90, startLoad: 7.5, harder: "sa_db_bench",
        alternatives: ["db_floor_press", "sa_db_bench", "band_chest_press"],
        cues: ["Shoulder blades pinched", "Lower to mid-chest", "Feet up on the bench end if planting them bothers the ankle"] }),
    ex({ id: "db_floor_press", name: "DB floor press", pattern: "horizontal_push", region: "upper", implement: "dumbbell",
        needs: ["mat"], rest: 90, startLoad: 7.5, loadFactor: { ref: "db_bench", x: 1.0 },
        alternatives: ["db_bench", "band_chest_press"],
        cues: ["Lie on the mat, legs straight or knees bent", "Pause when the elbows touch the floor"] }),
    ex({ id: "sa_db_bench", name: "Single-arm DB bench press", pattern: "horizontal_push", region: "upper", implement: "dumbbell",
        needs: ["bench"], perSide: true, rest: 90, startLoad: 7.5, loadFactor: { ref: "db_bench", x: 0.9 },
        alternatives: ["db_bench", "db_floor_press"],
        cues: ["Free hand on the stomach", "Don't let the body roll toward the weight"] }),
    ex({ id: "db_fly", name: "DB fly", pattern: "chest_iso", region: "upper", implement: "dumbbell",
        needs: ["bench"], startLoad: 5, loadFactor: { ref: "db_bench", x: 0.5 },
        alternatives: ["band_chest_press"],
        cues: ["Soft bend in the elbows", "Stretch, don't drop, at the bottom"] }),
    ex({ id: "cg_db_press", name: "Close-grip DB press", pattern: "elbow_extension", region: "upper", implement: "dumbbell",
        needs: ["bench"], startLoad: 7.5, loadFactor: { ref: "db_bench", x: 0.8 },
        alternatives: ["lying_tri_ext", "seated_oh_tri_ext"],
        cues: ["Dumbbells touching, palms facing", "Elbows tucked close to the ribs"] }),
    ex({ id: "seated_db_press", name: "Seated DB shoulder press", pattern: "vertical_push", region: "upper", implement: "dumbbell",
        needs: ["bench"], rest: 90, startLoad: 5,
        alternatives: ["seated_arnold", "seated_kb_press"],
        cues: ["Sit tall on the bench", "Feet resting flat -- don't brace through them", "Press up and slightly in"] }),
    ex({ id: "seated_arnold", name: "Seated Arnold press", pattern: "vertical_push", region: "upper", implement: "dumbbell",
        needs: ["bench"], rest: 90, startLoad: 5, loadFactor: { ref: "seated_db_press", x: 0.85 },
        alternatives: ["seated_db_press", "seated_kb_press"],
        cues: ["Start palms facing you", "Rotate as you press"] }),
    ex({ id: "seated_lateral", name: "Seated DB lateral raise", pattern: "shoulder_iso", region: "upper", implement: "dumbbell",
        needs: ["bench"], rest: 60, startLoad: 2.5, loadFactor: { ref: "seated_db_press", x: 0.35 },
        alternatives: ["prone_y_raise"],
        cues: ["Lead with the elbows", "Stop at shoulder height"] }),
    ex({ id: "seated_kb_press", name: "Seated single-arm KB press", pattern: "vertical_push", region: "upper", implement: "kettlebell",
        needs: ["bench"], perSide: true, rest: 90, startLoad: 5, loadFactor: { ref: "seated_db_press", x: 1.0 },
        alternatives: ["seated_db_press", "seated_arnold"],
        cues: ["Bell rests on the back of the forearm", "Ribs down, no leaning back"] }),
    ex({ id: "lying_tri_ext", name: "Lying DB triceps extension", pattern: "elbow_extension", region: "upper", implement: "dumbbell",
        needs: ["bench"], rest: 60, startLoad: 5,
        alternatives: ["seated_oh_tri_ext", "cg_db_press"],
        cues: ["Elbows point at the ceiling", "Lower beside the head, not onto it"] }),
    ex({ id: "seated_oh_tri_ext", name: "Seated overhead DB triceps extension", pattern: "elbow_extension", region: "upper", implement: "dumbbell",
        needs: ["bench"], rest: 60, startLoad: 7.5, loadFactor: { ref: "lying_tri_ext", x: 1.6 },
        alternatives: ["lying_tri_ext"],
        cues: ["Both hands under the top plate", "Elbows stay narrow"] }),
    ex({ id: "band_chest_press", name: "Seated band chest press", pattern: "horizontal_push", region: "upper", implement: "band",
        needs: ["bench"], alternatives: ["db_floor_press"],
        cues: ["Anchor the band behind you at chest height", "Never loop it round your feet"] }),
    ex({ id: "knee_pushup_feet_up", name: "Push-up from knees, feet raised", pattern: "horizontal_push", region: "upper", implement: "bodyweight",
        needs: ["mat"], alr: 1, alternatives: ["db_floor_press"],
        cues: ["Shins on the mat, feet lifted off the floor", "Body straight from knees to head"] }),

    // ---- Pull ----
    ex({ id: "prone_db_row", name: "Prone DB row", pattern: "horizontal_pull", region: "upper", implement: "dumbbell",
        needs: ["bench"], rest: 90, startLoad: 7.5, harder: "prone_sa_row",
        alternatives: ["prone_sa_row", "band_row"],
        cues: ["Lie face-down on the bench", "Pull elbows toward the hips", "Squeeze the shoulder blades at the top"] }),
    ex({ id: "prone_sa_row", name: "Prone single-arm DB row (pause)", pattern: "horizontal_pull", region: "upper", implement: "dumbbell",
        needs: ["bench"], perSide: true, rest: 90, startLoad: 7.5, loadFactor: { ref: "prone_db_row", x: 1.0 },
        alternatives: ["prone_db_row", "band_row"],
        cues: ["1 s pause at the top", "Other hand holds the bench"] }),
    ex({ id: "prone_rear_delt", name: "Prone rear-delt raise", pattern: "shoulder_iso", region: "upper", implement: "dumbbell",
        needs: ["bench"], rest: 60, startLoad: 2.5, loadFactor: { ref: "prone_db_row", x: 0.3 },
        alternatives: ["band_face_pull", "band_pull_apart"],
        cues: ["Arms out wide, thumbs slightly down", "Light weight, slow reps"] }),
    ex({ id: "prone_y_raise", name: "Prone Y-raise", pattern: "shoulder_iso", region: "upper", implement: "dumbbell",
        needs: ["bench"], rest: 60, startLoad: 2.5, loadFactor: { ref: "prone_db_row", x: 0.2 },
        alternatives: ["prone_rear_delt", "band_face_pull"],
        cues: ["Raise arms in a Y shape", "Thumbs up"] }),
    ex({ id: "db_pullover", name: "Lying DB pullover", pattern: "pullover", region: "upper", implement: "dumbbell",
        needs: ["bench"], startLoad: 7.5, alternatives: ["kb_pullover", "band_lat_pulldown"],
        cues: ["Hold one dumbbell with both hands", "Slight elbow bend, reach back until the lats stretch"] }),
    ex({ id: "kb_pullover", name: "Lying KB pullover", pattern: "pullover", region: "upper", implement: "kettlebell",
        needs: ["bench"], startLoad: 7, loadFactor: { ref: "db_pullover", x: 1.0 },
        alternatives: ["db_pullover", "band_lat_pulldown"],
        cues: ["Hold the bell by the horns", "Ribs stay down"] }),
    ex({ id: "band_lat_pulldown", name: "Seated band lat pulldown", pattern: "vertical_pull", region: "upper", implement: "band",
        needs: ["bench"], alternatives: ["kneeling_band_pulldown", "db_pullover"],
        cues: ["Anchor the band over a door top", "Pull elbows down to the ribs"] }),
    ex({ id: "kneeling_band_pulldown", name: "Tall-kneeling band pulldown", pattern: "vertical_pull", region: "upper", implement: "band",
        needs: ["mat"], alr: 1, alternatives: ["band_lat_pulldown", "db_pullover"],
        cues: ["Folded mat under the shins and ankles", "Tall through the hips"] }),
    ex({ id: "band_row", name: "Seated band row", pattern: "horizontal_pull", region: "upper", implement: "band",
        needs: ["bench"], alternatives: ["prone_db_row"],
        cues: ["Anchor to a door at chest height -- not round the feet", "Elbows back, chest tall"] }),
    ex({ id: "band_face_pull", name: "Seated band face pull", pattern: "shoulder_iso", region: "upper", implement: "band",
        needs: ["bench"], rest: 60, alternatives: ["prone_rear_delt", "band_pull_apart"],
        cues: ["Anchor at head height", "Pull toward the eyes, elbows high"] }),
    ex({ id: "band_pull_apart", name: "Seated band pull-apart", pattern: "shoulder_iso", region: "upper", implement: "band",
        rest: 45, alternatives: ["band_face_pull", "prone_rear_delt"],
        cues: ["Arms straight", "Squeeze between the shoulder blades"] }),
    ex({ id: "seated_db_curl", name: "Seated DB curl", pattern: "elbow_flexion", region: "upper", implement: "dumbbell",
        needs: ["bench"], rest: 60, startLoad: 5, alternatives: ["seated_hammer", "concentration_curl"],
        cues: ["Elbows pinned to the sides", "Lower slowly"] }),
    ex({ id: "seated_hammer", name: "Seated hammer curl", pattern: "elbow_flexion", region: "upper", implement: "dumbbell",
        needs: ["bench"], rest: 60, startLoad: 5, loadFactor: { ref: "seated_db_curl", x: 1.1 },
        alternatives: ["seated_db_curl", "concentration_curl"],
        cues: ["Palms face each other throughout"] }),
    ex({ id: "concentration_curl", name: "Seated concentration curl", pattern: "elbow_flexion", region: "upper", implement: "dumbbell",
        needs: ["bench"], perSide: true, rest: 60, startLoad: 5, loadFactor: { ref: "seated_db_curl", x: 0.9 },
        alternatives: ["seated_db_curl", "seated_hammer"],
        cues: ["Elbow braced on the inner thigh", "Squeeze at the top"] }),

    // ---- Hips & legs (ankle-safe) ----
    ex({ id: "db_hip_thrust", name: "DB hip thrust", pattern: "hip_extension", region: "lower", implement: "dumbbell",
        needs: ["bench"], alr: 1, footLoaded: true, rest: 90, startLoad: 10, bandable: true, harder: "sl_hip_thrust",
        alternatives: ["glute_bridge", "prone_hip_extension"],
        cues: ["Upper back on the bench, DB across the hips", "Drive through the heels only as hard as is comfortable", "Chin tucked, ribs down at the top"] }),
    ex({ id: "sl_hip_thrust", name: "Single-leg DB hip thrust", pattern: "hip_extension", region: "lower", implement: "dumbbell",
        needs: ["bench"], alr: 1, footLoaded: true, perSide: true, rest: 90, startLoad: 5, loadFactor: { ref: "db_hip_thrust", x: 0.5 },
        alternatives: ["db_hip_thrust", "sl_glute_bridge"],
        cues: ["Start with the good-side foot", "Skip the injured side if you feel the ankle at all"] }),
    ex({ id: "glute_bridge", name: "Glute bridge (DB on hips)", pattern: "hip_extension", region: "lower", implement: "dumbbell",
        needs: ["mat"], alr: 1, footLoaded: true, startLoad: 7.5, bandable: true, loadFactor: { ref: "db_hip_thrust", x: 0.8 },
        alternatives: ["db_hip_thrust", "prone_hip_extension"],
        cues: ["Feet flat, knees bent", "Squeeze the glutes at the top for 1 s"] }),
    ex({ id: "sl_glute_bridge", name: "Single-leg glute bridge", pattern: "hip_extension", region: "lower", implement: "bodyweight",
        needs: ["mat"], alr: 1, footLoaded: true, perSide: true, harder: "sl_hip_thrust",
        alternatives: ["glute_bridge", "prone_hip_extension"],
        cues: ["Other knee hugged to the chest", "Hips level"] }),
    ex({ id: "banded_glute_bridge", name: "Banded glute bridge", pattern: "hip_extension", region: "lower", implement: "band",
        needs: ["mat"], alr: 1, footLoaded: true, alternatives: ["clamshell", "prone_hip_extension"],
        cues: ["Band just above the knees", "Push the knees out against it"] }),
    ex({ id: "clamshell", name: "Banded clamshell", pattern: "hip_abduction", region: "lower", implement: "band",
        needs: ["mat"], perSide: true, rest: 45, alternatives: ["side_lying_abduction", "fire_hydrant"],
        cues: ["Band above the knees", "Heels together, hips stacked"] }),
    ex({ id: "side_lying_abduction", name: "Banded side-lying hip abduction", pattern: "hip_abduction", region: "lower", implement: "band",
        needs: ["mat"], perSide: true, rest: 45, alternatives: ["clamshell", "fire_hydrant"],
        cues: ["Band above the knees", "Top leg straight, lift from the hip"] }),
    ex({ id: "fire_hydrant", name: "Banded fire hydrant", pattern: "hip_abduction", region: "lower", implement: "band",
        needs: ["mat"], perSide: true, rest: 45, alternatives: ["clamshell", "side_lying_abduction"],
        cues: ["On hands and knees, tops of the feet relaxed", "Folded mat under the shins"] }),
    ex({ id: "prone_hip_extension", name: "Prone straight-leg hip extension", pattern: "hip_extension", region: "lower", implement: "bodyweight",
        needs: ["bench"], alternatives: ["clamshell"],
        cues: ["Lie face-down, hips at the end of the bench", "Lift both straight legs to hip height"] }),
    ex({ id: "straight_leg_raise", name: "Lying straight-leg raise", pattern: "quad", region: "lower", implement: "bodyweight",
        needs: ["mat"], perSide: true, rest: 45, alternatives: [],
        cues: ["Other knee bent, foot flat", "Lock the knee of the lifting leg, lift to the other thigh's height"] }),
    ex({ id: "adductor_squeeze", name: "Seated adductor squeeze", pattern: "hip_adduction", region: "lower", implement: "bodyweight",
        unit: "seconds", needs: ["bench"], rest: 45, alternatives: [],
        cues: ["Folded band or cushion between the knees", "Squeeze steadily, keep breathing"] }),

    // ---- Opt-in ALR 2 (standing, two-footed) ----
    ex({ id: "kb_deadlift", name: "KB deadlift", pattern: "hinge", region: "lower", implement: "kettlebell",
        alr: 2, footLoaded: true, rest: 90, startLoad: 12, alternatives: ["db_rdl"],
        cues: ["Feet hip-width, flat", "Push the hips back, flat back"] }),
    ex({ id: "db_rdl", name: "DB Romanian deadlift", pattern: "hinge", region: "lower", implement: "dumbbell",
        alr: 2, footLoaded: true, rest: 90, startLoad: 10, loadFactor: { ref: "db_hip_thrust", x: 0.8 },
        alternatives: ["kb_deadlift"],
        cues: ["Soft knees", "Slide the weights down the thighs"] }),
    ex({ id: "goblet_box_squat", name: "Goblet box squat", pattern: "squat", region: "lower", implement: "dumbbell",
        needs: ["bench"], alr: 2, footLoaded: true, rest: 90, startLoad: 10, alternatives: [],
        cues: ["Sit back to the bench, light touch", "Only as deep as the ankle is comfortable"] }),
    ex({ id: "standing_db_press", name: "Standing DB shoulder press", pattern: "vertical_push", region: "upper", implement: "dumbbell",
        alr: 2, footLoaded: true, rest: 90, startLoad: 5, loadFactor: { ref: "seated_db_press", x: 1.0 },
        alternatives: ["seated_db_press"],
        cues: ["Feet hip-width, glutes tight"] }),

    // ---- Core ----
    ex({ id: "dead_bug", name: "Dead bug", pattern: "core_antiextension", region: "core", implement: "bodyweight",
        needs: ["mat"], perSide: true, rest: 45, cap: 12, harder: "weighted_dead_bug",
        alternatives: ["hollow_hold", "knee_plank"],
        cues: ["Low back pressed into the mat", "Opposite arm and leg, slowly"] }),
    ex({ id: "weighted_dead_bug", name: "Dead bug holding a DB", pattern: "core_antiextension", region: "core", implement: "dumbbell",
        needs: ["mat"], perSide: true, rest: 45, startLoad: 2.5, alternatives: ["dead_bug"],
        cues: ["Hold the DB over the chest with both hands"] }),
    ex({ id: "knee_plank", name: "Forearm plank from knees", pattern: "core_antiextension", region: "core", implement: "bodyweight",
        unit: "seconds", needs: ["mat"], rest: 45, harder: "plank",
        alternatives: ["dead_bug", "hollow_hold"],
        cues: ["Straight line knees to head", "Squeeze glutes"] }),
    ex({ id: "plank", name: "Forearm plank", pattern: "core_antiextension", region: "core", implement: "bodyweight",
        unit: "seconds", needs: ["mat"], alr: 1, footLoaded: true, rest: 45,
        alternatives: ["knee_plank", "hollow_hold"],
        cues: ["Only if toes-on-floor is comfortable for the ankle"] }),
    ex({ id: "side_plank_knees", name: "Side plank from knees", pattern: "core_lateral", region: "core", implement: "bodyweight",
        unit: "seconds", needs: ["mat"], perSide: true, rest: 45, alternatives: ["pallof_press"],
        cues: ["Elbow under the shoulder", "Hips high"] }),
    ex({ id: "hollow_hold", name: "Hollow body hold", pattern: "core_antiextension", region: "core", implement: "bodyweight",
        unit: "seconds", needs: ["mat"], rest: 45, alternatives: ["dead_bug", "knee_plank"],
        cues: ["Bend the knees to make it easier", "Low back stays down"] }),
    ex({ id: "pallof_press", name: "Seated Pallof press", pattern: "core_antirotation", region: "core", implement: "band",
        needs: ["bench"], perSide: true, rest: 45, alternatives: ["side_plank_knees"],
        cues: ["Band anchored to the side at chest height", "Press out, don't let it pull you round"] }),
    ex({ id: "kb_pullover_crunch", name: "Lying KB pullover crunch", pattern: "core_flexion", region: "core", implement: "kettlebell",
        needs: ["mat"], rest: 45, startLoad: 5, alternatives: ["leg_raise"],
        cues: ["Pull the bell over the chest as the shoulders lift"] }),
    ex({ id: "leg_raise", name: "Lying bent-knee leg raise", pattern: "core_flexion", region: "core", implement: "bodyweight",
        needs: ["mat"], rest: 45, alternatives: ["dead_bug"],
        cues: ["Hands under the hips", "Lower slowly"] }),
    ex({ id: "bird_dog", name: "Bird dog", pattern: "core_antirotation", region: "core", implement: "bodyweight",
        needs: ["mat"], alr: 1, perSide: true, rest: 45, alternatives: ["dead_bug"],
        cues: ["Folded mat under the shins and ankles", "Reach long, hips level"] }),

    // ---- Conditioning ----
    ex({ id: "bike_z2", name: "Bike: easy steady ride", pattern: "conditioning", region: "conditioning", implement: "bike",
        unit: "minutes", alr: 1, alternatives: ["band_circuit"],
        cues: ["Conversational pace, effort 4-5 out of 10", "Low resistance, pedal with the midfoot"] }),
    ex({ id: "bike_intervals", name: "Bike: intervals", pattern: "conditioning", region: "conditioning", implement: "bike",
        unit: "minutes", alr: 1, alternatives: ["band_circuit"],
        cues: ["30 s brisk / 90 s easy", "Brisk means hard breathing, not an all-out sprint"] }),
    ex({ id: "band_circuit", name: "Seated band circuit", pattern: "conditioning", region: "conditioning", implement: "band",
        unit: "minutes", alternatives: [],
        cues: ["Pull-apart, chest press, row, Pallof press -- 40 s each, 20 s rest, repeat"] })
];

// Exercises done with a dumbbell in each hand: the weight shown is per hand.
const PAIRS = ["db_bench", "db_floor_press", "db_fly", "cg_db_press", "seated_db_press", "seated_arnold", "seated_lateral",
    "lying_tri_ext", "prone_db_row", "prone_rear_delt", "prone_y_raise", "seated_db_curl", "seated_hammer", "db_rdl", "standing_db_press"];
for (const e of LIBRARY) e.pair = PAIRS.includes(e.id);

const BY_ID = new Map(LIBRARY.map(e => [e.id, e]));

export function getExercise(id) {
    const e = BY_ID.get(id);
    if (!e) throw new Error("Unknown exercise: " + id);
    return e;
}

export function hasExercise(id) {
    return BY_ID.has(id);
}
