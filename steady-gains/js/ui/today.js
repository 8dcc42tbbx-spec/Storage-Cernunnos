// Steady Gains - Today: what's next, a quick check-in, and the start button.

import { esc, relativeDate, loadText, rangeText, chips, shortDate } from "./dom.js";
import { getExercise } from "../library.js";
import { upNext, previewSession, sessionTitle, blockName, totals } from "../coach.js";
import { TOTAL_WEEKS } from "../programme.js";

const PHASE = {
    calibration: ["Calibration week", "Light sets to find your starting weights."],
    build: ["Build week", ""],
    deload: ["Easy week", "Fewer sets and lighter effort so you recover and come back stronger."],
    retest: ["Retest week", "See how far you've come since week 1."]
};

function checkinRow(field, label, low, high, values, selected) {
    return `<div class="checkin-row">
        <div class="label"><span>${esc(label)}</span><span>${esc(low)} → ${esc(high)}</span></div>
        ${chips("checkin", values, selected, {}, 'data-field="' + field + '"')}
    </div>`;
}

function previewList(app, preview) {
    return '<ul class="list">' + preview.items.map(i => {
        const ex = getExercise(i.exerciseId);
        const p = i.prescription;
        const load = p.sets.length ? loadText(i.exerciseId, p.sets[0].load, app.equipment) : "";
        const how = i.test ? "max reps · " + load : p.sets.length + " × " + rangeText(i.exerciseId, p.repRange || i.item.reps) + (load ? " · " + load : "");
        return `<li><span class="what">${esc(ex.name)}</span><span class="how">${esc(how)}</span></li>`;
    }).join("") + "</ul>";
}

export function render({ app, ui, today }) {
    if (app.active) {
        return `
<h1>Session in progress</h1>
<p class="sub">Started ${esc(shortDate(app.active.date))}. Pick up where you left off.</p>
<a class="btn btn-primary btn-block" href="#/session" style="display:grid;place-items:center;text-decoration:none">Resume session</a>`;
    }

    const next = upNext(app);
    if (!next) {
        const t = totals(app);
        return `
<h1>Six months done</h1>
<p class="sub">${t.sessions} strength sessions, ${t.sets} sets and ${t.prs} personal bests. Have a look at Progress to compare with week 1.</p>
<a href="#/progress" class="btn btn-primary btn-block" style="display:grid;place-items:center;text-decoration:none">See your progress</a>`;
    }

    const { week, session } = next;
    const [phaseName, phaseNote] = PHASE[week.phase] || ["", ""];
    const head = `
<div class="eyebrow">Week ${week.n} of ${Math.max(TOTAL_WEEKS, week.n)} · ${esc(blockName(week.blockId))}</div>
<h1>${esc(relativeDate(session.date, today))}</h1>
<p class="sub">${esc(phaseName)}${phaseNote ? " · " + esc(phaseNote) : ""}</p>
${ui.message ? `<div class="banner info" role="status">${esc(ui.message)}</div>` : ""}`;

    if (session.kind === "conditioning") {
        const item = session.items[0];
        const ex = getExercise(item.exerciseId);
        const detail = item.intervals ? item.intervals.count + " × " + item.intervals.workSec + " s brisk / " + item.intervals.restSec + " s easy" : "Steady, conversational pace";
        return head + `
<div class="card">
    <div class="eyebrow">Optional · conditioning</div>
    <h2>${esc(ex.name)}</h2>
    <p class="num">${item.minutes} min · ${esc(detail)}</p>
    <p class="hint">${esc(ex.cues.join(". "))}.</p>
    ${checkinRow("ankle", "Ankle today", "fine", "sore", [0, 1, 2, 3, 4, 5], ui.checkin.ankle)}
    <div class="stack" style="margin-top:16px">
        <button type="button" class="btn-primary btn-block" data-action="start" data-id="${esc(session.id)}">Start</button>
        <button type="button" class="btn-link quiet btn-block" data-action="skip" data-id="${esc(session.id)}">Skip today's ride</button>
    </div>
</div>`;
    }

    const preview = previewSession(app, session.id, today);
    const c = ui.checkin;
    return head + `
<div class="card">
    <div class="eyebrow">Up next · about ${app.profile.sessionMinutes} min</div>
    <h2>${esc(sessionTitle(session))}</h2>
    ${previewList(app, preview)}
</div>
<div class="card">
    <h2>Quick check-in</h2>
    <p class="hint">Rough is fine. A low score gives you a lighter day that doesn't count against you, and a sore ankle swaps in ankle-free exercises.</p>
    ${checkinRow("sleep", "Sleep", "poor", "great", [1, 2, 3, 4, 5], c.sleep)}
    ${checkinRow("energy", "Energy", "flat", "buzzing", [1, 2, 3, 4, 5], c.energy)}
    ${checkinRow("soreness", "Muscles", "very sore", "fresh", [1, 2, 3, 4, 5], c.soreness)}
    ${checkinRow("ankle", "Ankle", "fine", "sore", [0, 1, 2, 3, 4, 5], c.ankle)}
    <div class="stack" style="margin-top:18px">
        <button type="button" class="btn-primary btn-block" data-action="start" data-id="${esc(session.id)}">Start session</button>
        <button type="button" class="btn-link quiet btn-block" data-action="skip" data-id="${esc(session.id)}">Skip this session</button>
    </div>
</div>`;
}
