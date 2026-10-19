import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_EQUIPMENT } from "../js/equipment.js";
import { getExercise } from "../js/library.js";
import { generateProgramme, validateProgramme, insertDeloadWeek, weekInfo, weekForDate, nextSession, TOTAL_WEEKS } from "../js/programme.js";

const base = {
    ankle: { ceiling: 1, bikeOk: true, flatFootOk: true },
    schedule: { strength: ["mon", "wed", "fri"], bike: ["tue", "sat"] },
    sessionMinutes: 45,
    startDate: "2026-10-26" // a Monday
};
const withAnkle = ankle => ({ ...base, ankle: { ...base.ankle, ...ankle } });
const strength = prog => prog.weeks.flatMap(w => w.sessions.filter(s => s.kind === "strength").map(s => ({ w, s })));

test("26 weeks: calibration, four blocks with deloads at 7/13/19, retest at 26", () => {
    const prog = generateProgramme(base, DEFAULT_EQUIPMENT);
    assert.equal(prog.weeks.length, TOTAL_WEEKS);
    const phases = prog.weeks.map(w => w.phase[0]).join("");
    assert.equal(phases, "cbbbbbdbbbbbdbbbbbdbbbbbbr");
    assert.deepEqual(prog.weeks.filter(w => w.phase === "deload").map(w => w.n), [7, 13, 19]);
    assert.equal(weekInfo(8).blockId, "B2");
    assert.equal(weekInfo(25).blockId, "B4");
});

test("three strength sessions a week rotating A/B/C, plus two bike days", () => {
    const prog = generateProgramme(base, DEFAULT_EQUIPMENT);
    const all = strength(prog);
    assert.equal(all.length, 78);
    assert.deepEqual(all.slice(0, 4).map(x => x.s.template), ["A", "B", "C", "A"]);
    assert.deepEqual(prog.weeks[0].sessions.map(s => s.date), ["2026-10-26", "2026-10-27", "2026-10-28", "2026-10-30", "2026-10-31"]);
    assert.equal(prog.weeks[0].sessions.filter(s => s.kind === "conditioning").length, 2);
});

test("no profile ever produces an exercise outside its ankle limits", () => {
    for (const ceiling of [0, 1, 2]) {
        for (const flatFootOk of [true, false]) {
            for (const bikeOk of [true, false]) {
                for (const sessionMinutes of [35, 45, 60]) {
                    const profile = { ...withAnkle({ ceiling, flatFootOk, bikeOk }), sessionMinutes };
                    const prog = generateProgramme(profile, DEFAULT_EQUIPMENT);
                    assert.deepEqual(validateProgramme(prog, { profile, equipment: DEFAULT_EQUIPMENT }), [], JSON.stringify(profile.ankle));
                    for (const { s } of strength(prog)) {
                        for (const item of [...s.warmup, ...s.items]) {
                            const ex = getExercise(item.exerciseId);
                            assert.ok(ex.alr <= ceiling && ex.alr < 3, item.exerciseId);
                            if (!flatFootOk) assert.ok(!ex.footLoaded, item.exerciseId);
                            if (!bikeOk) assert.notEqual(ex.implement, "bike", item.exerciseId);
                        }
                    }
                }
            }
        }
    }
});

test("default profile needs no swaps and drops nothing", () => {
    const prog = generateProgramme(base, DEFAULT_EQUIPMENT);
    for (const { s } of strength(prog)) {
        assert.deepEqual(s.swaps, []);
        assert.deepEqual(s.dropped, []);
    }
});

test("even the strictest ankle profile keeps full sessions with no repeats", () => {
    const prog = generateProgramme(withAnkle({ ceiling: 0, flatFootOk: false, bikeOk: false }), DEFAULT_EQUIPMENT);
    for (const { s } of strength(prog)) {
        assert.ok(s.items.length >= 5, s.date);
        const ids = s.items.map(i => i.exerciseId);
        assert.equal(new Set(ids).size, ids.length, s.date);
    }
    const bikeDays = prog.weeks[0].sessions.filter(s => s.kind === "conditioning");
    assert.ok(bikeDays.every(s => s.items[0].exerciseId === "band_circuit"));
});

