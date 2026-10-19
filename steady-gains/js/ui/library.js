// Steady Gains - exercise reference, with the ankle rating on every entry.

import { esc, alrBadge, chips } from "./dom.js";
import { LIBRARY } from "../library.js";
import { whyNotAllowed } from "../safety.js";

const FILTERS = { all: "All", upper: "Upper", lower: "Hips & legs", core: "Core", conditioning: "Cardio" };

export function render({ app, ui, today }) {
    const ctx = { profile: app.profile, equipment: app.equipment, today, states: app.states };
    const list = LIBRARY.filter(e => ui.libFilter === "all" || e.region === ui.libFilter);
    const cards = list.map(e => {
        const why = whyNotAllowed(e, ctx);
        return `<div class="card${why ? " done" : ""}">
            <div class="spread"><h3>${esc(e.name)}</h3>${alrBadge(e.alr)}</div>
            ${why ? `<p class="hint">Not in your plan: ${esc(why.toLowerCase())}.</p>` : ""}
            <ul class="hint" style="padding-left:18px;margin:4px 0 0">${e.cues.map(c => `<li>${esc(c)}</li>`).join("")}</ul>
        </div>`;
    }).join("");
    return `
<h1>Exercises</h1>
<p class="sub">Every exercise works with your kit. Lunges, step-ups, jumps, calf raises, kettlebell swings and running aren't here at all: they load the ankle too much.</p>
${chips("lib-filter", Object.keys(FILTERS), ui.libFilter, FILTERS)}
<div style="margin-top:14px">${cards}</div>`;
}
