// Steady Gains - progression engine (PLAN.md section 6). Pure functions only:
// state in, state out, no DOM and no storage, so every rule is unit-tested.
//
// One state object per exercise:
//   { exerciseId, load, baseRange, repRange, sets, targets, successStreak,
//     failStreak, stepPlan, repExtended, floor, ceilingStage, tempo,
//     technique, addedBand, softCeiling, e1rm, stalls, ankleFlags,
//     suspendedUntil, excluded, suggestSwap, lastPerformed, baseline }
//
// load is a value on the exercise's load ladder (equipment.js), or null for
// bodyweight/timed work. targets[i] is the rep (or seconds) goal for set i.
// stepPlan, when set, is the load for each set while bridging a big jump.

import { nextLoad, prevLoad, snapDown, isMaxLoad, labelFor } from "./equipment.js";
import { getExercise } from "./library.js";

// How eager the engine is to add weight. "gentle" is the default: a rep a
// session, and the top of the range twice before the weight goes up.
export const PACES = {
    gentle: { streakNeeded: 2, nudgeSets: Infinity },
    steady: { streakNeeded: 1, nudgeSets: Infinity },
    easy: { streakNeeded: 3, nudgeSets: 2 }
};
export const DEFAULT_RIR = 2;

export const SMALL_JUMP = 0.15;   // straight jump at or under +15 %
export const MEDIUM_JUMP = 0.35;  // rep extension first up to +35 %; step loading above
export const REP_EXTENSION = 2;
export const CEILING_REP_EXTENSION = 3;
export const STALLS_BEFORE_ROTATE = 3;

// Ceiling ladder stages used once there's no heavier weight to move to.
export const CEILING_STAGES = ["none", "more reps", "slow lowering", "pause", "single-arm/leg", "add band", "last-set technique"];

const repStep = ex => (ex.unit === "seconds" ? 5 : 1);
const rangeStep = ex => (ex.unit === "seconds" ? 5 : 2);
// Miss thresholds while settling into a heavier weight.
const jumpFloor = lo => Math.max(3, lo - 2);
const stepFloor = lo => Math.max(3, Math.round(lo * 0.6));

// ---- Estimates ---------------------------------------------------------

// Epley, with reps in reserve added back so a set stopped at RIR 2 still
// estimates the same strength as one taken closer to failure.
export function e1rm(load, reps, rir = 0) {
    if (!load || !reps) return null;
    return Math.round(load * (1 + (reps + Math.min(rir, 3)) / 30) * 10) / 10;
}

// Heaviest available load expected to give `reps` reps at `rir` RIR.
export function loadForReps(e1rmValue, reps, rir, ladder) {
    if (!e1rmValue || ladder.length === 0) return null;
    return snapDown(ladder, e1rmValue / (1 + (reps + rir) / 30)).value;
}

