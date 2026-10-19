// Steady Gains - 26-week programme generator (PLAN.md sections 4 and 5).
// Turns the profile and kit into a dated calendar of sessions. Every
// exercise goes through safety.resolveItems, so the output never contains
// anything above the user's ankle ceiling.
//
// Items carry the block's own sets and rep range; deload, calibration and
// retest weeks keep those and say how to modify them in week.mods, so an
// exercise's progression state isn't disturbed by an easy week.

import { LIBRARY } from "./library.js";
import { resolveItems, effectiveCeiling, isAllowed } from "./safety.js";
import { addDays, weekdayOf } from "./dates.js";

export const TOTAL_WEEKS = 26;
export const ROTATION = ["A", "B", "C"];

export const BLOCKS = [
    { id: "B1", name: "Foundation", build: [2, 6], deload: 7, main: { sets: 3, reps: [12, 15] }, accessory: { sets: 3, reps: [12, 15] }, rir: [3, 2] },
    { id: "B2", name: "Build", build: [8, 12], deload: 13, main: { sets: 3, reps: [10, 12] }, accessory: { sets: 3, reps: [10, 12] }, rir: [2, 2] },
    { id: "B3", name: "Strength-hypertrophy", build: [14, 18], deload: 19, main: { sets: 4, reps: [8, 10] }, accessory: { sets: 3, reps: [10, 12] }, rir: [2, 1] },
    { id: "B4", name: "Consolidate", build: [20, 25], deload: null, main: { sets: 4, reps: [6, 10] }, accessory: { sets: 3, reps: [10, 12] }, rir: [2, 1] }
];

// Template shorthands: main lift, accessory, core. Sets/reps default to the
// block's scheme for main and accessory items; core always states its own.
const m = (exerciseId, extra = {}) => ({ exerciseId, role: "main", ...extra });
const a = (exerciseId, extra = {}) => ({ exerciseId, role: "accessory", ...extra });
const c = (exerciseId, sets, reps, extra = {}) => ({ exerciseId, role: "core", sets, reps, ...extra });

export const TEMPLATES = {
    B1: {
        A: [m("db_bench"), m("db_hip_thrust"), a("seated_db_press"), a("lying_tri_ext", { sets: 2 }),
            a("clamshell", { sets: 2, reps: [15, 20] }), c("dead_bug", 2, [6, 10])],
        B: [m("prone_db_row"), m("glute_bridge", { reps: [15, 20] }), a("band_lat_pulldown"), a("seated_db_curl", { sets: 2 }),
            a("prone_y_raise", { sets: 2 }), c("knee_plank", 3, [20, 30])],
        C: [m("db_floor_press"), m("db_pullover"), a("sl_glute_bridge", { sets: 2, reps: [10, 12] }), a("seated_lateral", { sets: 2 }),
            a("band_face_pull", { sets: 2, reps: [15, 20] }), c("pallof_press", 2, [8, 12])]
    },
    B2: {
        A: [m("db_bench"), m("db_hip_thrust"), a("seated_arnold"), a("cg_db_press", { sets: 2 }),
            a("banded_glute_bridge", { sets: 2, reps: [15, 20] }), c("weighted_dead_bug", 2, [6, 10])],
        B: [m("prone_sa_row", { note: "1 s pause at the top" }), m("glute_bridge"), a("band_lat_pulldown"), a("seated_hammer", { sets: 2 }),
            a("prone_y_raise", { sets: 2 }), c("side_plank_knees", 2, [20, 30])],
        C: [m("db_floor_press"), m("kb_pullover"), a("sl_glute_bridge", { sets: 2, reps: [10, 12] }), a("seated_lateral", { sets: 2 }),
            a("band_face_pull", { sets: 2, reps: [15, 20] }), a("prone_hip_extension", { sets: 2, reps: [12, 15] }), c("pallof_press", 2, [8, 12])]
    },
    B3: {
        A: [m("db_bench"), m("db_hip_thrust"), a("seated_db_press"), a("lying_tri_ext"),
            a("clamshell", { sets: 2, reps: [15, 20] }), c("weighted_dead_bug", 3, [6, 10])],
        B: [m("prone_db_row"), m("glute_bridge"), a("band_lat_pulldown"), a("concentration_curl", { sets: 2 }),
            a("prone_rear_delt", { sets: 2 }), c("hollow_hold", 3, [20, 30])],
        C: [m("db_floor_press"), m("db_pullover"), a("sl_glute_bridge", { sets: 2, reps: [10, 12] }),
            a("seated_lateral", { sets: 2, note: "2 s hold at the top" }), a("band_row"), c("pallof_press", 3, [8, 12])]
    },
    B4: {
        A: [m("db_bench"), m("db_hip_thrust"), a("seated_arnold", { superset: "1" }), a("prone_rear_delt", { superset: "1" }),
            a("cg_db_press", { sets: 2, superset: "2" }), a("fire_hydrant", { sets: 2, reps: [12, 15], superset: "2" }), c("weighted_dead_bug", 3, [8, 12])],
        B: [m("prone_db_row"), m("glute_bridge"), a("band_lat_pulldown", { superset: "1" }), a("seated_lateral", { superset: "1" }),
            a("seated_hammer", { sets: 2, superset: "2" }), a("lying_tri_ext", { sets: 2, superset: "2" }), c("hollow_hold", 3, [25, 40])],
        C: [m("sa_db_bench"), m("prone_sa_row"), a("sl_hip_thrust", { reps: [8, 12] }), a("db_fly", { superset: "1" }),
            a("band_face_pull", { reps: [15, 20], superset: "1" }), c("pallof_press", 3, [10, 12])]
    }
};

