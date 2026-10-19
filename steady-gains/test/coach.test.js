import { test } from "node:test";
import assert from "node:assert/strict";
import { getExercise } from "../js/library.js";
import { isAllowed } from "../js/safety.js";
import {
    createApp, upNext, startSession, logSet, undoSet, endItem, swapOptions, swapItem, finishSession,
    skipSession, previewSession, nextSetIndex, acceptSwap, restore, flaggedExercises, updateSettings,
    e1rmSeries, weeklyVolumes, totals, baselineComparison, exportData, importData, setFeel
} from "../js/coach.js";

const fine = { sleep: 4, energy: 4, soreness: 4, ankle: 0 };
const T0 = Date.UTC(2026, 9, 26, 8);
const newApp = (profile = {}) => createApp({ startDate: "2026-10-26", ...profile });

// Log every remaining set of the active session at its target with RIR 2.
function doAllSets(app, today, rir = 2, reps = null) {
    let a = app;
    a.active.items.forEach((_, i) => {
        let idx;
        while ((idx = nextSetIndex(a.active.items[i])) !== null) {
            const planned = a.active.items[i].prescription.sets[idx];
            const target = typeof planned.targetReps === "number" ? planned.targetReps : 10;
            a = logSet(a, i, { reps: reps != null ? reps : target, rir }, today);
        }
    });
    return a;
}

function runNext(app, today, opts = {}) {
    const { session } = upNext(app);
    let a = startSession(app, session.id, opts.checkin || fine, today, T0);
    if (a.active.kind === "strength") a = doAllSets(a, today, opts.rir, opts.reps);
    return finishSession(a, today, T0 + 40 * 60000);
}

test("new app: first up is week 1, session A on the start date", () => {
    const app = newApp();
    const { week, session } = upNext(app);
    assert.equal(week.n, 1);
    assert.equal(session.template, "A");
    assert.equal(session.date, "2026-10-26");
});

test("calibration moves the second set's weight from the first set's effort", () => {
    let app = startSession(newApp(), "w1-0", fine, "2026-10-26", T0);
    const bench = app.active.items.findIndex(i => i.exerciseId === "db_bench");
    assert.equal(app.active.items[bench].prescription.sets[0].load, 7.5);
    app = logSet(app, bench, { reps: 12, rir: 3 }, "2026-10-26");
    assert.equal(app.active.items[bench].prescription.sets[1].load, 10);
    app = logSet(app, bench, { reps: 12, rir: 2 }, "2026-10-26");
    app = finishSession(app, "2026-10-26", T0 + 30 * 60000);
    assert.equal(app.states.db_bench.load, 10);
    assert.deepEqual(app.states.db_bench.baseline, { load: 10, reps: 12, date: "2026-10-26" });
    assert.equal(app.done["w1-0"], "done");
    assert.equal(app.active, null);
    assert.equal(app.history[0].durationMin, 30);
});

test("experience level scales the default starting weights", () => {
    const load = experience => startSession(newApp({ experience }), "w1-0", fine, "2026-10-26", T0).active.items[0].prescription.sets[0].load;
    assert.equal(load("new"), 5);
    assert.equal(load("some"), 7.5);
    assert.equal(load("regular"), 7.5); // 9.4 kg snaps down to 7.5
});

test("a full week runs through strength and bike sessions in order", () => {
    let app = newApp();
    const order = [];
    for (let i = 0; i < 5; i++) {
        order.push(upNext(app).session.id);
        app = runNext(app, upNext(app).session.date);
    }
    assert.deepEqual(order, ["w1-0", "w1-1", "w1-2", "w1-3", "w1-4"]);
    assert.equal(upNext(app).week.n, 2);
    assert.equal(totals(app).sessions, 3);
    assert.equal(totals(app).conditioning, 2);
});

test("week 2 moves to Block 1 ranges using calibrated weights", () => {
    let app = newApp();
    for (let i = 0; i < 5; i++) app = runNext(app, upNext(app).session.date);
    const { session } = upNext(app);
    app = startSession(app, session.id, fine, session.date, T0);
    const bench = app.active.items.find(i => i.exerciseId === "db_bench");
    assert.deepEqual(bench.prescription.repRange, [12, 15]);
    assert.equal(bench.prescription.sets.length, 3);
});

test("going from calibration into Block 1 never drops a weight that was fine", () => {
    let app = newApp();
    for (let i = 0; i < 5; i++) app = runNext(app, upNext(app).session.date);
    const calibrated = { ...app.states };
    const { session } = upNext(app);
    const a = startSession(app, session.id, fine, session.date, T0);
    for (const item of a.active.items) {
        const before = calibrated[item.exerciseId];
        if (before && before.load != null) assert.ok(item.prescription.sets[0].load >= before.load, item.exerciseId);
    }
});

