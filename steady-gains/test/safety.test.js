import { test } from "node:test";
import assert from "node:assert/strict";
import { LIBRARY, getExercise } from "../js/library.js";
import { DEFAULT_EQUIPMENT } from "../js/equipment.js";
import {
    effectiveCeiling, whyNotAllowed, isAllowed, allowedExercises, substitute,
    resolveItems, recordAnkleFlag, restoreExercise, SUSPEND_DAYS
} from "../js/safety.js";

const profile = (ankle = {}) => ({ ankle: { ceiling: 1, bikeOk: true, flatFootOk: true, ...ankle } });
const ctx = (ankle, extra = {}) => ({ profile: profile(ankle), equipment: DEFAULT_EQUIPMENT, ...extra });

// A deliberately dangerous entry, to prove the filter refuses it even if
// someone adds one to the library by mistake.
const LUNGE = { id: "lunge", name: "DB lunge", pattern: "lunge", region: "lower", implement: "dumbbell", needs: [], alr: 3, alternatives: [] };
const ANKLE_STRAP = { id: "band_leg_ext", name: "Band leg extension (band round ankle)", pattern: "quad", region: "lower", implement: "band", needs: [], alr: 0, ankleContact: true, alternatives: [] };

test("library ships no ALR-3 exercises and no ankle-contact exercises", () => {
    assert.ok(LIBRARY.every(e => e.alr <= 2));
    assert.ok(LIBRARY.every(e => !e.ankleContact));
});

test("ALR 3 is never allowed, whatever the ceiling or check-in", () => {
    for (const ceiling of [0, 1, 2, 3, 10]) {
        for (const ankleCheckin of [null, 0, 1, 2, 3, 4, 5]) {
            const c = ctx({ ceiling }, { ankleCheckin });
            assert.ok(!isAllowed(LUNGE, c), `ceiling ${ceiling} checkin ${ankleCheckin}`);
            assert.ok(!allowedExercises(c, [...LIBRARY, LUNGE]).some(e => e.alr > 2));
        }
    }
});

test("ceiling is clamped to 2 and defaults to 1", () => {
    assert.equal(effectiveCeiling({ ankle: {} }), 1);
    assert.equal(effectiveCeiling({ ankle: { ceiling: 9 } }), 2);
    assert.equal(effectiveCeiling({ ankle: { ceiling: -1 } }), 0);
});

test("default profile excludes standing (ALR 2) lifts", () => {
    assert.ok(!isAllowed(getExercise("kb_deadlift"), ctx()));
    assert.ok(!isAllowed(getExercise("goblet_box_squat"), ctx()));
    assert.ok(isAllowed(getExercise("kb_deadlift"), ctx({ ceiling: 2 })));
});

test("every allowed exercise respects the ceiling, for every setting", () => {
    for (const ceiling of [0, 1, 2]) {
        for (const flatFootOk of [true, false]) {
            for (const bikeOk of [true, false]) {
                for (const ankleCheckin of [0, 2, 3, 5]) {
                    const c = ctx({ ceiling, flatFootOk, bikeOk }, { ankleCheckin });
                    const limit = ankleCheckin >= 3 ? 0 : ceiling;
                    for (const e of allowedExercises(c)) {
                        assert.ok(e.alr <= limit, `${e.id} alr ${e.alr} > ${limit}`);
                        if (!flatFootOk) assert.ok(!e.footLoaded, e.id);
                        if (!bikeOk) assert.notEqual(e.implement, "bike", e.id);
                    }
                }
            }
        }
    }
});

test("sore ankle at check-in leaves only ALR-0 work", () => {
    const c = ctx({}, { ankleCheckin: 3 });
    assert.ok(allowedExercises(c).every(e => e.alr === 0));
    assert.match(whyNotAllowed(getExercise("db_hip_thrust"), c), /sore/);
});

test("anything touching the ankle is refused", () => {
    assert.ok(!isAllowed(ANKLE_STRAP, ctx({ ceiling: 2 })));
});

test("missing equipment is respected", () => {
    const c = { profile: profile(), equipment: { ...DEFAULT_EQUIPMENT, bike: false } };
    assert.ok(!isAllowed(getExercise("bike_z2"), c));
});

test("bike off swaps to the seated band circuit", () => {
    assert.equal(substitute("bike_z2", ctx({ bikeOk: false })), "band_circuit");
});

test("no flat-foot loading swaps hip thrusts for an ALR-0 hip extension", () => {
    const sub = substitute("db_hip_thrust", ctx({ flatFootOk: false }));
    assert.equal(sub, "prone_hip_extension");
});

test("resolveItems swaps without duplicating an exercise already in the session", () => {
    const c = ctx({ flatFootOk: false });
    const { items, swaps } = resolveItems([
        { exerciseId: "db_hip_thrust", sets: 3 },
        { exerciseId: "glute_bridge", sets: 3 }
    ], c);
    const ids = items.map(i => i.exerciseId);
    assert.equal(new Set(ids).size, ids.length);
    assert.equal(swaps.length, 2);
    assert.ok(items.every(i => isAllowed(getExercise(i.exerciseId), c)));
    assert.equal(items[0].sets, 3);
    assert.equal(items[0].swappedFrom, "db_hip_thrust");
});

test("first ankle flag pauses an exercise for two weeks", () => {
    const st = recordAnkleFlag({ exerciseId: "glute_bridge", ankleFlags: 0 }, "2026-11-02");
    assert.equal(st.ankleFlags, 1);
    assert.equal(st.suspendedUntil, "2026-11-16");
    assert.equal(SUSPEND_DAYS, 14);
    const ex = getExercise("glute_bridge");
    assert.ok(!isAllowed(ex, ctx({}, { today: "2026-11-15", states: { glute_bridge: st } })));
    assert.ok(isAllowed(ex, ctx({}, { today: "2026-11-16", states: { glute_bridge: st } })));
});

test("second ankle flag removes the exercise until restored", () => {
    let st = recordAnkleFlag({ exerciseId: "glute_bridge", ankleFlags: 0 }, "2026-11-02");
    st = recordAnkleFlag(st, "2026-12-01");
    assert.ok(st.excluded);
    const ex = getExercise("glute_bridge");
    assert.ok(!isAllowed(ex, ctx({}, { today: "2027-06-01", states: { glute_bridge: st } })));
    st = restoreExercise(st);
    assert.ok(isAllowed(ex, ctx({}, { today: "2027-06-01", states: { glute_bridge: st } })));
});

test("every library alternative points at a real exercise", () => {
    const ids = new Set(LIBRARY.map(e => e.id));
    for (const e of LIBRARY) {
        for (const alt of e.alternatives) assert.ok(ids.has(alt), `${e.id} -> ${alt}`);
        if (e.harder) assert.ok(ids.has(e.harder), `${e.id} harder -> ${e.harder}`);
        if (e.loadFactor) assert.ok(ids.has(e.loadFactor.ref), `${e.id} ref -> ${e.loadFactor.ref}`);
    }
});
