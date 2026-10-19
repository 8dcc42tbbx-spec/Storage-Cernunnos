// Steady Gains - the coach. Ties the programme, safety filter and progression
// engine together into what the app actually does: what's up next, starting
// a session, logging sets, swaps and ankle flags, and finishing with a
// summary. Like the modules underneath it, it never touches the DOM or
// storage: every function takes the app object and returns a new one.
//
// app = { version, profile, equipment, programme, insertedDeloads, states,
//         history, done, overrides, active }
//   states    - progression state per exercise id (engine.js)
//   history   - finished sessions, oldest first
//   done      - { [sessionId]: "done" | "skipped" }
//   overrides - { [exerciseId]: harderVariationId } accepted from summaries
//   active    - the session in progress, if any

import { DEFAULT_EQUIPMENT, loadLadder, labelFor } from "./equipment.js";
import { LIBRARY, getExercise } from "./library.js";
import { resolveItems, substitute, recordAnkleFlag, restoreExercise, isAllowed } from "./safety.js";
import * as E from "./engine.js";
import { generateProgramme, insertDeloadWeek, BLOCKS } from "./programme.js";
import { daysBetween } from "./dates.js";

export const APP_VERSION = 1;

export const SESSION_NAMES = { A: "Push + Glutes", B: "Pull + Posterior", C: "Full body" };

const START_SCALE = { new: 0.75, some: 1, regular: 1.25 };

export const DEFAULT_PROFILE = {
    experience: "some",
    ankle: { ceiling: 1, bikeOk: true, flatFootOk: true },
    pace: "gentle",
    sessionMinutes: 45,
    schedule: { strength: ["mon", "wed", "fri"], bike: ["tue", "sat"] },
    startDate: null
};

// ---- Set-up ------------------------------------------------------------

export function createApp(profile, equipment = DEFAULT_EQUIPMENT) {
    const p = { ...DEFAULT_PROFILE, ...profile, ankle: { ...DEFAULT_PROFILE.ankle, ...(profile.ankle || {}) } };
    return {
        version: APP_VERSION,
        profile: p,
        equipment,
        programme: generateProgramme(p, equipment),
        insertedDeloads: [],
        states: {},
        history: [],
        done: {},
        overrides: {},
        active: null
    };
}

// Rebuild the calendar after a settings change, keeping everything logged.
// Session ids are positional, so finished sessions stay finished.
export function regenerate(app) {
    let programme = generateProgramme(app.profile, app.equipment);
    for (const n of app.insertedDeloads) programme = insertDeloadWeek(programme, n);
    return { ...app, programme };
}

export function updateSettings(app, { profile = {}, equipment } = {}) {
    const next = {
        ...app,
        profile: { ...app.profile, ...profile, ankle: { ...app.profile.ankle, ...(profile.ankle || {}) } },
        equipment: equipment || app.equipment
    };
    return regenerate(next);
}

// ---- Looking things up -------------------------------------------------

export function findSession(app, id) {
    for (const week of app.programme.weeks) {
        const session = week.sessions.find(s => s.id === id);
        if (session) return { week, session };
    }
    return null;
}

// The first session not yet done or skipped. Missed days don't pile up:
// the plan simply waits for you.
export function upNext(app) {
    for (const week of app.programme.weeks) {
        for (const session of week.sessions) {
            if (!app.done[session.id]) return { week, session };
        }
    }
    return null;
}

export function blockName(blockId) {
    const b = BLOCKS.find(x => x.id === blockId);
    return b ? b.name : "";
}

export function sessionTitle(session) {
    if (session.kind === "conditioning") return getExercise(session.items[0].exerciseId).name;
    return "Session " + session.template + " · " + SESSION_NAMES[session.template];
}

function lastStrengthDate(app) {
    for (let i = app.history.length - 1; i >= 0; i--) {
        if (app.history[i].kind === "strength") return app.history[i].date;
    }
    return null;
}

function safetyCtx(app, today, ankleCheckin = null, states = app.states) {
    return { profile: app.profile, equipment: app.equipment, ankleCheckin, today, states };
}

// Accepted "harder variation" swaps replace the template exercise, as long
// as the harder one is still allowed.
function applyOverrides(app, items, ctx) {
    return items.map(item => {
        const to = app.overrides[item.exerciseId];
        return to && isAllowed(getExercise(to), ctx) ? { ...item, exerciseId: to, upgradedFrom: item.exerciseId } : item;
    });
}

// ---- Building a session ------------------------------------------------