test("finishing a build session updates states and gives a reason for every exercise", () => {
    let app = newApp();
    for (let i = 0; i < 5; i++) app = runNext(app, upNext(app).session.date);
    app = runNext(app, upNext(app).session.date);
    const entry = app.history[app.history.length - 1];
    assert.equal(entry.phase, "build");
    assert.ok(entry.items.length >= 5);
    assert.ok(entry.items.every(i => i.change && i.change.reason));
    assert.equal(app.states.db_bench.lastPerformed, entry.date);
});

test("sore ankle at check-in: the whole session is ALR 0", () => {
    const app = startSession(newApp(), "w1-0", { ...fine, ankle: 4 }, "2026-10-26", T0);
    assert.ok(app.active.items.every(i => getExercise(i.exerciseId).alr === 0));
    assert.ok(app.active.warmup.every(i => getExercise(i.exerciseId).alr === 0));
    assert.ok(app.active.reasons.some(r => /Ankle/.test(r)));
});

test("ankle flag mid-exercise: paused, remaining sets swapped to an ALR-0 exercise", () => {
    let app = newApp();
    for (let i = 0; i < 5; i++) app = runNext(app, upNext(app).session.date);
    const { session } = upNext(app);
    app = startSession(app, session.id, fine, session.date, T0);
    const k = app.active.items.findIndex(i => i.exerciseId === "db_hip_thrust");
    app = logSet(app, k, { reps: 12, rir: 2, ankleFlag: true }, session.date);
    assert.ok(app.active.items[k].ended);
    const sub = app.active.items[k + 1];
    assert.equal(getExercise(sub.exerciseId).alr, 0);
    assert.equal(sub.prescription.sets.length, 2);
    assert.equal(app.states.db_hip_thrust.ankleFlags, 1);
    assert.ok(flaggedExercises(app, session.date).some(f => f.exerciseId === "db_hip_thrust"));

    app = doAllSets(app, session.date);
    app = finishSession(app, session.date, T0 + 1);
    // The flag survives finishing the session...
    assert.equal(app.states.db_hip_thrust.ankleFlags, 1);
    assert.ok(app.states.db_hip_thrust.suspendedUntil);
    // ...and the next session with a hip thrust leaves it out.
    let next = app;
    while (upNext(next).session.template !== "A") next = skipSession(next, upNext(next).session.id);
    const later = startSession(next, upNext(next).session.id, fine, session.date, T0);
    assert.ok(!later.active.items.some(i => i.exerciseId === "db_hip_thrust"));
    assert.ok(later.active.swaps.some(s => s.from === "db_hip_thrust"));
    // Restoring brings it back.
    const restored = restore(next, "db_hip_thrust");
    const again = startSession(restored, upNext(restored).session.id, fine, session.date, T0);
    assert.ok(again.active.items.some(i => i.exerciseId === "db_hip_thrust"));
});

test("ankle flag on the first of two calibration sets still swaps in a replacement", () => {
    let app = startSession(newApp(), "w1-0", fine, "2026-10-26", T0);
    const k = app.active.items.findIndex(i => i.exerciseId === "db_hip_thrust");
    app = logSet(app, k, { reps: 12, rir: 2, ankleFlag: true }, "2026-10-26");
    const sub = app.active.items[k + 1];
    assert.equal(sub.swappedFrom, "db_hip_thrust");
    assert.equal(sub.prescription.sets.length, 1);
    assert.equal(getExercise(sub.exerciseId).alr, 0);
});

test("an exercise standing in for another keeps its own progression", () => {
    let app = newApp();
    for (let i = 0; i < 5; i++) app = runNext(app, upNext(app).session.date);
    app = runNext(app, upNext(app).session.date); // week 2 session A: hip thrust at 12-15
    const before = app.states.db_hip_thrust;
    assert.deepEqual(before.repRange, [12, 15]);
    // Pause glute bridge, so session B uses hip thrust in its place (15-20 slot).
    app = { ...app, states: { ...app.states, glute_bridge: { ...app.states.glute_bridge, excluded: true } } };
    while (upNext(app).session.template !== "B") app = skipSession(app, upNext(app).session.id);
    const b = startSession(app, upNext(app).session.id, fine, upNext(app).session.date, T0);
    const stand = b.active.items.find(i => i.exerciseId === "db_hip_thrust");
    assert.equal(stand.swappedFrom, "glute_bridge");
    assert.deepEqual(stand.prescription.repRange, [12, 15]);
    assert.equal(stand.prescription.sets[0].load, before.load);
});

test("swap options are safe and exclude what's already in the session", () => {
    const app = startSession(newApp(), "w1-0", fine, "2026-10-26", T0);
    const opts = swapOptions(app, 0, "2026-10-26");
    assert.ok(opts.includes("db_floor_press"));
    assert.ok(!opts.includes("db_bench"));
    const ctx = { profile: app.profile, equipment: app.equipment, today: "2026-10-26", states: app.states };
    assert.ok(opts.every(id => isAllowed(getExercise(id), ctx)));
});

