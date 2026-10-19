import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_EQUIPMENT as EQ, loadLadder } from "../js/equipment.js";
import { getExercise } from "../js/library.js";
import {
    e1rm, createState, transitionState, prescribe, prescribeTest, sessionModifiers, volumeLoad,
    shouldHoldIncreases, updateAfterSession, nudgeTargets, calibrationStep, finishCalibration
} from "../js/engine.js";

function setup(id, load, reps = [10, 12], sets = 3) {
    const exercise = getExercise(id);
    const ladder = loadLadder(exercise, EQ);
    const state = { ...createState(exercise, { sets, reps }, ladder), load };
    return { exercise, ladder, state };
}

// sets(load, [reps...], rir) - load and rir may be single values or per set.
const sets = (load, reps, rir = 2) => reps.map((r, i) => ({
    setIndex: i, load: Array.isArray(load) ? load[i] : load, reps: r, rir: Array.isArray(rir) ? rir[i] : rir
}));

function run(s, logs, extra = {}) {
    let state = s.state;
    let change = null;
    for (const log of logs) {
        ({ state, change } = updateAfterSession(state, log, { exercise: s.exercise, ladder: s.ladder, equipment: EQ, pace: "gentle", today: "2026-11-02", ...extra }));
    }
    return { state, change };
}

test("e1rm is Epley with reps in reserve added back", () => {
    assert.equal(e1rm(10, 12, 0), 14);
    assert.equal(e1rm(10, 10, 2), 14);
    assert.equal(e1rm(10, 10, 9), e1rm(10, 10, 3)); // "3+" counts as 3
    assert.equal(e1rm(null, 10, 2), null);
});

test("in range: +1 rep on at most two sets (12,11,10 -> 12,12,11)", () => {
    const s = setup("db_bench", 10);
    const { state, change } = run(s, [sets(10, [12, 11, 10])]);
    assert.equal(change.type, "nudge");
    assert.deepEqual(state.targets, [12, 12, 11]);
    assert.equal(state.load, 10);
});

test("sets harder than asked aren't nudged; spare reps in reserve are credited", () => {
    const s = setup("db_bench", 10);
    // Asked for RIR 2: set 2 hit failure, set 3 was at RIR 1 -> neither nudged.
    assert.deepEqual(nudgeTargets(sets(10, [11, 10, 10], [2, 0, 1]), s.state, s.exercise, Infinity, 2), [12, 10, 10]);
    // "3+" in reserve when 2 was asked: credit the spare rep.
    assert.deepEqual(nudgeTargets(sets(10, [10, 10, 10], 3), s.state, s.exercise, Infinity, 2), [11, 11, 11]);
    // Easy-going pace nudges two sets at most.
    assert.deepEqual(nudgeTargets(sets(10, [10, 10, 10], 2), s.state, s.exercise, 2, 2), [11, 11, 10]);
});

test("gentle pace: one top session holds, the second increases exactly one step", () => {
    const s = setup("db_bench", 17.5);
    const one = run(s, [sets(17.5, [12, 12, 12])]);
    assert.equal(one.change.type, "hold");
    assert.equal(one.state.load, 17.5);
    assert.deepEqual(one.state.targets, [12, 12, 12]);
    const two = run(s, [sets(17.5, [12, 12, 12]), sets(17.5, [12, 12, 12])]);
    assert.equal(two.change.type, "increase");
    assert.equal(two.state.load, 20);
    // The estimate says ~6 reps at 20 kg, so it lands just under the range
    // with a forgiving floor rather than demanding 10.
    assert.deepEqual(two.state.targets, [8, 8, 8]);
    assert.equal(two.state.floor, 8);
    assert.equal(two.state.successStreak, 0);
});

test("one clearly easy top session (RIR 3+) increases straight away", () => {
    const s = setup("db_bench", 17.5);
    const { state, change } = run(s, [sets(17.5, [12, 12, 12], 3)]);
    assert.equal(change.type, "increase");
    assert.equal(state.load, 20);
});