function stateFor(app, exercise, item, ladder, week, states) {
    const existing = states[exercise.id];
    let state = existing || E.createState(exercise, item, ladder, states, START_SCALE[app.profile.experience] || 1);
    // A stand-in for another exercise keeps its own established scheme;
    // re-ranging it to the slot it's filling would reset its progress every
    // time it moved between slots.
    const standIn = !!(item.swappedFrom && existing);
    if (week.phase === "build" && !standIn) state = E.transitionState(state, item, ladder);
    return state;
}

function prescriptionFor(state, item, ladder, mods) {
    if (item.test) return E.prescribeTest(state);
    if (item.calibrate) {
        const sets = Array.from({ length: item.sets }, (_, i) => ({ setIndex: i, load: state.load, targetReps: item.reps[1] }));
        return { exerciseId: state.exerciseId, sets, repRange: [...item.reps], rir: 2, calibrate: true };
    }
    return E.prescribe(state, ladder, mods);
}

function buildItem(app, item, week, mods, states) {
    const exercise = getExercise(item.exerciseId);
    const ladder = loadLadder(exercise, app.equipment);
    const state = stateFor(app, exercise, item, ladder, week, states);
    return {
        exerciseId: exercise.id,
        role: item.role,
        note: item.note || null,
        superset: item.superset || null,
        test: item.test || null,
        calibrate: !!item.calibrate,
        swappedFrom: item.swappedFrom || item.upgradedFrom || null,
        item: { sets: item.sets, reps: item.reps, role: item.role },
        state,
        prescription: prescriptionFor(state, item, ladder, mods),
        logged: [],
        ended: false
    };
}

// What a session would look like if started now, without a check-in. Used
// for the Today and Plan previews.
export function previewSession(app, sessionId, today) {
    const found = findSession(app, sessionId);
    if (!found) return null;
    const { week, session } = found;
    if (session.kind !== "strength") return { week, session, items: session.items };
    const ctx = safetyCtx(app, today);
    const resolved = resolveItems(applyOverrides(app, session.items, ctx), ctx);
    return { week, session, items: resolved.items.map(i => buildItem(app, i, week, week.mods, app.states)) };
}

// checkin = { sleep, energy, soreness (1-5, 5 is best), ankle (0-5, 0 is fine) }
export function startSession(app, sessionId, checkin, today, now = Date.now()) {
    let found = findSession(app, sessionId);
    if (!found) throw new Error("No session " + sessionId);
    let next = app;

    if (found.session.kind === "conditioning") {
        const ctx = safetyCtx(app, today, checkin && checkin.ankle);
        const resolved = resolveItems(found.session.items, ctx);
        return {
            ...app,
            active: { id: sessionId, kind: "conditioning", week: found.week.n, date: today, startedAt: now, checkin, items: resolved.items, swaps: resolved.swaps }
        };
    }

    const last = lastStrengthDate(app);
    const mods0 = E.sessionModifiers({ readiness: checkin, daysSinceLast: last ? daysBetween(last, today) : null });

    // Over two weeks off: slot in an easy week and start that instead.
    if (mods0.miniDeload && found.week.phase !== "deload" && found.week.phase !== "calibration") {
        const index = found.week.sessions.findIndex(s => s.id === sessionId);
        next = { ...app, insertedDeloads: [...app.insertedDeloads, found.week.n], programme: insertDeloadWeek(app.programme, found.week.n) };
        const week = next.programme.weeks.find(w => w.n === found.week.n);
        found = { week, session: week.sessions[index] };
    }

    const { week, session } = found;
    const mods = { ...week.mods, lighterDay: mods0.lighterDay, loadMultiplier: mods0.loadMultiplier };
    const ctx = safetyCtx(next, today, checkin && checkin.ankle);
    const resolved = resolveItems(applyOverrides(next, session.items, ctx), ctx);
    const warmup = resolveItems(session.warmup || [], ctx).items;

    const reasons = [...mods0.reasons];
    if (checkin && checkin.ankle >= 3) reasons.push("Ankle's sore today: ankle-free exercises only, bike swapped out");
    if (week.phase === "deload") reasons.push("Easy week: fewer sets, stop well short of hard");
    if (week.phase === "calibration") reasons.push("Calibration: do 12 reps, then say how many more you could have done; the weight adjusts between sets");
    if (week.phase === "retest") reasons.push("Retest: the marked lifts are one clean set of as many reps as you can at your week-1 weight");

    return {
        ...next,
        active: {
            id: session.id,
            kind: "strength",
            week: week.n,
            phase: week.phase,
            template: session.template,
            date: today,
            startedAt: now,
            checkin,
            mods,
            reasons,
            swaps: resolved.swaps,
            dropped: resolved.dropped,
            warmup,
            items: resolved.items.map(i => buildItem(next, i, week, mods, next.states))
        }
    };
}