test("swapping before any sets replaces; after a set, the new one takes the rest", () => {
    let app = startSession(newApp(), "w1-0", fine, "2026-10-26", T0);
    let a = swapItem(app, 0, "db_floor_press");
    assert.equal(a.active.items[0].exerciseId, "db_floor_press");
    assert.equal(a.active.items.length, app.active.items.length);
    a = logSet(app, 0, { reps: 12, rir: 2 }, "2026-10-26");
    a = swapItem(a, 0, "db_floor_press");
    assert.ok(a.active.items[0].ended);
    assert.equal(a.active.items[1].exerciseId, "db_floor_press");
    assert.equal(a.active.items[1].prescription.sets.length, 1);
});

test("undo and end an exercise early", () => {
    let app = startSession(newApp(), "w1-0", fine, "2026-10-26", T0);
    app = logSet(app, 0, { reps: 12, rir: 2 }, "2026-10-26");
    app = undoSet(app, 0);
    assert.equal(app.active.items[0].logged.length, 0);
    app = endItem(app, 0);
    assert.equal(nextSetIndex(app.active.items[0]), null);
});

test("over two weeks off: an easy week is slotted in and the plan moves back", () => {
    let app = newApp();
    for (let i = 0; i < 5; i++) app = runNext(app, upNext(app).session.date);
    const { session } = upNext(app);
    app = startSession(app, session.id, fine, "2026-11-25", T0);
    assert.equal(app.active.phase, "deload");
    assert.equal(app.programme.weeks.length, 27);
    assert.ok(app.active.mods.loadMultiplier < 1);
    app = finishSession(doAllSets(app, "2026-11-25"), "2026-11-25", T0 + 1);
    assert.equal(upNext(app).week.phase, "deload");
    // Settings changes keep the inserted week.
    const changed = updateSettings(app, { profile: { pace: "steady" } });
    assert.equal(changed.programme.weeks.length, 27);
    assert.equal(changed.done[app.history[app.history.length - 1].id], "done");
});

test("low readiness gives a lighter day that changes nothing", () => {
    let app = newApp();
    for (let i = 0; i < 5; i++) app = runNext(app, upNext(app).session.date);
    const before = app.states.db_bench;
    app = runNext(app, upNext(app).session.date, { checkin: { sleep: 1, energy: 2, soreness: 2, ankle: 0 }, rir: 3, reps: 15 });
    assert.equal(app.states.db_bench.load, before.load);
    assert.ok(app.history[app.history.length - 1].items.every(i => i.change.type === "none"));
});

test("accepting a harder variation replaces it in future sessions", () => {
    let app = acceptSwap(newApp(), "db_bench", "sa_db_bench");
    const preview = previewSession(app, "w2-0", "2026-11-02");
    assert.equal(preview.items[0].exerciseId, "sa_db_bench");
    assert.equal(preview.items[0].swappedFrom, "db_bench");
});

test("settings: unlocking ALR 2 adds standing lifts from Block 2", () => {
    const app = updateSettings(newApp(), { profile: { ankle: { ceiling: 2 } } });
    assert.equal(app.profile.ankle.bikeOk, true);
    const b2 = app.programme.weeks.find(w => w.n === 8).sessions.find(s => s.template === "A");
    assert.ok(b2.items.some(i => i.exerciseId === "goblet_box_squat"));
});

test("progress views and baseline comparison", () => {
    let app = newApp();
    for (let i = 0; i < 10; i++) app = runNext(app, upNext(app).session.date);
    app = setFeel(app, 4);
    assert.equal(app.history[app.history.length - 1].feel, 4);
    assert.ok(e1rmSeries(app, "db_bench").length >= 1);
    assert.deepEqual(weeklyVolumes(app).map(w => w.week), [1, 2]);
    const base = baselineComparison(app);
    assert.ok(base.some(b => b.exerciseId === "db_bench" && b.baseline.load));
});

test("export / import round-trips and rejects junk", () => {
    let app = newApp();
    app = runNext(app, "2026-10-26");
    const back = importData(exportData(app));
    assert.deepEqual(back.states, app.states);
    assert.deepEqual(back.history, app.history);
    assert.throws(() => importData("{}"), /Not a Steady Gains backup/);
    assert.throws(() => importData("nope"));
});

test("a whole six months can be completed without errors", () => {
    let app = newApp();
    let guard = 0;
    while (upNext(app) && guard++ < 200) app = runNext(app, upNext(app).session.date);
    assert.equal(upNext(app), null);
    assert.equal(totals(app).sessions, 78);
    const retest = app.history.filter(h => h.phase === "retest").flatMap(h => h.items.filter(i => i.change.type === "test"));
    assert.equal(retest.length, 6);
    assert.ok(baselineComparison(app).filter(b => b.retest).length === 6);
});
