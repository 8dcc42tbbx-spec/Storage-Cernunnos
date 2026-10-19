// Steady Gains - the profile/equipment form, shared by first-run set-up and
// Settings so the two can never drift apart.

import { esc } from "./dom.js";
import { WEEKDAYS } from "../dates.js";

const DAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_LABEL = { mon: "M", tue: "T", wed: "W", thu: "T", fri: "F", sat: "S", sun: "S" };

function radio(name, value, current, title, desc) {
    return '<label class="choice"><input type="radio" name="' + name + '" value="' + esc(value) + '"' + (String(current) === String(value) ? " checked" : "") + '>' +
        '<span><span class="t">' + esc(title) + '</span>' + (desc ? '<br><span class="d">' + esc(desc) + "</span>" : "") + "</span></label>";
}

function check(name, checked, text) {
    return '<label class="toggle"><input type="checkbox" name="' + name + '"' + (checked ? " checked" : "") + '> ' + esc(text) + "</label>";
}

function days(name, selected) {
    return '<div class="days">' + DAY_ORDER.map(d =>
        '<label title="' + d + '"><input type="checkbox" name="' + name + '" value="' + d + '"' + (selected.includes(d) ? " checked" : "") + '>' + DAY_LABEL[d] + "</label>").join("") + "</div>";
}

// opts.setup adds the start date; Settings adds the theme.
export function profileFields(profile, equipment, opts = {}) {
    const a = profile.ankle;
    const db = equipment.dumbbell || { min: 2.5, max: 20, step: 2.5 };
    const bands = equipment.band || [];
    return `
<fieldset>
    <legend>Your ankle</legend>
    <p class="hint">Exercises are filtered by how much they load the ankle. Lunges, jumps, single-leg balance work and calf raises are never included, whatever you pick.</p>
    ${radio("ankleLevel", 0, a.ceiling, "Ankle-free only", "Lying, seated and side-lying work. Nothing that pushes through the feet, no kneeling, no bike.")}
    ${radio("ankleLevel", 1, a.ceiling, "Light, flat-footed work is OK (recommended)", "Adds glute bridges and hip thrusts with feet planted, kneeling with padding, and the bike at low resistance.")}
    ${radio("ankleLevel", 2, a.ceiling, "A physio has cleared standing, two-footed lifts", "Adds goblet box squats and deadlifts from Block 2. Only pick this with professional clearance.")}
    <div class="field" style="margin-top:10px">
        ${check("flatFootOk", a.flatFootOk !== false, "Sitting with feet flat and pushing gently through them is comfortable")}
        ${check("bikeOk", a.bikeOk !== false, "Pedalling an exercise bike is comfortable")}
    </div>
</fieldset>

<fieldset>
    <legend>Schedule</legend>
    <div class="field"><span class="label">Strength days (3 recommended)</span>${days("strength", profile.schedule.strength)}</div>
    <div class="field"><span class="label">Bike days (optional)</span>${days("bike", profile.schedule.bike || [])}</div>
    <div class="field">
        <label for="sessionMinutes">Session length</label>
        <select id="sessionMinutes" name="sessionMinutes">
            ${[35, 45, 60].map(m => `<option value="${m}"${profile.sessionMinutes === m ? " selected" : ""}>${m} minutes${m === 45 ? " (recommended)" : ""}</option>`).join("")}
        </select>
    </div>
    ${opts.setup ? `<div class="field"><label for="startDate">Start date</label><input type="date" id="startDate" name="startDate" value="${esc(profile.startDate || "")}" required></div>` : ""}
</fieldset>

<fieldset>
    <legend>Experience</legend>
    ${radio("experience", "new", profile.experience, "New to weights", "Starts lighter.")}
    ${radio("experience", "some", profile.experience, "Some experience", "")}
    ${radio("experience", "regular", profile.experience, "Lift regularly", "Starts a little heavier.")}
    <p class="hint">Week 1 finds your real starting weights either way.</p>
</fieldset>

<fieldset>
    <legend>Pace</legend>
    ${radio("pace", "gentle", profile.pace, "Gentle (recommended)", "Top of the rep range twice before the weight goes up.")}
    ${radio("pace", "steady", profile.pace, "Steady", "Weight goes up after one good session.")}
    ${radio("pace", "easy", profile.pace, "Easy-going", "Three sessions at the top, smaller rep nudges.")}
</fieldset>

<fieldset>
    <legend>Equipment</legend>
    <div class="field">
        <span class="label">Adjustable dumbbells (kg each)</span>
        <div class="grid3">
            <label><small>Lightest</small><input type="number" name="dbMin" step="0.25" min="0.5" value="${esc(db.min)}"></label>
            <label><small>Heaviest</small><input type="number" name="dbMax" step="0.25" min="1" value="${esc(db.max)}"></label>
            <label><small>Step</small><input type="number" name="dbStep" step="0.25" min="0.25" value="${esc(db.step)}"></label>
        </div>
    </div>
    <div class="field">
        <label for="kettlebells">Kettlebells (kg, comma separated)</label>
        <input type="text" id="kettlebells" name="kettlebells" inputmode="decimal" value="${esc((equipment.kettlebell || []).join(", "))}">
    </div>
    <div class="field">
        <span class="label">Resistance bands</span>
        <div class="row wrap">
            ${check("band_L", bands.includes("L"), "Low")}
            ${check("band_M", bands.includes("M"), "Medium")}
            ${check("band_H", bands.includes("H"), "High")}
        </div>
    </div>
    <div class="field">
        ${check("hasBench", !!equipment.bench, "Flat bench")}
        ${check("hasMat", !!equipment.mat, "Gym mat")}
        ${check("hasBike", !!equipment.bike, "Exercise bike")}
    </div>
</fieldset>
${opts.theme ? `
<fieldset>
    <legend>Appearance</legend>
    <div class="field">
        <select name="theme" aria-label="Theme">
            ${[["dark", "Dark"], ["light", "Light"], ["system", "Match my phone"]].map(([v, t]) => `<option value="${v}"${(profile.theme || "dark") === v ? " selected" : ""}>${t}</option>`).join("")}
        </select>
    </div>
</fieldset>` : ""}
`;
}