// ---- During a session --------------------------------------------------

function withActiveItems(app, items) {
    return { ...app, active: { ...app.active, items } };
}

// Index of the first set not yet logged, or null when the item is finished.
export function nextSetIndex(activeItem) {
    if (activeItem.ended) return null;
    const i = activeItem.logged.length;
    return i < activeItem.prescription.sets.length ? i : null;
}

// entry = { reps, rir, load?, ankleFlag? }. load defaults to the prescribed
// one; pass it when the user changed the weight for this set.
export function logSet(app, itemIndex, entry, today) {
    const items = [...app.active.items];
    const item = items[itemIndex];
    const setIndex = nextSetIndex(item);
    if (setIndex === null) return app;
    const planned = item.prescription.sets[setIndex];
    const load = entry.load !== undefined ? entry.load : planned.load;
    const logged = [...item.logged, { exerciseId: item.exerciseId, setIndex, load, reps: entry.reps, rir: entry.rir, completed: true, ankleFlag: !!entry.ankleFlag }];
    let updated = { ...item, logged };

    // Calibration: adjust the next set's weight from how this one felt.
    if (item.calibrate && setIndex + 1 < item.prescription.sets.length && load != null) {
        const ladder = loadLadder(getExercise(item.exerciseId), app.equipment);
        const nextLoad = E.calibrationStep(ladder, load, entry.reps, entry.rir, item.item.reps);
        const sets = item.prescription.sets.map((s, i) => (i === setIndex + 1 ? { ...s, load: nextLoad } : s));
        updated = { ...updated, prescription: { ...item.prescription, sets } };
    }
    items[itemIndex] = updated;
    let next = withActiveItems(app, items);

    if (entry.ankleFlag) next = flagAnkle(next, itemIndex, today);
    return next;
}

// Undo the most recent set of an item (fat-finger fix).
export function undoSet(app, itemIndex) {
    const items = [...app.active.items];
    const item = items[itemIndex];
    if (item.logged.length === 0) return app;
    items[itemIndex] = { ...item, logged: item.logged.slice(0, -1), ended: false };
    return withActiveItems(app, items);
}

// Stop an exercise early; the remaining sets don't count against you.
export function endItem(app, itemIndex) {
    const items = [...app.active.items];
    items[itemIndex] = { ...items[itemIndex], ended: true };
    return withActiveItems(app, items);
}

// Exercises the user may swap to: the exercise's alternatives and anything
// sharing its movement pattern, all through today's safety filter.
export function swapOptions(app, itemIndex, today) {
    const item = app.active.items[itemIndex];
    const original = getExercise(item.exerciseId);
    const ctx = safetyCtx(app, today, app.active.checkin && app.active.checkin.ankle);
    const taken = new Set(app.active.items.filter(i => !i.ended).map(i => i.exerciseId));
    const ids = [...original.alternatives, ...LIBRARY.filter(e => e.pattern === original.pattern).map(e => e.id)];
    return [...new Set(ids)].filter(id => !taken.has(id) && isAllowed(getExercise(id), ctx));
}

// Put a different exercise in for the remaining sets. If none were logged
// the item is replaced outright; otherwise it ends and the new one follows.
export function swapItem(app, itemIndex, exerciseId) {
    const items = [...app.active.items];
    const item = items[itemIndex];
    const remaining = item.prescription.sets.length - item.logged.length;
    if (remaining <= 0) return app;
    const week = app.programme.weeks.find(w => w.n === app.active.week) || { phase: app.active.phase, mods: app.active.mods };
    const spec = { exerciseId, role: item.role, sets: item.item.sets, reps: item.item.reps, calibrate: item.calibrate, swappedFrom: item.exerciseId };
    const fresh = buildItem(app, spec, week, app.active.mods, app.states);
    fresh.prescription = { ...fresh.prescription, sets: fresh.prescription.sets.slice(0, remaining).map((s, i) => ({ ...s, setIndex: i })) };
    if (item.logged.length === 0) {
        items[itemIndex] = fresh;
    } else {
        items[itemIndex] = { ...item, ended: true };
        items.splice(itemIndex + 1, 0, fresh);
    }
    return withActiveItems(app, items);
}

