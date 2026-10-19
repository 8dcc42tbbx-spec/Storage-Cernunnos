// Steady Gains - the active session. Built for one hand and a dumbbell in the
// other: the weight and reps are pre-filled, and tapping how many reps were
// left in the tank logs the set.

import { esc, loadText, unitText, rangeText } from "./dom.js";
import { getExercise } from "../library.js";
import { loadLadder, nextLoad, prevLoad } from "../equipment.js";
import { nextSetIndex, swapOptions, sessionTitle } from "../coach.js";

const ROLE = { main: "Main lift", accessory: "Accessory", core: "Core" };
const TECHNIQUE = { "rest-pause": "Last set: rest 15 s, then squeeze out a few more reps" };

function itemHints(item, app) {
    const p = item.prescription;
    const hints = [];
    if (item.note) hints.push(item.note);
    if (p.tempo) hints.push(p.tempo === "3-0-1" ? "Lower for 3 seconds every rep" : "Lower for 3 s, pause 1 s at the bottom");
    if (p.technique) hints.push(TECHNIQUE[p.technique] || p.technique);
    if (p.addedBand) hints.push("Add the " + p.addedBand + " band");
    if (item.swappedFrom) hints.push("Instead of " + getExercise(item.swappedFrom).name);
    if (item.state && item.state.stepPlan) hints.push("Bridging to a heavier weight: the heavy set comes first");
    return hints.map(h => `<p class="hint">${esc(h)}</p>`).join("");
}

function setLine(item, s, logged, app) {
    const what = loadText(item.exerciseId, logged ? logged.load : s.load, app.equipment);
    if (logged) {
        return `<li class="logged"><span>✓ Set ${s.setIndex + 1}</span><span>${esc(what)} × ${esc(unitText(item.exerciseId, logged.reps))}<small> · ${logged.rir >= 3 ? "3+" : logged.rir} left${logged.ankleFlag ? " · ankle" : ""}</small></span></li>`;
    }
    const target = typeof s.targetReps === "number" ? unitText(item.exerciseId, s.targetReps) : "max";
    return `<li><span>Set ${s.setIndex + 1}</span><span>${esc(what)} × ${esc(target)}</span></li>`;
}

function currentSet(item, index, app, ui) {
    const ex = getExercise(item.exerciseId);
    const ladder = loadLadder(ex, app.equipment);
    const d = ui.draft;
    const setIndex = nextSetIndex(item);
    const p = item.prescription;
    const seconds = ex.unit === "seconds";
    const loadControls = ladder.length && d.load != null ? `
        <div class="stepper" aria-label="Weight">
            <button type="button" data-action="load-step" data-dir="down" aria-label="Lighter" ${prevLoad(ladder, d.load) ? "" : "disabled"}>−</button>
            <div class="val"><div class="big">${esc(loadText(item.exerciseId, d.load, app.equipment))}</div><div class="unit">${ex.implement === "band" ? "band" : ex.pair ? "each hand" : "weight"}</div></div>
            <button type="button" data-action="load-step" data-dir="up" aria-label="Heavier" ${nextLoad(ladder, d.load) ? "" : "disabled"}>+</button>
        </div>` : "";
    const effort = item.test
        ? "As many clean reps as you can. Stop the moment form slips."
        : item.calibrate
            ? "Do " + d.reps + ", then say how many more you could have done. The next set's weight adjusts."
            : "Aim to finish with about " + (p.rir >= 3 ? "3 or more" : p.rir) + " left in the tank.";
    return `
    <li class="current">
        <div class="spread"><strong>Set ${setIndex + 1} of ${p.sets.length}</strong><small>${esc(rangeText(item.exerciseId, p.repRange || item.item.reps))}</small></div>
        ${loadControls}
        <div class="stepper" aria-label="${seconds ? "Seconds" : "Reps"}">
            <button type="button" data-action="reps-step" data-dir="down" aria-label="Fewer">−</button>
            <div class="val"><div class="big">${d.reps}</div><div class="unit">${seconds ? "seconds" : "reps"}${ex.perSide ? " each side" : ""}</div></div>
            <button type="button" data-action="reps-step" data-dir="up" aria-label="More">+</button>
        </div>
        <p class="rir-help">${esc(effort)}<br><strong>How many more could you have done?</strong></p>
        <div class="rir" role="group" aria-label="Reps left in the tank">
            ${[0, 1, 2, 3].map(v => `<button type="button" data-action="rir" data-value="${v}" aria-label="${v === 3 ? "3 or more" : v} more">${v === 3 ? "3+" : v}</button>`).join("")}
        </div>
        <label class="toggle"><input type="checkbox" data-action="ankle-toggle"${d.ankle ? " checked" : ""}> Felt it in my ankle</label>
    </li>`;
}

function swapList(item, index, app, today) {
    const opts = swapOptions(app, index, today);
    if (!opts.length) return `<p class="hint">No ankle-safe alternatives available right now.</p>`;
    return `<div class="stack" style="margin-top:8px">${opts.map(id =>
        `<button type="button" class="btn-block" data-action="swap-to" data-item="${index}" data-id="${esc(id)}">${esc(getExercise(id).name)}</button>`).join("")}</div>`;
}

