// Steady Gains - small view helpers shared by every screen.

import { loadLadder, labelFor } from "../equipment.js";
import { getExercise } from "../library.js";
import { daysBetween } from "../dates.js";

const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, c => ESC[c]);
}

const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function shortDate(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    return DAY[dt.getUTCDay()] + " " + d + " " + MONTH[m - 1];
}

export function relativeDate(iso, today) {
    const diff = daysBetween(today, iso);
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    if (diff === -1) return "Was due yesterday";
    if (diff < 0) return "Was due " + shortDate(iso);
    return shortDate(iso);
}

export function loadText(exerciseId, load, equipment) {
    const ex = getExercise(exerciseId);
    if (load == null) return ex.implement === "band" ? "band" : "bodyweight";
    const label = labelFor(loadLadder(ex, equipment), load);
    if (ex.implement === "band") return (label || load) + " band";
    return label || load + " kg";
}

export function unitText(exerciseId, n) {
    const ex = getExercise(exerciseId);
    const unit = ex.unit === "seconds" ? "s" : ex.unit === "minutes" ? " min" : "";
    return n + unit + (ex.perSide ? " /side" : "");
}

export function rangeText(exerciseId, range) {
    const ex = getExercise(exerciseId);
    const r = range[0] === range[1] ? String(range[0]) : range[0] + "–" + range[1];
    return r + (ex.unit === "seconds" ? " s" : "") + (ex.perSide ? " /side" : "");
}

export function alrBadge(alr) {
    const text = ["Ankle-free", "Light ankle load", "Standing", "Never"][alr];
    return '<span class="badge' + (alr === 0 ? " accent" : alr >= 2 ? " warn" : "") + '">' + esc(text) + "</span>";
}

export function mmss(totalSec) {
    const s = Math.max(0, Math.round(totalSec));
    return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
}

// A row of chip buttons for a 0-5 / 1-5 scale.
// attrs is extra attribute text for every chip, e.g. 'data-field="sleep"'.
export function chips(action, values, selected, labels = {}, attrs = "") {
    return '<div class="chips" role="group">' + values.map(v =>
        '<button type="button" class="chip" data-action="' + action + '" ' + attrs + ' data-value="' + v + '" aria-pressed="' + (v === selected) + '">' +
        esc(labels[v] != null ? labels[v] : v) + "</button>").join("") + "</div>";
}