// "Felt it in my ankle": pause or remove the exercise, and finish its sets
// with the nearest ankle-free alternative.
function flagAnkle(app, itemIndex, today) {
    const item = app.active.items[itemIndex];
    const states = { ...app.states, [item.exerciseId]: recordAnkleFlag(app.states[item.exerciseId] || item.state, today) };
    let next = { ...app, states };
    const items = [...next.active.items];
    items[itemIndex] = { ...items[itemIndex], state: states[item.exerciseId], ankleFlagged: true };
    next = withActiveItems(next, items);

    // item.logged already includes the flagged set.
    const remaining = item.prescription.sets.length - item.logged.length;
    if (remaining <= 0) return endItem(next, itemIndex);
    // Ankle check-in of 5 forces ALR 0 for the replacement.
    const taken = new Set(next.active.items.filter(i => !i.ended).map(i => i.exerciseId));
    const sub = substitute(item.exerciseId, safetyCtx(next, today, 5, states), LIBRARY, taken);
    return sub ? swapItem(next, itemIndex, sub) : endItem(next, itemIndex);
}

export function discardActive(app) {
    return { ...app, active: null };
}

// ---- Finishing ---------------------------------------------------------

function weekVolume(app, weekN, extraSets = []) {
    const sets = app.history.filter(h => h.kind === "strength" && h.week === weekN).flatMap(h => h.items.flatMap(i => i.sets));
    return E.volumeLoad([...sets, ...extraSets]);
}

function previousBuildWeekVolume(app, weekN) {
    const weeks = app.programme.weeks.filter(w => w.phase === "build" && w.n < weekN).map(w => w.n);
    for (let i = weeks.length - 1; i >= 0; i--) {
        const v = weekVolume(app, weeks[i]);
        if (v > 0) return v;
    }
    return 0;
}

function bestE1rmBefore(app, exerciseId) {
    let best = null;
    for (const h of app.history) {
        for (const i of h.items || []) {
            if (i.exerciseId === exerciseId && i.e1rm && (best === null || i.e1rm > best)) best = i.e1rm;
        }
    }
    return best;
}

export function finishSession(app, today, now = Date.now()) {
    const active = app.active;
    if (!active) return app;
    const durationMin = Math.max(1, Math.round((now - active.startedAt) / 60000));

    if (active.kind === "conditioning") {
        const entry = { id: active.id, kind: "conditioning", week: active.week, date: today, durationMin, items: active.items.map(i => ({ exerciseId: i.exerciseId, minutes: i.minutes, sets: [] })) };
        return { ...app, history: [...app.history, entry], done: { ...app.done, [active.id]: "done" }, active: null };
    }

    const allSets = active.items.flatMap(i => i.logged);
    const holdIncreases = E.shouldHoldIncreases(weekVolume(app, active.week, allSets), previousBuildWeekVolume(app, active.week));
    const states = { ...app.states };
    const items = [];

    for (const item of active.items) {
        if (item.logged.length === 0) continue;
        const exercise = getExercise(item.exerciseId);
        const ladder = loadLadder(exercise, app.equipment);
        const before = item.state;
        const prevBest = bestE1rmBefore(app, item.exerciseId);
        let state;
        let change;

        if (item.test) {
            const set = item.logged[0];
            state = { ...before, lastPerformed: today };
            const base = before.baseline;
            change = { type: "test", reason: set.reps + " reps at " + labelFor(ladder, set.load) + (base ? " (week 1: " + base.reps + ")" : "") };
        } else if (item.calibrate) {
            const last = item.logged[item.logged.length - 1];
            state = E.finishCalibration(before, last, today);
            const label = labelFor(ladder, last.load) + (exercise.implement === "band" ? " band" : "");
            change = { type: "calibrated", reason: last.load != null ? "Starting weight set: " + label : "Baseline recorded" };
        } else {
            ({ state, change } = E.updateAfterSession(before, item.logged, {
                exercise, ladder, equipment: app.equipment, pace: app.profile.pace, today,
                rir: active.mods.rir, lighterDay: active.mods.lighterDay, deload: !!active.mods.deload,
                reducedLoad: active.mods.loadMultiplier < 1, holdIncreases
            }));
        }
        // Ankle-flag bookkeeping lives on the stored state; don't let the
        // pre-session copy overwrite it.
        if (item.ankleFlagged) {
            const flagged = app.states[item.exerciseId];
            state = { ...state, ankleFlags: flagged.ankleFlags, suspendedUntil: flagged.suspendedUntil, excluded: flagged.excluded };
        }
        states[item.exerciseId] = state;
        const e1rm = item.logged.reduce((best, s) => Math.max(best, E.e1rm(s.load, s.reps, s.rir) || 0), 0) || null;
        items.push({
            exerciseId: item.exerciseId,
            sets: item.logged,
            change,
            e1rm,
            // Band "loads" are tension levels, not kg: no strength records.
            pr: !!(e1rm && prevBest && e1rm > prevBest && !active.mods.deload && exercise.implement !== "band"),
            ankleFlagged: !!item.ankleFlagged,
            suggestSwap: change.type === "swap" ? change.to : null
        });
    }

    const entry = {
        id: active.id, kind: "strength", week: active.week, phase: active.phase, template: active.template,
        date: today, durationMin, checkin: active.checkin, feel: null, items
    };
    return { ...app, states, history: [...app.history, entry], done: { ...app.done, [active.id]: "done" }, active: null };
}

