// Steady Gains - settings, ankle-flag restores, backup and reset.

import { esc, shortDate } from "./dom.js";
import { profileFields } from "./profile-form.js";
import { flaggedExercises } from "../coach.js";
import { getExercise } from "../library.js";

export function render({ app, ui, today }) {
    const flagged = flaggedExercises(app, today);
    return `
<h1>Settings</h1>
${ui.message ? `<div class="banner info" role="status">${esc(ui.message)}</div>` : ""}
${flagged.length ? `
<div class="card">
    <h2>Paused for your ankle</h2>
    <p class="hint">Flagged during a session. Paused exercises come back on their own; removed ones only if you restore them.</p>
    <ul class="list">${flagged.map(f => `<li><span class="what">${esc(getExercise(f.exerciseId).name)}<br><small>${f.excluded ? "Removed after two flags" : "Paused until " + esc(shortDate(f.until))}</small></span>
        <button type="button" class="btn-link" data-action="restore" data-id="${esc(f.exerciseId)}">Restore</button></li>`).join("")}</ul>
</div>` : ""}
<form data-form="settings" novalidate style="margin-top:16px">
    ${profileFields(app.profile, app.equipment, { theme: true })}
    ${ui.error ? `<p class="error" role="alert">${esc(ui.error)}</p>` : ""}
    <button type="submit" class="btn-primary btn-block">Save changes</button>
    <p class="hint" style="margin-top:8px">Saving rebuilds the calendar around your new settings. Everything you've logged is kept.</p>
</form>
<div class="card" style="margin-top:24px">
    <h2>Your data</h2>
    <p class="hint">Everything is stored on this device only. Export a backup now and then, especially before changing phones.</p>
    <div class="stack">
        <button type="button" class="btn-block" data-action="export">Export backup</button>
        <label class="btn btn-block" style="display:grid;place-items:center;cursor:pointer">Import backup<input type="file" accept="application/json,.json" data-import hidden></label>
        <button type="button" class="btn-block btn-danger" data-action="reset">Delete everything and start again</button>
    </div>
</div>
<p class="hint" style="margin-top:16px">Steady Gains gives general fitness guidance, not medical advice. Stop any exercise that causes pain.</p>`;
}