function itemCard(item, index, app, ui, today) {
    const ex = getExercise(item.exerciseId);
    const p = item.prescription;
    const doneCount = item.logged.length;
    const finished = nextSetIndex(item) === null;
    const focused = ui.focus === index;
    const tag = [ROLE[item.role], item.superset ? "Superset " + item.superset : null, item.test ? "Retest" : null].filter(Boolean).join(" · ");

    if (!focused) {
        const status = finished ? (doneCount ? "✓ " + doneCount + (doneCount === 1 ? " set" : " sets") : "Skipped") : doneCount + "/" + p.sets.length + " sets";
        return `<div class="card${finished ? " done" : ""}">
            <button type="button" class="btn-link" style="width:100%;text-align:left;padding:0;color:inherit" data-action="focus" data-item="${index}">
                <span class="spread"><span><span class="eyebrow">${esc(tag)}</span><br><strong>${esc(ex.name)}</strong></span><small>${esc(status)}</small></span>
            </button>
        </div>`;
    }

    const rows = p.sets.map((s, i) => {
        const logged = item.logged[i];
        if (logged) return setLine(item, s, logged, app);
        if (!finished && i === doneCount) return currentSet(item, index, app, ui);
        return setLine(item, s, null, app);
    }).join("");

    return `<div class="card focus" id="item-${index}">
        <div class="eyebrow">${esc(tag)}</div>
        <h2>${esc(ex.name)}</h2>
        ${itemHints(item, app)}
        <details class="cues"><summary>How to do it</summary><ul>${ex.cues.map(c => `<li>${esc(c)}</li>`).join("")}</ul></details>
        <ul class="sets">${rows}</ul>
        <div class="row wrap" style="margin-top:6px">
            ${doneCount ? `<button type="button" class="btn-link" data-action="undo" data-item="${index}">Undo last set</button>` : ""}
            ${!finished ? `<button type="button" class="btn-link" data-action="swap-open" data-item="${index}">${ui.swapFor === index ? "Cancel swap" : "Swap exercise"}</button>` : ""}
            ${!finished ? `<button type="button" class="btn-link quiet" data-action="end-item" data-item="${index}">Skip remaining sets</button>` : ""}
        </div>
        ${ui.swapFor === index ? swapList(item, index, app, today) : ""}
    </div>`;
}

function conditioning(app, today) {
    const a = app.active;
    const item = a.items[0];
    const ex = getExercise(item.exerciseId);
    const plan = item.intervals
        ? `${item.intervals.count} rounds: ${item.intervals.workSec} s brisk, ${item.intervals.restSec} s easy. Warm up and cool down easy for the rest.`
        : "Keep it conversational the whole way.";
    return `
<div class="spread"><div><div class="eyebrow">Week ${a.week} · conditioning</div><h1>${esc(ex.name)}</h1></div><div class="big num" data-elapsed="${a.startedAt}">0:00</div></div>
${a.swaps && a.swaps.length ? `<div class="banner">${esc(a.swaps[0].reason)}: doing the seated band circuit instead.</div>` : ""}
<div class="card">
    <p class="num"><strong>${item.minutes} minutes</strong></p>
    <p>${esc(plan)}</p>
    <ul class="hint">${ex.cues.map(c => `<li>${esc(c)}</li>`).join("")}</ul>
</div>
<div class="finish-bar stack">
    <button type="button" class="btn-primary btn-block" data-action="finish">Done</button>
    <button type="button" class="btn-link quiet btn-block" data-action="discard">Discard</button>
</div>`;
}

export function render({ app, ui, today }) {
    const a = app.active;
    if (a.kind === "conditioning") return conditioning(app, today);

    const notes = [
        ...a.reasons,
        ...(a.swaps || []).map(s => getExercise(s.from).name + " → " + getExercise(s.to).name + ": " + s.reason),
        ...(a.dropped || []).map(d => getExercise(d.exerciseId).name + " left out: " + d.reason)
    ];
    const warm = a.warmup.map((w, i) => {
        const ex = getExercise(w.exerciseId);
        const what = w.minutes ? w.minutes + " min " + ex.name.replace(/^Bike: /, "bike, ").toLowerCase() : (w.sets + " × " + w.reps[0] + " " + ex.name.toLowerCase());
        const on = !!ui.warm[i];
        return `<li><button type="button" class="btn-link" style="padding:0;color:inherit;text-align:left" data-action="warm" data-index="${i}" aria-pressed="${on}">${on ? "☑" : "☐"} ${esc(what)}</button></li>`;
    }).join("");
    const allWarm = a.warmup.every((_, i) => ui.warm[i]);

    return `
<div class="spread">
    <div><div class="eyebrow">Week ${a.week}${a.phase !== "build" ? " · " + esc(a.phase) : ""}</div><h1>${esc(sessionTitle({ kind: "strength", template: a.template }))}</h1></div>
    <div class="num" style="font-size:1.2rem;font-weight:700" data-elapsed="${a.startedAt}" aria-label="Time elapsed">0:00</div>
</div>
${notes.map(n => `<div class="banner">${esc(n)}</div>`).join("")}
${ui.message ? `<div class="banner info" role="status">${esc(ui.message)}</div>` : ""}
<details class="card"${allWarm ? "" : " open"}>
    <summary class="spread" style="cursor:pointer"><strong>Warm-up</strong><small>${allWarm ? "✓ done" : "~6 min"}</small></summary>
    <ul class="list" style="margin-top:8px">${warm}<li><span class="hint">Then one light set of the first exercise at about half weight.</span></li></ul>
</details>
${a.items.map((item, i) => itemCard(item, i, app, ui, today)).join("")}
<div class="finish-bar stack">
    <button type="button" class="btn-primary btn-block" data-action="finish">Finish session</button>
    <button type="button" class="btn-link quiet btn-block" data-action="discard">Discard session</button>
</div>`;
}

export function mount(root, { ui }) {
    if (ui.focus != null && ui.scrollToFocus) {
        ui.scrollToFocus = false;
        const el = root.querySelector("#item-" + ui.focus);
        if (el) el.scrollIntoView({ block: "start", behavior: "smooth" });
    }
}