export function setFeel(app, feel) {
    if (app.history.length === 0) return app;
    const history = [...app.history];
    history[history.length - 1] = { ...history[history.length - 1], feel };
    return { ...app, history };
}

export function skipSession(app, sessionId) {
    return { ...app, done: { ...app.done, [sessionId]: "skipped" } };
}

export function acceptSwap(app, fromId, toId) {
    const states = { ...app.states };
    if (states[fromId]) states[fromId] = { ...states[fromId], suggestSwap: null };
    return { ...app, overrides: { ...app.overrides, [fromId]: toId }, states };
}

export function declineSwap(app, fromId) {
    const states = { ...app.states };
    if (states[fromId]) states[fromId] = { ...states[fromId], suggestSwap: "declined" };
    return { ...app, states };
}

export function restore(app, exerciseId) {
    if (!app.states[exerciseId]) return app;
    return { ...app, states: { ...app.states, [exerciseId]: restoreExercise(app.states[exerciseId]) } };
}

// Exercises paused or removed after ankle flags.
export function flaggedExercises(app, today) {
    return Object.values(app.states)
        .filter(s => s.excluded || (s.suspendedUntil && s.suspendedUntil > today))
        .map(s => ({ exerciseId: s.exerciseId, excluded: !!s.excluded, until: s.suspendedUntil }));
}

// ---- Progress ----------------------------------------------------------

export function e1rmSeries(app, exerciseId) {
    return app.history
        .filter(h => h.kind === "strength" && h.phase !== "deload" && h.phase !== "retest")
        .flatMap(h => h.items.filter(i => i.exerciseId === exerciseId && i.e1rm).map(i => ({ date: h.date, week: h.week, e1rm: i.e1rm })));
}

export function weeklyVolumes(app) {
    const weeks = new Map();
    for (const h of app.history) {
        if (h.kind !== "strength") continue;
        weeks.set(h.week, (weeks.get(h.week) || 0) + E.volumeLoad(h.items.flatMap(i => i.sets)));
    }
    return [...weeks.entries()].sort((a, b) => a[0] - b[0]).map(([week, volume]) => ({ week, volume: Math.round(volume) }));
}

export function totals(app) {
    const strength = app.history.filter(h => h.kind === "strength");
    return {
        sessions: strength.length,
        conditioning: app.history.filter(h => h.kind === "conditioning").length,
        sets: strength.reduce((n, h) => n + h.items.reduce((m, i) => m + i.sets.length, 0), 0),
        prs: strength.reduce((n, h) => n + h.items.filter(i => i.pr).length, 0),
        skipped: Object.values(app.done).filter(v => v === "skipped").length
    };
}

// Week-1 baseline next to today's estimate (and the week-26 result, once in).
export function baselineComparison(app) {
    const retest = new Map();
    for (const h of app.history) {
        if (h.phase !== "retest") continue;
        for (const i of h.items) if (i.change && i.change.type === "test") retest.set(i.exerciseId, i.sets[0]);
    }
    return Object.values(app.states)
        .filter(s => s.baseline)
        .map(s => ({ exerciseId: s.exerciseId, baseline: s.baseline, e1rm: s.e1rm, load: s.load, retest: retest.get(s.exerciseId) || null }));
}

// ---- Import / export ---------------------------------------------------

export function exportData(app) {
    return JSON.stringify({ ...app, exportedAt: new Date().toISOString() }, null, 1);
}

export function importData(json) {
    const data = typeof json === "string" ? JSON.parse(json) : json;
    for (const key of ["profile", "equipment", "programme", "states", "history", "done"]) {
        if (!data || typeof data[key] !== "object" || data[key] === null) throw new Error("Not a Steady Gains backup (missing " + key + ")");
    }
    if (data.version > APP_VERSION) throw new Error("This backup is from a newer version of the app");
    return { insertedDeloads: [], overrides: {}, active: null, ...data, version: APP_VERSION };
}