test("easy-going pace needs three top sessions; steady needs one", () => {
    const s = setup("db_bench", 17.5);
    const top = sets(17.5, [12, 12, 12]);
    assert.equal(run(s, [top, top], { pace: "easy" }).state.load, 17.5);
    assert.equal(run(s, [top, top, top], { pace: "easy" }).state.load, 20);
    assert.equal(run(s, [top], { pace: "steady" }).state.load, 20);
    // ...unless the last set was a grind (RIR 1): then steady waits for two.
    assert.equal(run(s, [sets(17.5, [12, 12, 12], [2, 2, 1])], { pace: "steady" }).state.load, 17.5);
});

test("a top set at RIR 0 doesn't count as top", () => {
    const s = setup("db_bench", 17.5);
    const { change } = run(s, [sets(17.5, [12, 12, 12], [2, 2, 0]), sets(17.5, [12, 12, 12], [2, 2, 0])]);
    assert.notEqual(change.type, "increase");
});

test("small jump the estimate says you can handle: straight up, normal targets", () => {
    const s = setup("db_bench", 17.5);
    const { state, change } = run(s, [sets(17.5, [12, 12, 12], 3)], { rir: 1 });
    assert.equal(change.type, "increase");
    assert.equal(state.load, 20);
});

test("7.5 -> 10 kg (+33 %) extends the rep range before jumping", () => {
    const s = setup("db_bench", 7.5);
    const top = sets(7.5, [12, 12, 12]);
    const ext = run(s, [top, top]);
    assert.equal(ext.change.type, "extend");
    assert.equal(ext.state.load, 7.5);
    assert.deepEqual(ext.state.repRange, [10, 14]);
    assert.deepEqual(ext.state.targets, [13, 13, 13]);

    const extTop = sets(7.5, [14, 14, 14]);
    const jump = run({ ...s, state: ext.state }, [extTop, extTop]);
    assert.equal(jump.change.type, "increase");
    assert.equal(jump.state.load, 10);
    assert.deepEqual(jump.state.repRange, [10, 12]);
    assert.equal(jump.state.floor, 8); // first sessions after a big jump forgive 8-9 reps
});

test("after a jump, 8-9 reps isn't a miss, and the floor resets once back in range", () => {
    const s = setup("db_bench", 10);
    const state = { ...s.state, floor: 8 };
    const a = run({ ...s, state }, [sets(10, [9, 8, 8])]);
    assert.equal(a.change.type, "nudge");
    assert.equal(a.state.floor, 8);
    const b = run({ ...s, state: a.state }, [sets(10, [10, 10, 10])]);
    assert.equal(b.state.floor, 10);
});

test("lateral raise 5 -> 7.5 kg (+50 %) step-loads one set at a time", () => {
    const s = setup("seated_lateral", 5, [12, 15]);
    const step1 = run(s, [sets(5, [15, 15, 15], 3)]);
    assert.equal(step1.change.type, "step");
    assert.deepEqual(step1.state.stepPlan, [7.5, 5, 5]);
    assert.deepEqual(step1.state.targets, [7, 15, 15]);
    assert.deepEqual(prescribe(step1.state, s.ladder).sets.map(x => x.load), [7.5, 5, 5]);

    const step2 = run({ ...s, state: step1.state }, [sets([7.5, 5, 5], [15, 15, 15])]);
    assert.deepEqual(step2.state.stepPlan, [7.5, 7.5, 5]);
    assert.deepEqual(step2.state.targets, [15, 7, 15]);

    const done = run({ ...s, state: step2.state }, [sets([7.5, 7.5, 5], [15, 15, 15])]);
    assert.equal(done.change.type, "increase");
    assert.equal(done.state.load, 7.5);
    assert.equal(done.state.stepPlan, null);
    assert.deepEqual(prescribe(done.state, s.ladder).sets.map(x => x.load), [7.5, 7.5, 7.5]);
});

test("step loading builds reps on the heavy set before moving another", () => {
    const s = setup("seated_lateral", 5, [12, 15]);
    const step1 = run(s, [sets(5, [15, 15, 15], 3)]);
    const mid = run({ ...s, state: step1.state }, [sets([7.5, 5, 5], [10, 15, 15])]);
    assert.equal(mid.change.type, "nudge");
    assert.deepEqual(mid.state.stepPlan, [7.5, 5, 5]);
    assert.equal(mid.state.targets[0], 11);
});

