// Steady Gains - first-run set-up.

import { esc } from "./dom.js";
import { profileFields } from "./profile-form.js";
import { DEFAULT_PROFILE } from "../coach.js";
import { DEFAULT_EQUIPMENT } from "../equipment.js";
import { addDays, weekdayOf } from "../dates.js";

// Today if it's a default training day, otherwise the next Monday.
function defaultStartDate(today) {
    if (["mon", "wed", "fri"].includes(weekdayOf(today))) return today;
    let d = today;
    while (weekdayOf(d) !== "mon") d = addDays(d, 1);
    return d;
}

export function render({ ui, today }) {
    const profile = { ...DEFAULT_PROFILE, startDate: defaultStartDate(today) };
    return `
<h1>Steady Gains</h1>
<p class="sub">A six-month weights plan built around your kit and your ankle. It adjusts after every set you log, and pushes you steadily, never hard.</p>
<div class="banner">This is general fitness guidance, not medical advice. If your ankle has never been assessed, one physio visit to confirm safe positions is worth it. Stop any exercise that hurts.</div>
<form data-form="setup" novalidate>
    ${profileFields(profile, DEFAULT_EQUIPMENT, { setup: true })}
    ${ui.error ? `<p class="error" role="alert">${esc(ui.error)}</p>` : ""}
    <button type="submit" class="btn-primary btn-block">Build my plan</button>
    <p class="hint" style="margin-top:10px">Week 1 is calibration: light sets that find your starting weights. Everything stays on this device.</p>
</form>`;
}