test("standing lifts only appear when ALR 2 is unlocked, and not before Block 2", () => {
    const has = (prog, id) => strength(prog).filter(x => x.s.items.some(i => i.exerciseId === id)).map(x => x.w.n);
    assert.deepEqual(has(generateProgramme(base, DEFAULT_EQUIPMENT), "goblet_box_squat"), []);
    const weeks = has(generateProgramme(withAnkle({ ceiling: 2 }), DEFAULT_EQUIPMENT), "goblet_box_squat");
    assert.ok(weeks.length > 0);
    assert.ok(Math.min(...weeks) >= 8);
    assert.ok(!weeks.includes(TOTAL_WEEKS));
});

test("block schemes: 12-15 in Block 1, 4 x 8-10 main lifts in Block 3", () => {
    const prog = generateProgramme(base, DEFAULT_EQUIPMENT);
    const firstItem = n => prog.weeks[n - 1].sessions.find(s => s.kind === "strength").items[0];
    assert.deepEqual([firstItem(2).sets, firstItem(2).reps], [3, [12, 15]]);
    assert.deepEqual([firstItem(14).sets, firstItem(14).reps], [4, [8, 10]]);
    assert.deepEqual([firstItem(20).sets, firstItem(20).reps], [4, [6, 10]]);
});

test("calibration week is 2 x 10-12; retest week marks the test lifts", () => {
    const prog = generateProgramme(base, DEFAULT_EQUIPMENT);
    const cal = prog.weeks[0].sessions.find(s => s.kind === "strength").items;
    assert.ok(cal.filter(i => i.role !== "core").every(i => i.sets === 2 && i.reps[0] === 10 && i.reps[1] === 12 && i.calibrate));
    const tests = prog.weeks[TOTAL_WEEKS - 1].sessions.flatMap(s => s.items.filter(i => i.test === "amrap").map(i => i.exerciseId));
    assert.deepEqual(tests.sort(), ["db_bench", "db_floor_press", "db_hip_thrust", "db_pullover", "glute_bridge", "prone_db_row"]);
});

test("session length: 35 min drops an accessory, 60 min adds accessory sets", () => {
    const items = minutes => generateProgramme({ ...base, sessionMinutes: minutes }, DEFAULT_EQUIPMENT).weeks[1].sessions[0].items;
    assert.equal(items(35).length, items(45).length - 1);
    const acc45 = items(45).filter(i => i.role === "accessory");
    const acc60 = items(60).filter(i => i.role === "accessory");
    acc60.forEach((i, k) => assert.equal(i.sets, Math.min(4, acc45[k].sets + 1)));
});

test("bike work builds from steady rides to intervals in Block 3", () => {
    const prog = generateProgramme(base, DEFAULT_EQUIPMENT);
    const bike = n => prog.weeks[n - 1].sessions.filter(s => s.kind === "conditioning").map(s => s.items[0]);
    assert.deepEqual(bike(2).map(i => i.minutes), [20, 20]);
    assert.deepEqual(bike(14).map(i => i.exerciseId), ["bike_z2", "bike_intervals"]);
});

test("inserting a deload week shifts the rest of the plan back a week", () => {
    const prog = generateProgramme(base, DEFAULT_EQUIPMENT);
    const moved = insertDeloadWeek(prog, 10);
    assert.equal(moved.weeks.length, 27);
    assert.equal(moved.weeks[9].phase, "deload");
    assert.equal(moved.weeks[9].start, prog.weeks[9].start);
    assert.equal(moved.weeks[10].n, 11);
    assert.equal(moved.weeks[10].phase, prog.weeks[9].phase);
    assert.equal(moved.weeks[10].start, prog.weeks[10].start);
    assert.equal(moved.weeks[26].sessions[0].date, "2027-04-26");
});

test("calendar lookups", () => {
    const prog = generateProgramme(base, DEFAULT_EQUIPMENT);
    assert.equal(weekForDate(prog, "2026-11-04").n, 2);
    assert.equal(nextSession(prog, "2026-10-29").session.date, "2026-10-30");
    assert.equal(nextSession(prog, "2028-01-01"), null);
});