test("deloads and lighter days skip the heavy step-loading set", () => {
    const s = setup("seated_lateral", 5, [12, 15]);
    const step1 = run(s, [sets(5, [15, 15, 15], 3)]);
    assert.ok(prescribe(step1.state, s.ladder, { deload: true }).sets.every(x => x.load === 5));
    assert.ok(prescribe(step1.state, s.ladder, { lighterDay: true }).sets.every(x => x.load === 5));
});

test("a bell predicted to be unliftable isn't attempted: the current one gets harder", () => {
    const s = setup("seated_kb_press", 7, [12, 15]);
    const top = sets(7, [15, 15, 15], 2); // e1RM ~11 kg, under the 12 kg bell
    const { state, change } = run(s, [top, top]);
    assert.equal(change.type, "ceiling");
    assert.equal(state.load, 7);
    assert.equal(state.softCeiling, 7);
    assert.equal(state.stepPlan, null);
});

test("failing a big jump twice cancels it and sets a soft ceiling", () => {
    const s = setup("seated_lateral", 5, [12, 15]);
    const step1 = run(s, [sets(5, [15, 15, 15], 3)]);
    const tooHeavy = sets([7.5, 5, 5], [4, 15, 15]);
    const cancelled = run({ ...s, state: step1.state }, [tooHeavy, tooHeavy]);
    assert.equal(cancelled.change.type, "decrease");
    assert.equal(cancelled.state.stepPlan, null);
    assert.equal(cancelled.state.load, 5);
    assert.equal(cancelled.state.softCeiling, 5);
    // Next time it's earned, the ceiling ladder makes 5 kg harder instead.
    const top = sets(5, [15, 15, 15]);
    const next = run({ ...s, state: cancelled.state }, [top, top]);
    assert.equal(next.change.type, "ceiling");
    assert.equal(next.state.load, 5);
});

test("at 20 kg, earning an increase climbs the ceiling ladder, never a phantom 22.5 kg", () => {
    const s = setup("db_bench", 20);
    const top = sets(20, [12, 12, 12]);
    const { state, change } = run(s, [top, top]);
    assert.equal(change.type, "ceiling");
    assert.equal(state.load, 20);
    assert.equal(state.ceilingStage, 1);
    assert.deepEqual(state.repRange, [10, 15]);
    assert.ok(prescribe(state, s.ladder).sets.every(x => x.load <= 20));
});

test("ceiling ladder runs reps -> tempo -> pause -> harder variation -> band -> technique -> rotate", () => {
    const s = setup("db_hip_thrust", 20, [10, 12]);
    let state = s.state;
    const seen = [];
    for (let i = 0; i < 10; i++) {
        const hi = state.repRange[1];
        const r = run({ ...s, state }, [sets(20, [hi, hi, hi], 3)]);
        state = r.state;
        seen.push(r.change.type + ":" + (state.tempo || "") + ":" + (state.addedBand || "") + ":" + (state.technique || ""));
    }
    assert.deepEqual(seen.slice(0, 9), [
        "ceiling:::", "ceiling:3-0-1::", "ceiling:3-1-1::", "swap:3-1-1::",
        "ceiling:3-1-1:L:", "ceiling:3-1-1:M:", "ceiling:3-1-1:H:", "ceiling:3-1-1:H:rest-pause", "rotate:3-1-1:H:rest-pause"
    ]);
    assert.equal(state.load, 20);
});

test("stages that don't apply are skipped (no harder variation, not bandable)", () => {
    const s = setup("seated_lateral", 20, [12, 15]);
    let state = { ...s.state, ceilingStage: 3 };
    const r = run({ ...s, state }, [sets(20, [15, 15, 15], 3)]);
    assert.equal(r.state.ceilingStage, 6);
    assert.equal(r.state.technique, "rest-pause");
});

test("two misses in a row drop one step and record a stall", () => {
    const s = setup("db_bench", 12.5);
    const miss = sets(12.5, [9, 8, 8]);
    const one = run(s, [miss]);
    assert.equal(one.change.type, "hold");
    assert.equal(one.state.load, 12.5);
    const two = run(s, [miss, miss]);
    assert.equal(two.change.type, "decrease");
    assert.equal(two.state.load, 10);
    assert.equal(two.state.stalls, 1);
    assert.deepEqual(two.state.targets, [11, 11, 11]);
});

