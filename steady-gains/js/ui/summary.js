// Steady Gains - session summary: what changes next time, and why.

import { esc, chips, loadText, unitText, relativeDate } from "./dom.js";
import { getExercise } from "../library.js";
import { upNext, sessionTitle } from "../coach.js";

const ICON = {
    increase: ["▲", "up"], step: ["▲", "up"], extend: ["+", "up"], range: ["+", "up"], nudge: ["+", "up"],
    ceiling: ["↻", "up"], swap: ["⇄", "up"], rotate: ["⇄", ""], calibrated: ["✓", "up"], test: ["★", "up"],
    hold: ["=", ""], none: ["=", ""], decrease: ["▼", "down"], reset: ["▼", "down"]
};
const FEEL = { 1: "Rough", 2: "Meh", 3: "OK", 4: "Good", 5: "Strong" };

export function render({ app, today }) {
    const h = app.history[app.history.length - 1];
    if (!h) return `<h1>No sessions yet</h1><p><a href="#/today">Back to today</a></p>`;
    const next = upNext(app);
    const nextLine = next ? `Next: ${esc(sessionTitle(next.session))}, ${esc(relativeDate(next.session.date, today).toLowerCase())}.` : "That was the last session of the plan.";

    if (h.kind === "conditioning") {
        return `
<h1>Ride done ✓</h1>
<p class="sub">${h.durationMin} min. ${nextLine}</p>
<a href="#/today" class="btn btn-primary btn-block" style="display:grid;place-items:center;text-decoration:none">Done</a>`;
    }

    const sets = h.items.reduce((n, i) => n + i.sets.length, 0);
    const prs = h.items.filter(i => i.pr);
    const rows = h.items.map(i => {
        const ex = getExercise(i.exerciseId);
        const [icon, cls] = ICON[i.change.type] || ["·", ""];
        const best = i.sets.reduce((b, s) => (!b || s.reps * (s.load || 1) > b.reps * (b.load || 1) ? s : b), null);
        const did = i.sets.length + " × " + (best ? loadText(i.exerciseId, best.load, app.equipment) + " × " + unitText(i.exerciseId, best.reps) : "");
        const swap = i.suggestSwap && i.suggestSwap !== "rotate" && app.states[i.exerciseId] && app.states[i.exerciseId].suggestSwap === i.suggestSwap
            ? `<div class="row wrap" style="margin-top:6px">
                <button type="button" data-action="accept-swap" data-from="${esc(i.exerciseId)}" data-to="${esc(i.suggestSwap)}">Switch to ${esc(getExercise(i.suggestSwap).name)}</button>
                <button type="button" class="btn-link quiet" data-action="decline-swap" data-from="${esc(i.exerciseId)}">Keep as is</button>
               </div>`
            : (app.overrides[i.exerciseId] ? `<p class="hint">Switched to ${esc(getExercise(app.overrides[i.exerciseId]).name)} from next time.</p>` : "");
        return `<div class="change">
            <span class="icon ${cls}" aria-hidden="true">${icon}</span>
            <div class="grow">
                <div class="spread"><strong>${esc(ex.name)}</strong>${i.pr ? '<span class="badge accent">New best</span>' : ""}</div>
                <div class="hint num">${esc(did)}${i.ankleFlagged ? " · ankle flagged, paused" : ""}</div>
                <div>${esc(i.change.reason)}</div>
                ${swap}
            </div>
        </div>`;
    }).join("");

    return `
<h1>Session done ✓</h1>
<p class="sub">${h.durationMin} min · ${sets} sets${prs.length ? " · " + prs.length + " new best" + (prs.length > 1 ? "s" : "") : ""}</p>
<div class="card">
    <h2>What changes next time</h2>
    ${rows || '<p class="hint">Nothing was logged.</p>'}
</div>
<div class="card">
    <h2>How did it feel overall?</h2>
    ${chips("feel", [1, 2, 3, 4, 5], h.feel, FEEL)}
</div>
<p class="hint" style="margin-top:14px">${nextLine}</p>
<a href="#/today" class="btn btn-primary btn-block" style="display:grid;place-items:center;text-decoration:none;margin-top:8px">Done</a>`;
}
