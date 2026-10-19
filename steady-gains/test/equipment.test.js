import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_EQUIPMENT, dumbbellLoads, bandCombos, loadLadder, nextLoad, prevLoad, snapDown, isMaxLoad } from "../js/equipment.js";
import { getExercise } from "../js/library.js";

test("dumbbells run 2.5 to 20 kg in 2.5 kg steps", () => {
    assert.deepEqual(dumbbellLoads(DEFAULT_EQUIPMENT), [2.5, 5, 7.5, 10, 12.5, 15, 17.5, 20]);
});

test("other dumbbell step sizes are exact (no float drift)", () => {
    const eq = { ...DEFAULT_EQUIPMENT, dumbbell: { min: 2, max: 20, step: 1.25 } };
    const loads = dumbbellLoads(eq);
    assert.equal(loads[0], 2);
    assert.equal(loads[loads.length - 1], 19.5);
    assert.ok(loads.every(l => Math.round(l * 100) === l * 100));
});

test("three bands combine into seven ascending levels", () => {
    assert.deepEqual(bandCombos(DEFAULT_EQUIPMENT).map(b => b.label), ["L", "M", "L+M", "H", "L+H", "M+H", "L+M+H"]);
});

test("kettlebell ladder is exactly the bells owned", () => {
    assert.deepEqual(loadLadder(getExercise("kb_pullover"), DEFAULT_EQUIPMENT).map(e => e.value), [5, 7, 12]);
});

test("bodyweight exercises have no load ladder", () => {
    assert.deepEqual(loadLadder(getExercise("dead_bug"), DEFAULT_EQUIPMENT), []);
});

test("ladder navigation", () => {
    const ladder = loadLadder(getExercise("db_bench"), DEFAULT_EQUIPMENT);
    assert.equal(nextLoad(ladder, 7.5).value, 10);
    assert.equal(nextLoad(ladder, 20), null);
    assert.equal(prevLoad(ladder, 7.5).value, 5);
    assert.equal(prevLoad(ladder, 2.5), null);
    assert.equal(snapDown(ladder, 11.9).value, 10);
    assert.equal(snapDown(ladder, 1).value, 2.5);
    assert.ok(isMaxLoad(ladder, 20));
    assert.ok(!isMaxLoad(ladder, 17.5));
});