test("three stalls flag the exercise for rotation", () => {
    const s = setup("db_bench", 12.5);
    const { state } = run({ ...s, state: { ...s.state, stalls: 2 } }, [sets(12.5, [8, 8, 8]), sets(12.5, [8, 8, 8])]);
    assert.equal(state.suggestSwap, "rotate");
});

test("lighter days, deloads and return-from-break sessions never change progression", () => {
    const s = setup("db_bench", 17.5);
    for (const flag of ["lighterDay", "deload", "reducedLoad"]) {
        const { state, change } = run(s, [sets(17.5, [12, 12, 12], 3)], { [flag]: true });
        assert.equal(change.type, "none", flag);
        assert.equal(state.load, 17.5);
        assert.equal(state.lastPerformed, "2026-11-02");
    }
});

test("sets not completed don't count as misses (session cut short)", () => {
    const s = setup("db_bench", 10);
    const log = sets(10, [11, 10, 0]);
    log[2].completed = false;
    const { change } = run(s, [log, log]);
    assert.equal(change.type, "nudge");
});

test("a cut-short session can't count as top either", () => {
    const s = setup("db_bench", 17.5);
    const log = sets(17.5, [12, 12]);
    const { state } = run(s, [log, log]);
    assert.equal(state.load, 17.5);
});

test("a big training week holds the weight increase until next time", () => {
    const s = setup("db_bench", 17.5);
    const top = sets(17.5, [12, 12, 12]);
    const held = run(s, [top, top], { holdIncreases: true });
    assert.equal(held.change.type, "hold");
    assert.equal(held.state.load, 17.5);
    assert.equal(run({ ...s, state: held.state }, [top]).state.load, 20);
});

test("bodyweight work shifts its range up to the cap, then asks for the harder version", () => {
    const s = setup("dead_bug", null, [6, 10], 2);
    const r1 = run(s, [sets(null, [10, 10]), sets(null, [10, 10])]);
    assert.equal(r1.change.type, "range");
    assert.deepEqual(r1.state.repRange, [8, 12]);
    const r2 = run({ ...s, state: r1.state }, [sets(null, [12, 12]), sets(null, [12, 12])]);
    assert.equal(r2.change.type, "swap");
    assert.equal(r2.change.to, "weighted_dead_bug");
});

test("timed holds progress in 5 s steps", () => {
    const s = setup("knee_plank", null, [20, 30], 3);
    const r = run(s, [sets(null, [30, 30, 30]), sets(null, [30, 30, 30])]);
    assert.deepEqual(r.state.repRange, [25, 35]);
});

test("session modifiers: readiness and time off", () => {
    assert.equal(sessionModifiers({ readiness: { sleep: 2, energy: 2, soreness: 2 } }).lighterDay, true);
    assert.equal(sessionModifiers({ readiness: { sleep: 3, energy: 3, soreness: 2 } }).lighterDay, false);
    assert.equal(sessionModifiers({ daysSinceLast: 7 }).loadMultiplier, 1);
    assert.equal(sessionModifiers({ daysSinceLast: 8 }).loadMultiplier, 0.9);
    const long = sessionModifiers({ daysSinceLast: 15 });
    assert.equal(long.loadMultiplier, 0.8);
    assert.equal(long.miniDeload, true);
});

test("prescribe: deload trims sets about 40 % and back-from-break snaps loads down", () => {
    const s = setup("db_bench", 12.5, [8, 10], 4);
    const deload = prescribe(s.state, s.ladder, { deload: true });
    assert.equal(deload.sets.length, 2);
    assert.equal(deload.rir, 4);
    const three = setup("db_bench", 12.5, [10, 12], 3);
    assert.equal(prescribe(three.state, three.ladder, { deload: true }).sets.length, 2);
    const back = prescribe(s.state, s.ladder, { loadMultiplier: 0.9 });
    assert.ok(back.sets.every(x => x.load === 10));
    const light = prescribe(s.state, s.ladder, { lighterDay: true });
    assert.equal(light.sets.length, 3);
    assert.ok(light.rir >= 3);
});