// Only offered when the user has unlocked ALR 2 (e.g. physio clearance):
// a standing lower-body lift after the first main lift, from Block 2 on.
export const ALR2_EXTRAS = {
    B2: { A: "goblet_box_squat", B: "kb_deadlift" },
    B3: { A: "goblet_box_squat", B: "db_rdl" },
    B4: { A: "goblet_box_squat", B: "db_rdl" }
};

// Bike prescriptions per block: the nth bike day of a week gets entry n.
export const BIKE = {
    calibration: [{ exerciseId: "bike_z2", minutes: 20 }],
    B1: [{ exerciseId: "bike_z2", minutes: 20 }],
    B2: [{ exerciseId: "bike_z2", minutes: 25 }],
    B3: [{ exerciseId: "bike_z2", minutes: 25 }, { exerciseId: "bike_intervals", minutes: 20, intervals: { count: 6, workSec: 30, restSec: 90 } }],
    B4: [{ exerciseId: "bike_z2", minutes: 30 }, { exerciseId: "bike_intervals", minutes: 24, intervals: { count: 8, workSec: 30, restSec: 90 } }],
    deload: [{ exerciseId: "bike_z2", minutes: 15 }],
    retest: [{ exerciseId: "bike_z2", minutes: 20 }]
};

export const WARMUP = [
    { exerciseId: "bike_z2", minutes: 5 },
    { exerciseId: "band_pull_apart", sets: 2, reps: [15, 15] }
];

// The main lifts measured in week 1 and again in week 26.
export const TEST_LIFTS = ["db_bench", "db_hip_thrust", "prone_db_row", "glute_bridge", "db_floor_press", "db_pullover"];

// What kind of week n is, and which block's templates it uses.
export function weekInfo(n) {
    if (n === 1) return { phase: "calibration", blockId: "B1", mods: { calibration: true, rir: 3 } };
    if (n === TOTAL_WEEKS) return { phase: "retest", blockId: "B1", mods: { retest: true, deload: true, rir: 4 } };
    for (const b of BLOCKS) {
        if (n >= b.build[0] && n <= b.build[1]) {
            const span = b.build[1] - b.build[0];
            const t = span === 0 ? 1 : (n - b.build[0]) / span;
            // Effort target steps from the block's start RIR to its end RIR
            // over the second half of the block.
            return { phase: "build", blockId: b.id, mods: { rir: t < 0.5 ? b.rir[0] : b.rir[1] } };
        }
        if (n === b.deload) return { phase: "deload", blockId: b.id, mods: { deload: true, rir: 4 } };
    }
    throw new Error("Week out of range: " + n);
}

function blockById(id) {
    return BLOCKS.find(b => b.id === id);
}

// Fill in sets/reps from the block scheme and apply session length.
function buildItems(blockId, template, phase, profile) {
    const block = blockById(blockId);
    let items = TEMPLATES[blockId][template].map(item => {
        const scheme = item.role === "core" ? item : block[item.role];
        return { ...item, sets: item.sets || scheme.sets, reps: item.reps || scheme.reps };
    });

    const extra = ALR2_EXTRAS[blockId] && ALR2_EXTRAS[blockId][template];
    if (extra && effectiveCeiling(profile) >= 2 && phase !== "calibration" && phase !== "retest") {
        items.splice(1, 0, { exerciseId: extra, role: "main", sets: block.main.sets, reps: block.main.reps });
    }

    const minutes = profile.sessionMinutes || 45;
    if (minutes <= 35) {
        const last = items.map(i => i.role).lastIndexOf("accessory");
        if (last >= 0) items.splice(last, 1);
    } else if (minutes >= 60) {
        items = items.map(i => (i.role === "accessory" ? { ...i, sets: Math.min(4, i.sets + 1) } : i));
    }

    if (phase === "calibration") {
        items = items.map(i => (i.role === "core" ? { ...i, sets: 2 } : { ...i, sets: 2, reps: [10, 12], calibrate: true }));
    }
    if (phase === "retest") {
        items = items.map(i => (TEST_LIFTS.includes(i.exerciseId) ? { ...i, test: "amrap" } : i));
    }
    return items;
}

