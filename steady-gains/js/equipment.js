// Steady Gains - equipment maths. Turns the kit list into a "load ladder" per
// exercise: the ordered set of loads you can actually set up. The progression
// engine only ever moves up or down this ladder, so it can never prescribe a
// 22.5 kg dumbbell or a 10 kg kettlebell you don't own.
//
// Ladder entries are { value, label }. For dumbbells and kettlebells value is
// kg per implement. For bands value is a relative tension unit: each band is
// assumed to be roughly double the one below (L=1, M=2, H=4), so combining
// bands gives L, M, L+M, H, L+H, M+H, L+M+H = 1..7.

export const DEFAULT_EQUIPMENT = {
    dumbbell: { min: 2.5, max: 20, step: 2.5, pairs: true },
    kettlebell: [5, 7, 12],
    band: ["L", "M", "H"],
    bench: "flat",
    mat: true,
    bike: true
};

function round2(n) {
    return Math.round(n * 100) / 100;
}

export function dumbbellLoads(eq) {
    const { min, max, step } = eq.dumbbell;
    const loads = [];
    for (let i = 0; round2(min + i * step) <= max; i++) {
        loads.push(round2(min + i * step));
    }
    return loads;
}

export function bandCombos(eq) {
    const bands = eq.band || [];
    const combos = [];
    for (let mask = 1; mask < (1 << bands.length); mask++) {
        let value = 0;
        const parts = [];
        bands.forEach((b, i) => {
            if (mask & (1 << i)) {
                value += 1 << i;
                parts.push(b);
            }
        });
        combos.push({ value, label: parts.join("+") });
    }
    return combos.sort((a, b) => a.value - b.value);
}

// The loads available for one exercise. Bodyweight, timed and bike work have
// an empty ladder: they progress by reps, time or variation instead.
export function loadLadder(exercise, eq) {
    switch (exercise.implement) {
        case "dumbbell":
            return eq.dumbbell ? dumbbellLoads(eq).map(kg => ({ value: kg, label: kg + " kg" })) : [];
        case "kettlebell":
            return [...(eq.kettlebell || [])].sort((a, b) => a - b).map(kg => ({ value: kg, label: kg + " kg" }));
        case "band":
            return bandCombos(eq);
        default:
            return [];
    }
}

export function hasImplement(implement, eq) {
    switch (implement) {
        case "dumbbell": return !!eq.dumbbell;
        case "kettlebell": return (eq.kettlebell || []).length > 0;
        case "band": return (eq.band || []).length > 0;
        case "bike": return !!eq.bike;
        default: return true;
    }
}

export function nextLoad(ladder, value) {
    return ladder.find(e => e.value > value) || null;
}

export function prevLoad(ladder, value) {
    for (let i = ladder.length - 1; i >= 0; i--) {
        if (ladder[i].value < value) return ladder[i];
    }
    return null;
}

// Largest available load at or below value; the lightest load if value is
// below everything on the ladder.
export function snapDown(ladder, value) {
    let best = ladder[0] || null;
    for (const e of ladder) {
        if (e.value <= value) best = e;
    }
    return best;
}

export function labelFor(ladder, value) {
    const e = ladder.find(x => x.value === value);
    return e ? e.label : null;
}

export function isMaxLoad(ladder, value) {
    return ladder.length > 0 && value >= ladder[ladder.length - 1].value;
}