test("new block: strength carries over via e1RM, moving at most one load step", () => {
    const s = setup("db_bench", 12.5, [12, 15]);
    const state = { ...s.state, e1rm: 30 };
    const next = transitionState(state, { sets: 3, reps: [10, 12] }, s.ladder);
    assert.equal(next.load, 15); // e1RM says 20 kg, but only one step up
    assert.deepEqual(next.repRange, [10, 12]);
    // Strong for 15 kg, so the block starts at the top of the new range
    // rather than undoing progress.
    assert.deepEqual(next.targets, [12, 12, 12]);
    const weaker = transitionState({ ...s.state, e1rm: 18 }, { sets: 3, reps: [10, 12] }, s.ladder);
    assert.equal(weaker.load, 12.5);
    assert.deepEqual(weaker.targets, [11, 11, 11]);
    assert.equal(transitionState(next, { sets: 3, reps: [10, 12] }, s.ladder), next);
});

test("new block: soft ceilings get another try; the top of the rack keeps its ladder", () => {
    const soft = setup("db_bench", 10, [12, 15]);
    const a = transitionState({ ...soft.state, softCeiling: 10, ceilingStage: 2, tempo: "3-0-1" }, { sets: 3, reps: [10, 12] }, soft.ladder);
    assert.equal(a.ceilingStage, 0);
    assert.equal(a.tempo, null);
    assert.equal(a.softCeiling, null);
    const hard = setup("db_bench", 20, [12, 15]);
    const b = transitionState({ ...hard.state, ceilingStage: 2, tempo: "3-0-1" }, { sets: 3, reps: [10, 12] }, hard.ladder);
    assert.equal(b.ceilingStage, 2);
    assert.equal(b.tempo, "3-0-1");
});

test("new variation borrows strength from its reference exercise", () => {
    const ex = getExercise("sa_db_bench");
    const ladder = loadLadder(ex, EQ);
    const st = createState(ex, { sets: 3, reps: [10, 12] }, ladder, { db_bench: { e1rm: 20 } });
    // 20 x 0.9 = 18 kg e1RM; 12 reps at RIR 2 -> 18 / 1.467 = 12.3 kg -> 10 kg available
    assert.equal(st.load, 10);
    assert.equal(st.load, snapExpected(18, 12, 2, ladder));
    const fresh = createState(ex, { sets: 3, reps: [10, 12] }, ladder);
    assert.equal(fresh.load, 7.5);
});

function snapExpected(e, reps, rir, ladder) {
    const target = e / (1 + (reps + rir) / 30);
    return ladder.filter(l => l.value <= target).pop().value;
}

test("calibration moves up when easy, down when hard, stays when about right", () => {
    const ladder = loadLadder(getExercise("db_bench"), EQ);
    assert.equal(calibrationStep(ladder, 7.5, 12, 3, [10, 12]), 10);   // two steps would be +67 %
    assert.equal(calibrationStep(ladder, 15, 12, 3, [10, 12]), 17.5);  // two steps would be +33 %
    const fine = loadLadder(getExercise("db_bench"), { ...EQ, dumbbell: { min: 2.5, max: 20, step: 1.25 } });
    assert.equal(calibrationStep(fine, 10, 12, 3, [10, 12]), 12.5);    // two small steps, +25 %
    assert.equal(calibrationStep(ladder, 10, 12, 2, [10, 12]), 10);
    assert.equal(calibrationStep(ladder, 10, 11, 1, [10, 12]), 7.5);
    assert.equal(calibrationStep(ladder, 10, 8, 3, [10, 12]), 7.5);
    const done = finishCalibration(createState(getExercise("db_bench"), { sets: 2, reps: [10, 12] }, ladder), { load: 10, reps: 12, rir: 2 }, "2026-10-30");
    assert.deepEqual(done.baseline, { load: 10, reps: 12, date: "2026-10-30" });
    assert.equal(done.e1rm, 14.7);
    assert.equal(prescribeTest(done).sets[0].load, 10);
});

test("volume load counts kg only, not band tension", () => {
    const v = volumeLoad([
        { exerciseId: "db_bench", load: 10, reps: 10 },
        { exerciseId: "band_row", load: 4, reps: 15 },
        { exerciseId: "db_bench", load: 10, reps: 10, completed: false }
    ]);
    assert.equal(v, 100);
    assert.ok(shouldHoldIncreases(1111, 1000));
    assert.ok(!shouldHoldIncreases(1100, 1000));
    assert.ok(!shouldHoldIncreases(500, 0));
});
