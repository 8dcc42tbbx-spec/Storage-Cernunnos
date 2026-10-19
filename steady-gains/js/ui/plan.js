// Steady Gains - the whole 26 weeks at a glance.

import { esc, shortDate, rangeText } from "./dom.js";
import { getExercise } from "../library.js";
import { upNext, sessionTitle, blockName } from "../coach.js";
import { BLOCKS } from "../programme.js";

const PHASE_BADGE = { calibration: ["Calibration", "accent"], deload: ["Easy week", ""], retest: ["Retest", "accent"], build: null };

function sessionRow(app, s) {
    const status = app.done[s.id];
    const icon = status === "done" ? "✓" : status === "skipped" ? "–" : "○";
    const items = s.items.map(i => {
        const ex = getExercise(i.exerciseId);
        return s.kind === "strength" ? ex.name + " " + i.sets + "×" + rangeText(i.exerciseId, i.reps) : (i.minutes + " min");
    }).join(" · ");
    return `<div class="session-row${status === "done" ? " is-done" : ""}">
        <span class="status" aria-label="${status || "to do"}">${icon}</span>
        <div class="grow"><div class="spread"><strong>${esc(sessionTitle(s))}</strong><small class="num">${esc(shortDate(s.date))}</small></div>
        <div class="items">${esc(items)}</div></div>
    </div>`;
}

export function render({ app }) {
    const next = upNext(app);
    const currentWeek = next ? next.week.n : null;
    let lastHead = null;
    const parts = [];
    for (const w of app.programme.weeks) {
        const head = w.phase === "calibration" ? "cal" : w.phase === "retest" ? "retest" : w.blockId;
        if (head !== lastHead) {
            lastHead = head;
            const b = BLOCKS.find(x => x.id === w.blockId);
            const title = head === "cal" ? "Calibration" : head === "retest" ? "Retest" : blockName(w.blockId);
            const desc = head === "cal" ? "Find your starting weights."
                : head === "retest" ? "Compare with week 1."
                    : b.main.sets + " × " + b.main.reps.join("–") + " main lifts · " + b.accessory.sets + " × " + b.accessory.reps.join("–") + " accessories";
            parts.push(`<div class="block-head"><div class="eyebrow">${esc(desc)}</div><h2>${esc(title)}</h2></div>`);
        }
        const strength = w.sessions.filter(s => s.kind === "strength");
        const doneN = strength.filter(s => app.done[s.id] === "done").length;
        const badge = PHASE_BADGE[w.phase];
        parts.push(`<details class="week"${w.n === currentWeek ? " open" : ""}>
            <summary><span><strong>Week ${w.n}</strong> ${badge ? `<span class="badge ${badge[1]}">${badge[0]}</span>` : ""} ${w.n === currentWeek ? '<span class="badge accent">Now</span>' : ""}</span>
            <small class="num">${doneN}/${strength.length} · ${esc(shortDate(w.start))}</small></summary>
            <div class="sessions">${w.sessions.map(s => sessionRow(app, s)).join("")}</div>
        </details>`);
    }
    return `
<h1>Your plan</h1>
<p class="sub">${app.programme.weeks.length} weeks. Dates are a guide: if you miss a day, the plan simply waits for you.</p>
${parts.join("")}`;
}
