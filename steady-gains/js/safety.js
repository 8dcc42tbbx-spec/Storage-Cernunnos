// Steady Gains - ankle safety. A hard filter between the exercise library and
// anything the user is ever asked to do. Nothing in programme.js or engine.js
// should hand out an exercise without it passing through here.
//
// ctx = { profile, equipment, ankleCheckin?, today?, states? }
//   profile.ankle = { ceiling, bikeOk, flatFootOk }
//   ankleCheckin  = today's 0-5 ankle score (higher is worse), if known
//   states        = { [exerciseId]: progression state } for suspensions

import { LIBRARY, getExercise } from "./library.js";
import { hasImplement } from "./equipment.js";
import { addDays } from "./dates.js";

export const MAX_ALR = 2;              // ALR 3 can never be unlocked
export const ANKLE_REBUILD_AT = 3;     // check-in score that forces ALR 0
export const SUSPEND_DAYS = 14;
export const FLAGS_TO_EXCLUDE = 2;

export function effectiveCeiling(profile, ankleCheckin) {
    if (ankleCheckin != null && ankleCheckin >= ANKLE_REBUILD_AT) return 0;
    const chosen = profile.ankle && profile.ankle.ceiling != null ? profile.ankle.ceiling : 1;
    return Math.max(0, Math.min(chosen, MAX_ALR));
}

// Returns null if the exercise is allowed, otherwise a short reason.
export function whyNotAllowed(ex, ctx) {
    const { profile, equipment, ankleCheckin, today, states } = ctx;
    const ankle = profile.ankle || {};
    if (ex.alr > MAX_ALR) return "Never assigned: puts too much load through the ankle";
    if (ex.ankleContact) return "Needs a band or weight on the foot or ankle";
    if (ex.alr > effectiveCeiling(profile, ankleCheckin)) {
        return ankleCheckin >= ANKLE_REBUILD_AT
            ? "Ankle is sore today: ankle-free exercises only"
            : "Above your ankle setting";
    }
    if (ex.footLoaded && ankle.flatFootOk === false) return "Pushes through a planted foot";
    if (ex.implement === "bike" && ankle.bikeOk === false) return "Cycling is switched off for your ankle";
    if (!hasImplement(ex.implement, equipment)) return "Equipment not available";
    for (const need of ex.needs) {
        if (!equipment[need]) return "Needs a " + need;
    }
    const st = states && states[ex.id];
    if (st) {
        if (st.excluded) return "Removed after ankle flags";
        if (st.suspendedUntil && today && today < st.suspendedUntil) return "Paused after an ankle flag";
    }
    return null;
}

export function isAllowed(ex, ctx) {
    return whyNotAllowed(ex, ctx) === null;
}

export function allowedExercises(ctx, library = LIBRARY) {
    return library.filter(ex => isAllowed(ex, ctx));
}

// Nearest allowed replacement: the exercise's own alternatives first, then
// anything with the same movement pattern, then the same body region.
// `taken` holds ids already in the session so a swap never duplicates one.
export function substitute(exerciseId, ctx, library = LIBRARY, taken = new Set()) {
    const byId = new Map(library.map(e => [e.id, e]));
    const original = byId.get(exerciseId) || getExercise(exerciseId);
    const ok = e => e && e.id !== original.id && !taken.has(e.id) && isAllowed(e, ctx);

    for (const id of original.alternatives) {
        if (ok(byId.get(id))) return id;
    }
    const samePattern = library.find(e => e.pattern === original.pattern && ok(e));
    if (samePattern) return samePattern.id;
    if (original.region === "conditioning") return null;
    const sameRegion = library.find(e => e.region === original.region && ok(e));
    return sameRegion ? sameRegion.id : null;
}

// Run a list of session items through the filter, swapping or dropping any
// that aren't allowed. Items are { exerciseId, ... } and keep their other
// fields (sets, reps, role) when swapped.
export function resolveItems(items, ctx, library = LIBRARY) {
    const byId = new Map(library.map(e => [e.id, e]));
    const taken = new Set();
    const out = [];
    const swaps = [];
    const dropped = [];
    for (const item of items) {
        const ex = byId.get(item.exerciseId) || getExercise(item.exerciseId);
        const reason = taken.has(ex.id) ? "Already in this session" : whyNotAllowed(ex, ctx);
        if (reason === null) {
            taken.add(ex.id);
            out.push(item);
            continue;
        }
        const sub = substitute(ex.id, ctx, library, taken);
        if (sub) {
            taken.add(sub);
            out.push({ ...item, exerciseId: sub, swappedFrom: ex.id });
            swaps.push({ from: ex.id, to: sub, reason });
        } else {
            dropped.push({ exerciseId: ex.id, reason });
        }
    }
    return { items: out, swaps, dropped };
}

// "Felt it in my ankle": pause the exercise for two weeks; a second flag
// removes it until the user restores it in Settings.
export function recordAnkleFlag(state, today) {
    const ankleFlags = (state.ankleFlags || 0) + 1;
    if (ankleFlags >= FLAGS_TO_EXCLUDE) {
        return { ...state, ankleFlags, excluded: true, suspendedUntil: null };
    }
    return { ...state, ankleFlags, suspendedUntil: addDays(today, SUSPEND_DAYS) };
}

export function restoreExercise(state) {
    return { ...state, ankleFlags: 0, excluded: false, suspendedUntil: null };
}