// Read the form back. Returns { profile, equipment, errors }.
export function readProfileForm(form) {
    const f = new FormData(form);
    const errors = [];
    const num = k => Number(f.get(k));
    const level = Number(f.get("ankleLevel"));
    const strength = f.getAll("strength");
    const bike = f.getAll("bike").filter(d => !strength.includes(d));
    if (strength.length === 0) errors.push("Pick at least one strength day.");

    const dbMin = num("dbMin"), dbMax = num("dbMax"), dbStep = num("dbStep");
    if (!(dbMin > 0 && dbMax >= dbMin && dbStep > 0)) errors.push("Check the dumbbell weights: lightest, heaviest and step must be positive, heaviest at least the lightest.");
    else if ((dbMax - dbMin) / dbStep > 200) errors.push("That dumbbell step is too small.");
    const kettlebell = String(f.get("kettlebells") || "").split(/[,\s]+/).map(Number).filter(n => n > 0);
    const band = ["L", "M", "H"].filter(b => f.get("band_" + b));

    const profile = {
        ankle: { ceiling: [0, 1, 2].includes(level) ? level : 1, flatFootOk: !!f.get("flatFootOk"), bikeOk: !!f.get("bikeOk") },
        schedule: { strength: sortDays(strength), bike: sortDays(bike) },
        sessionMinutes: num("sessionMinutes") || 45,
        experience: f.get("experience") || "some",
        pace: f.get("pace") || "gentle"
    };
    if (f.has("startDate")) {
        profile.startDate = f.get("startDate");
        if (!/^\d{4}-\d{2}-\d{2}$/.test(profile.startDate)) errors.push("Pick a start date.");
    }
    if (f.has("theme")) profile.theme = f.get("theme");
    const equipment = {
        dumbbell: { min: dbMin, max: dbMax, step: dbStep, pairs: true },
        kettlebell: [...new Set(kettlebell)].sort((a, b) => a - b),
        band,
        bench: f.get("hasBench") ? "flat" : false,
        mat: !!f.get("hasMat"),
        bike: !!f.get("hasBike")
    };
    return { profile, equipment, errors };
}

function sortDays(list) {
    return [...list].sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b)).filter(d => WEEKDAYS.includes(d));
}