// Reps expected at `load`, stopping `rir` short of failure (Epley inverted).
export function predictReps(e1rmValue, load, rir) {
    if (!e1rmValue || !load) return null;
    return Math.floor(30 * (e1rmValue / load - 1)) - rir;
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

function sessionBestE1rm(sets) {
    let best = null;
    for (const s of sets) {
        const v = e1rm(s.load, s.reps, s.rir);
        if (v && (best === null || v > best)) best = v;
    }
    return best;
}

// ---- State creation ----------------------------------------------------

// item = { exerciseId, sets, reps: [lo, hi] } from the programme.
// refStates lets a new variation borrow strength from a related exercise.
export function createState(exercise, item, ladder, refStates = {}) {
    let load = null;
    if (ladder.length > 0) {
        const ref = exercise.loadFactor && refStates[exercise.loadFactor.ref];
        if (ref && ref.e1rm) {
            load = loadForReps(ref.e1rm * exercise.loadFactor.x, item.reps[1], 2, ladder);
        } else {
            load = snapDown(ladder, exercise.startLoad != null ? exercise.startLoad : ladder[0].value).value;
        }
    }
    return {
        exerciseId: exercise.id,
        load,
        baseRange: [...item.reps],
        repRange: [...item.reps],
        sets: item.sets,
        targets: Array(item.sets).fill(item.reps[0]),
        successStreak: 0,
        failStreak: 0,
        stepPlan: null,
        repExtended: false,
        floor: item.reps[0],
        ceilingStage: 0,
        tempo: null,
        technique: null,
        addedBand: null,
        softCeiling: null,
        e1rm: null,
        stalls: 0,
        ankleFlags: 0,
        suspendedUntil: null,
        excluded: false,
        suggestSwap: null,
        lastPerformed: null,
        baseline: null
    };
}

// A new block changes the rep range and/or set count. Carry strength over
// via e1RM, but never move more than one load step either way, clear the
// temporary bridges, and keep any ceiling-ladder progress.
export function transitionState(state, item, ladder) {
    if (state.baseRange[0] === item.reps[0] && state.baseRange[1] === item.reps[1] && state.sets === item.sets) {
        return state;
    }
    const [lo, hi] = item.reps;
    let load = state.load;
    let start = lo;
    if (ladder.length > 0 && state.e1rm) {
        const est = loadForReps(state.e1rm, item.reps[0], 2, ladder);
        const up = nextLoad(ladder, state.load);
        const down = prevLoad(ladder, state.load);
        load = Math.min(Math.max(est, down ? down.value : state.load), up ? up.value : state.load);
        // Start where the strength estimate says you are, not at the
        // bottom of the range, so a new block doesn't undo rep progress.
        start = clamp(predictReps(state.e1rm, load, DEFAULT_RIR), lo, hi);
    }
    // A soft ceiling gets a fresh try each block; a real one (top of the
    // rack) keeps its ceiling-ladder progress.
    const atMax = ladder.length > 0 && isMaxLoad(ladder, load);
    const ceiling = atMax ? {} : { ceilingStage: 0, tempo: null, technique: null, addedBand: null };
    return {
        ...state,
        ...ceiling,
        load,
        baseRange: [...item.reps],
        repRange: [...item.reps],
        sets: item.sets,
        targets: Array(item.sets).fill(start),
        successStreak: 0,
        failStreak: 0,
        stepPlan: null,
        repExtended: false,
        floor: lo,
        softCeiling: null,
        stalls: 0,
        suggestSwap: null
    };
}

// ---- Prescription ------------------------------------------------------

// What to do in the next session. mods come from sessionModifiers() plus the
// programme week: { deload, lighterDay, loadMultiplier, rir }.
export function prescribe(state, ladder, mods = {}) {
    let sets = state.sets;
    if (mods.deload) sets = Math.max(1, Math.round(sets * 0.6));
    else if (mods.lighterDay) sets = Math.max(1, sets - 1);

    const out = [];
    for (let i = 0; i < sets; i++) {
        // Easy sessions stay at the established weight, not a new heavy one.
        let load = state.stepPlan && !mods.deload && !mods.lighterDay ? state.stepPlan[i] : state.load;
        if (load != null && mods.loadMultiplier && mods.loadMultiplier < 1) {
            load = snapDown(ladder, load * mods.loadMultiplier).value;
        }
        let reps = state.targets[i] != null ? state.targets[i] : state.repRange[0];
        if (mods.deload || mods.lighterDay) reps = state.baseRange[0];
        out.push({ setIndex: i, load, targetReps: reps });
    }
    return {
        exerciseId: state.exerciseId,
        sets: out,
        repRange: [...state.repRange],
        rir: mods.deload ? 4 : mods.lighterDay ? Math.max(3, mods.rir || 0) : (mods.rir != null ? mods.rir : 2),
        tempo: state.tempo,
        technique: mods.deload || mods.lighterDay ? null : state.technique,
        addedBand: state.addedBand
    };
}

// ---- Session-level adjustments (PLAN.md 6.7) ---------------------------

// readiness: { sleep, energy, soreness } each 1-5 where 5 is best (soreness 5
// means not sore at all). daysSinceLast: days since the previous strength
// session, or null for the first one.
export function sessionModifiers({ readiness, daysSinceLast } = {}) {
    const mods = { lighterDay: false, loadMultiplier: 1, miniDeload: false, reasons: [] };
    if (readiness) {
        const avg = (readiness.sleep + readiness.energy + readiness.soreness) / 3;
        if (avg <= 2) {
            mods.lighterDay = true;
            mods.reasons.push("Low readiness: lighter day, nothing counted against you");
        }
    }
    if (daysSinceLast != null && daysSinceLast >= 15) {
        mods.loadMultiplier = 0.8;
        mods.miniDeload = true;
        mods.reasons.push("Over two weeks off: loads -20 % and an easy week to ease back in");
    } else if (daysSinceLast != null && daysSinceLast >= 8) {
        mods.loadMultiplier = 0.9;
        mods.reasons.push("Over a week off: loads -10 % for this session");
    }
    return mods;
}

// Volume load (kg x reps) of a list of logged sets. Only dumbbell and
// kettlebell sets count: band "loads" are tension units, not kg.
export function volumeLoad(sets, implementOf = id => getExercise(id).implement) {
    return sets.reduce((sum, s) => {
        const kg = s.completed !== false && s.load && ["dumbbell", "kettlebell"].includes(implementOf(s.exerciseId));
        return sum + (kg ? s.load * s.reps : 0);
    }, 0);
}

// Hold any further weight increases this week once volume load is more than
// 10 % above the previous build week.
export function shouldHoldIncreases(thisWeekVolume, previousBuildWeekVolume) {
    return previousBuildWeekVolume > 0 && thisWeekVolume > previousBuildWeekVolume * 1.1;
}

// ---- After a session ---------------------------------------------------

function freshCycle(state, range) {
    return {
        ...state,
        repRange: [...range],
        targets: Array(state.sets).fill(range[0]),
        successStreak: 0,
        failStreak: 0
    };
}

// Next session's targets when the work was inside the range. Each set
// starts from last time's reps. A set left with more in reserve than the
// session asked for gets credit for the spare reps (12 reps at "3+" when 2
// was asked -> 13). Otherwise one step is added, on up to `nudgeSets` sets,
// but only where the set wasn't already harder than asked.
// 12,11,10 at 10-12, all at RIR 2 -> 12,12,11.
export function nudgeTargets(sets, state, exercise, nudgeSets, targetRir = DEFAULT_RIR) {
    const [lo, hi] = state.repRange;
    const step = repStep(exercise);
    const targets = [];
    let nudged = 0;
    for (let i = 0; i < state.sets; i++) {
        const done = sets[i];
        if (!done) {
            targets.push(state.targets[i] != null ? state.targets[i] : lo);
            continue;
        }
        const spare = Math.max(0, done.rir - targetRir);
        let t = done.reps + spare * step;
        if (spare === 0 && done.rir > 0 && done.rir >= targetRir && t < hi && nudged < nudgeSets) {
            t += step;
            nudged++;
        }
        targets.push(clamp(t, lo, hi));
    }
    return targets;
}

// No heavier weight to use: climb the ceiling ladder one stage.
function climbCeiling(state, exercise, equipment) {
    const [lo, hi] = state.baseRange;
    let stage = state.ceilingStage + 1;
    // Skip stages that don't apply to this exercise.
    while (stage < CEILING_STAGES.length) {
        if (stage === 4 && !exercise.harder) { stage++; continue; }
        if (stage === 5 && (!exercise.bandable || !equipment || !(equipment.band || []).length)) { stage++; continue; }
        break;
    }
    const base = { ...state, ceilingStage: stage, repExtended: false, floor: lo };
    switch (stage) {
        case 1:
            return { state: freshCycle(base, [lo, hi + CEILING_REP_EXTENSION]), change: { type: "ceiling", stage, reason: "Top weight reached: range extended to " + lo + "-" + (hi + CEILING_REP_EXTENSION) } };
        case 2:
            return { state: freshCycle({ ...base, tempo: "3-0-1" }, [lo, hi]), change: { type: "ceiling", stage, reason: "Top weight reached: 3 s lowering on every rep" } };
        case 3:
            return { state: freshCycle({ ...base, tempo: "3-1-1" }, [lo, hi]), change: { type: "ceiling", stage, reason: "Top weight reached: 3 s lowering plus a 1 s pause" } };
        case 4:
            return { state: freshCycle({ ...base, suggestSwap: exercise.harder }, [lo, hi]), change: { type: "swap", stage, to: exercise.harder, reason: "Ready for a harder variation" } };
        case 5: {
            const band = equipment.band[0];
            return { state: freshCycle({ ...base, addedBand: band }, [lo, hi]), change: { type: "ceiling", stage, reason: "Top weight reached: add the " + band + " band" } };
        }
        case 6:
            return { state: freshCycle({ ...base, technique: "rest-pause" }, [lo, hi]), change: { type: "ceiling", stage, reason: "Top weight reached: rest-pause on the last set" } };
        default:
            return { state: { ...state, ceilingStage: CEILING_STAGES.length - 1, suggestSwap: exercise.harder || "rotate", successStreak: 0 }, change: { type: "rotate", reason: "Maxed out with this kit: rotate to a new variation next block" } };
    }
}

// Raise the band added at ceiling stage 5 before moving to stage 6.
function climbAddedBand(state, exercise, equipment) {
    const bands = equipment.band || [];
    const i = bands.indexOf(state.addedBand);
    if (i >= 0 && i < bands.length - 1) {
        const band = bands[i + 1];
        return { state: freshCycle({ ...state, addedBand: band }, state.baseRange), change: { type: "ceiling", stage: 5, reason: "Band up to " + band } };
    }
    return climbCeiling(state, exercise, equipment);
}

function increase(state, exercise, ladder, equipment, pace) {
    const [lo, hi] = state.baseRange;

    // Bodyweight and timed work: shift the range up until the cap, then ask
    // for a harder variation.
    if (ladder.length === 0) {
        const step = rangeStep(exercise);
        if (state.repRange[1] + step <= exercise.cap) {
            const range = [state.repRange[0] + step, state.repRange[1] + step];
            return { state: { ...freshCycle(state, range), baseRange: range, floor: range[0] }, change: { type: "range", reason: "Range up to " + range[0] + "-" + range[1] } };
        }
        if (exercise.harder && !state.suggestSwap) {
            return { state: { ...state, suggestSwap: exercise.harder, successStreak: 0 }, change: { type: "swap", to: exercise.harder, reason: "Ready for a harder variation" } };
        }
        return { state: { ...state, successStreak: 0 }, change: { type: "hold", reason: "At the top of this exercise: keep it as is" } };
    }

    if (state.ceilingStage === 5 && state.addedBand) return climbAddedBand(state, exercise, equipment);
    if (state.ceilingStage > 0) return climbCeiling(state, exercise, equipment);

    const next = nextLoad(ladder, state.load);
    if (!next || (state.softCeiling != null && state.load >= state.softCeiling)) {
        return climbCeiling(state, exercise, equipment);
    }

    // How many reps the strength estimate says you'd get at the new weight.
    const jump = (next.value - state.load) / state.load;
    const predicted = predictReps(state.e1rm, next.value, DEFAULT_RIR);
    const landing = predicted == null ? lo : predicted;
    const shortOfRange = landing < lo;

    if (shortOfRange && jump > SMALL_JUMP && jump <= MEDIUM_JUMP && !state.repExtended) {
        const s = { ...state, repExtended: true, repRange: [lo, hi + REP_EXTENSION], successStreak: 0, failStreak: 0 };
        s.targets = Array.from({ length: state.sets }, (_, i) => (i < pace.nudgeSets ? hi + 1 : hi));
        return { state: s, change: { type: "extend", reason: "Next weight is a big jump: build to " + (hi + REP_EXTENSION) + " reps first" } };
    }
    if (jump <= MEDIUM_JUMP || !shortOfRange) {
        // Land a couple of reps under the range if that's what the estimate
        // says; those sessions don't count as misses.
        const floor = shortOfRange ? jumpFloor(lo) : lo;
        const s = {
            ...freshCycle({ ...state, load: next.value, repExtended: false, floor }, [lo, hi]),
            targets: Array(state.sets).fill(clamp(landing, floor, hi))
        };
        return { state: s, change: { type: "increase", load: next.value, reason: "Earned it: up to " + next.label } };
    }
    // Predicted not to manage a single rep: make the current weight harder
    // instead, until the next block tries again. (The estimate runs low for
    // light weights, since "3+" in reserve is counted as 3, so anything
    // above that is worth one real attempt.)
    if (predictReps(state.e1rm, next.value, 0) < 1) {
        return climbCeiling({ ...state, softCeiling: state.load }, exercise, equipment);
    }
    // Over +35 % and short of the range: move one set at a time.
    const stepPlan = Array(state.sets).fill(state.load);
    stepPlan[0] = next.value;
    const targets = stepPlan.map((l, i) => (i === 0 ? stepFloor(lo) : hi));
    return {
        state: { ...state, stepPlan, targets, successStreak: 0, failStreak: 0, floor: stepFloor(lo) },
        change: { type: "step", load: next.value, reason: "Big jump to " + next.label + ": first set only, the rest stay at the old weight" }
    };
}

function decrease(state, ladder) {
    const lo = state.baseRange[0];
    const stalls = state.stalls + 1;
    const suggestSwap = stalls >= STALLS_BEFORE_ROTATE ? "rotate" : state.suggestSwap;
    if (ladder.length === 0 || state.load == null) {
        const range = state.baseRange;
        return { state: { ...freshCycle(state, range), stalls, suggestSwap }, change: { type: "reset", reason: "Two tough sessions: reset to the bottom of the range" } };
    }
    const prev = prevLoad(ladder, state.load);
    const mid = Math.round((state.baseRange[0] + state.baseRange[1]) / 2);
    const s = {
        ...freshCycle({ ...state, load: prev ? prev.value : state.load, repExtended: false, floor: lo }, state.baseRange),
        targets: Array(state.sets).fill(mid),
        stalls,
        suggestSwap,
        // Failing a weight right after jumping to it means that jump is too
        // big for now: treat the lighter weight as the ceiling until the
        // next block, so the ceiling ladder builds strength instead of
        // bouncing between the two.
        softCeiling: prev && state.floor < lo ? prev.value : state.softCeiling
    };
    return { state: s, change: { type: "decrease", load: s.load, reason: "Two tough sessions: back to " + labelFor(ladder, s.load) + " to rebuild" } };
}

// Step loading: each top session moves one more set to the new weight. A miss
// on the new weight twice cancels the bridge and marks a soft ceiling.
function updateStepPlan(state, done, exercise, ladder) {
    const [lo, hi] = state.baseRange;
    const newLoad = state.stepPlan[0];
    const heavy = done.filter(s => s.load === newLoad);
    const heavyTop = heavy.length > 0 && heavy.every(s => s.reps >= hi && s.rir >= 1);
    const heavyMiss = heavy.some(s => s.reps < state.floor);

    if (heavyMiss) {
        const failStreak = state.failStreak + 1;
        if (failStreak >= 2) {
            return {
                state: { ...freshCycle({ ...state, stepPlan: null, floor: lo, softCeiling: state.load, stalls: state.stalls + 1 }, [lo, hi]), targets: Array(state.sets).fill(hi) },
                change: { type: "decrease", load: state.load, reason: "That jump is too big for now: staying at " + labelFor(ladder, state.load) + " and making it harder another way" }
            };
        }
        return { state: { ...state, failStreak }, change: { type: "hold", reason: "Heavy set was tough: same plan next time" } };
    }

    if (heavyTop) {
        const moved = state.stepPlan.filter(l => l === newLoad).length;
        // Sets already at the new weight keep the top as their target; the
        // set that has just moved over starts from the forgiving floor.
        const targets = Array.from({ length: state.sets }, (_, i) => (i === moved ? stepFloor(lo) : hi));
        if (moved + 1 >= state.sets) {
            // Last set moves over: the bridge is done and normal double
            // progression takes over, with the floor relaxed until every set
            // is back in range.
            return {
                state: { ...state, load: newLoad, stepPlan: null, targets, successStreak: 0, failStreak: 0, floor: stepFloor(lo) },
                change: { type: "increase", load: newLoad, reason: "All sets now at the new weight" }
            };
        }
        const stepPlan = state.stepPlan.map((l, i) => (i <= moved ? newLoad : l));
        return { state: { ...state, stepPlan, targets, successStreak: 0, failStreak: 0 }, change: { type: "step", load: newLoad, reason: "Another set moves to the new weight" } };
    }

    // In range: nudge the heavy sets, keep the light ones at the top.
    const targets = state.stepPlan.map((l, i) => {
        const s = done[i];
        if (l !== newLoad || !s) return state.targets[i];
        return Math.min(hi, Math.max(state.floor, s.reps) + (s.rir > 0 ? repStep(exercise) : 0));
    });
    return { state: { ...state, targets, failStreak: 0 }, change: { type: "nudge", reason: "Keep building reps on the heavy set" } };
}

// The main entry point. log = sets for this exercise from one session:
// [{ setIndex, load, reps, rir, completed }]. ctx:
//   { exercise, ladder, equipment, pace, today, rir (the session's target),
//     lighterDay, deload, reducedLoad, holdIncreases }
// Returns { state, change } where change.reason is the "why" line the
// session summary shows.
export function updateAfterSession(state, log, ctx) {
    const { exercise, ladder, equipment, today } = ctx;
    const pace = PACES[ctx.pace] || PACES.gentle;
    const done = log.filter(s => s.completed !== false).sort((a, b) => a.setIndex - b.setIndex);

    const best = sessionBestE1rm(done);
    const recorded = {
        ...state,
        lastPerformed: done.length ? today : state.lastPerformed,
        e1rm: best != null ? best : state.e1rm
    };

    if (done.length === 0) return { state: recorded, change: { type: "none", reason: "Not done this time" } };
    if (ctx.lighterDay || ctx.deload || ctx.reducedLoad) {
        return { state: recorded, change: { type: "none", reason: "Easy session: progress picks up next time" } };
    }
    if (recorded.stepPlan) return updateStepPlan(recorded, done, exercise, ladder);

    const [lo, hi] = recorded.repRange;
    const allSetsDone = done.length >= recorded.sets;
    const minRir = Math.min(...done.map(s => s.rir));
    const top = allSetsDone && done.every(s => s.reps >= hi) && minRir >= 1;
    const easy = top && done.every(s => s.rir >= 3);
    const miss = done.some(s => s.reps < recorded.floor) || (done[0].rir === 0 && done[0].reps < hi);

    // Once a fresh jump has been fully "landed" at the normal bottom of the
    // range, the miss threshold goes back to normal.
    const floor = recorded.floor < lo && allSetsDone && done.every(s => s.reps >= lo) ? lo : recorded.floor;
    const s0 = { ...recorded, floor };

    if (top) {
        const successStreak = s0.successStreak + 1;
        const needed = ctx.pace === "steady" && minRir === 1 ? 2 : pace.streakNeeded;
        if (easy || successStreak >= needed) {
            if (ctx.holdIncreases && ladder.length > 0) {
                return { state: { ...s0, successStreak, failStreak: 0 }, change: { type: "hold", reason: "Big training week already: weight goes up next time" } };
            }
            return increase({ ...s0, successStreak }, exercise, ladder, equipment, pace);
        }
        return {
            state: { ...s0, successStreak, failStreak: 0, targets: Array(s0.sets).fill(hi) },
            change: { type: "hold", reason: "Top of the range: do it once more to earn the next step" }
        };
    }

    if (miss) {
        const failStreak = s0.failStreak + 1;
        if (failStreak >= 2) return decrease({ ...s0, failStreak }, ladder);
        return { state: { ...s0, failStreak, successStreak: 0 }, change: { type: "hold", reason: "Tough one: same targets next time" } };
    }

    return {
        state: { ...s0, successStreak: 0, failStreak: 0, targets: nudgeTargets(done, s0, exercise, pace.nudgeSets, ctx.rir) },
        change: { type: "nudge", reason: "In range: aim for a rep more where you had one in reserve" }
    };
}

// ---- Calibration week (PLAN.md 6.6) ------------------------------------

// After a calibration set, how many ladder steps to move for the next one.
// The aim is a weight where the top of the range leaves about 2 in reserve.
export function calibrationStep(ladder, load, reps, rir, range) {
    const [lo, hi] = range;
    if (reps < lo || rir <= 1) {
        const down = prevLoad(ladder, load);
        return down ? down.value : load;
    }
    if (rir >= 3 && reps >= hi) {
        const one = nextLoad(ladder, load);
        if (!one) return load;
        const two = nextLoad(ladder, one.value);
        // Two steps only if that's still a modest jump in total.
        return two && (two.value - load) / load <= 0.3 ? two.value : one.value;
    }
    return load;
}

// Finish calibration for an exercise: the last set's load becomes the
// starting weight and the set itself is the baseline for the week-26 retest.
export function finishCalibration(state, lastSet, today) {
    return {
        ...state,
        load: lastSet.load,
        e1rm: e1rm(lastSet.load, lastSet.reps, lastSet.rir),
        lastPerformed: today,
        baseline: { load: lastSet.load, reps: lastSet.reps, date: today }
    };
}

// Week-26 retest: one all-out-but-clean set at the calibration load, so the
// rep count compares directly with week 1.
export function prescribeTest(state) {
    const load = state.baseline ? state.baseline.load : state.load;
    return { exerciseId: state.exerciseId, sets: [{ setIndex: 0, load, targetReps: "max" }], rir: 0, test: "amrap", baseline: state.baseline };
}