function bikeKey(phase, blockId) {
    if (phase === "calibration" || phase === "deload" || phase === "retest") return phase;
    return blockId;
}

// profile: { ankle, schedule: { strength: [...], bike: [...] }, sessionMinutes,
// startDate }. Returns { startDate, weeks: [{ n, phase, blockId, mods,
// start, sessions }] }.
export function generateProgramme(profile, equipment, library = LIBRARY) {
    const ctx = { profile, equipment };
    const schedule = profile.schedule || { strength: ["mon", "wed", "fri"], bike: ["tue", "sat"] };
    const weeks = [];
    let rotation = 0;

    for (let n = 1; n <= TOTAL_WEEKS; n++) {
        const info = weekInfo(n);
        const start = addDays(profile.startDate, 7 * (n - 1));
        const sessions = [];
        let bikeIndex = 0;
        for (let d = 0; d < 7; d++) {
            const date = addDays(start, d);
            const day = weekdayOf(date);
            if (schedule.strength.includes(day)) {
                const template = ROTATION[rotation++ % ROTATION.length];
                const resolved = resolveItems(buildItems(info.blockId, template, info.phase, profile), ctx, library);
                const warmup = resolveItems(WARMUP, ctx, library);
                sessions.push({ date, kind: "strength", template, warmup: warmup.items, ...resolved });
            } else if ((schedule.bike || []).includes(day)) {
                const options = BIKE[bikeKey(info.phase, info.blockId)];
                const plan = options[bikeIndex++ % options.length];
                const resolved = resolveItems([plan], ctx, library);
                const item = resolved.items[0];
                if (item) {
                    // The seated band circuit stands in for the bike when
                    // cycling is off; keep it to a sensible length.
                    const swapped = item.exerciseId !== plan.exerciseId;
                    sessions.push({ date, kind: "conditioning", items: [swapped ? { exerciseId: item.exerciseId, minutes: Math.min(plan.minutes, 20), swappedFrom: plan.exerciseId } : item], swaps: resolved.swaps, dropped: resolved.dropped });
                }
            }
        }
        sessions.forEach((s, k) => { s.id = "w" + n + "-" + k; });
        weeks.push({ n, ...info, start, sessions });
    }
    return { startDate: profile.startDate, weeks };
}

// 15+ days off: insert an easy week before the block resumes. The new week
// takes the dates and block of week `atWeek`; it and everything after move
// back a week.
export function insertDeloadWeek(programme, atWeek) {
    const i = programme.weeks.findIndex(w => w.n === atWeek);
    if (i < 0) throw new Error("No week " + atWeek);
    const shift = w => ({
        ...w,
        n: w.n + 1,
        start: addDays(w.start, 7),
        sessions: w.sessions.map(s => ({ ...s, date: addDays(s.date, 7) }))
    });
    const template = programme.weeks[i];
    // Session ids stay stable for the weeks that move, so completed sessions
    // stay completed; the new week's sessions get ids of their own.
    const tag = "-d" + (programme.weeks.filter(w => w.inserted).length + 1);
    const deload = {
        ...template, phase: "deload", mods: { deload: true, rir: 4 }, inserted: true,
        sessions: template.sessions.map(s => ({ ...s, id: s.id + tag }))
    };
    return {
        ...programme,
        weeks: [...programme.weeks.slice(0, i), deload, ...programme.weeks.slice(i).map(shift)]
    };
}

// Every exercise in the calendar that fails the safety filter. Should always
// be empty; the app checks it after generating and refuses to save a plan
// that isn't.
export function validateProgramme(programme, ctx, library = LIBRARY) {
    const byId = new Map(library.map(e => [e.id, e]));
    const problems = [];
    for (const w of programme.weeks) {
        for (const s of w.sessions) {
            for (const item of [...(s.warmup || []), ...s.items]) {
                const ex = byId.get(item.exerciseId);
                if (!ex || !isAllowed(ex, ctx)) problems.push({ week: w.n, date: s.date, exerciseId: item.exerciseId });
            }
        }
    }
    return problems;
}

export function weekForDate(programme, date) {
    return programme.weeks.find(w => date >= w.start && date < addDays(w.start, 7)) || null;
}

export function nextSession(programme, today) {
    for (const w of programme.weeks) {
        for (const s of w.sessions) {
            if (s.date >= today) return { week: w, session: s };
        }
    }
    return null;
}
