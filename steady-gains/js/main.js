// Steady Gains - app controller. Holds the app object, persists every change,
// routes between screens and turns taps into coach.js calls. Screens are
// plain functions returning HTML; all clicks go through one delegated
// handler keyed on data-action.

import * as C from "./coach.js";
import { DEFAULT_EQUIPMENT, loadLadder, nextLoad, prevLoad } from "./equipment.js";
import { getExercise } from "./library.js";
import { localToday } from "./dates.js";
import { loadApp, saveApp, clearApp, requestPersistence } from "./db.js";
import { readProfileForm } from "./ui/profile-form.js";
import { mmss } from "./ui/dom.js";
import * as setupView from "./ui/setup.js";
import * as todayView from "./ui/today.js";
import * as sessionView from "./ui/session.js";
import * as summaryView from "./ui/summary.js";
import * as planView from "./ui/plan.js";
import * as progressView from "./ui/progress.js";
import * as libraryView from "./ui/library.js";
import * as settingsView from "./ui/settings.js";

const VIEWS = {
    setup: setupView, today: todayView, session: sessionView, summary: summaryView,
    plan: planView, progress: progressView, library: libraryView, settings: settingsView
};

let app = null;
// Screen-only state that isn't worth saving.
const ui = {
    checkin: { sleep: 4, energy: 4, soreness: 4, ankle: 0 },
    focus: null,
    draft: null,
    swapFor: null,
    warm: {},
    rest: null,
    libFilter: "all",
    message: null,
    error: null
};

const $view = document.getElementById("view");
const $tabs = document.getElementById("tabs");
const $rest = document.getElementById("restbar");

const today = () => localToday();

function route() {
    const name = (location.hash.replace(/^#\/?/, "").split("?")[0]) || "today";
    return VIEWS[name] ? name : "today";
}

function go(name) {
    if (location.hash !== "#/" + name) location.hash = "#/" + name;
    else render();
}

function setApp(next, { rerender = true } = {}) {
    app = next;
    saveApp(app);
    if (rerender) render();
}

function applyTheme() {
    const theme = (app && app.profile.theme) || "dark";
    document.documentElement.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim() || "#0f1110";
}

function render() {
    let name = route();
    if (!app && name !== "setup") name = "setup";
    if (app && name === "setup") name = "today";
    if (name === "session" && !(app && app.active)) name = "today";
    if (name === "session") ensureFocus();

    applyTheme();
    const html = VIEWS[name].render({ app, ui, today: today(), now: Date.now() });
    $view.innerHTML = html;
    ui.message = null;
    if (VIEWS[name].mount) VIEWS[name].mount($view, { app, ui });

    $tabs.hidden = !app || name === "setup";
    for (const a of $tabs.querySelectorAll("a")) {
        const on = a.dataset.tab === name || (name === "session" && a.dataset.tab === "today") || (name === "summary" && a.dataset.tab === "today");
        a.classList.toggle("on", on);
        if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    }
    tick();
}

// ---- Session focus & drafts --------------------------------------------

function remaining(item) {
    return C.nextSetIndex(item) !== null;
}

function ensureFocus() {
    const items = app.active.items || [];
    if (app.active.kind !== "strength") return;
    if (ui.focus == null || !items[ui.focus] || !remaining(items[ui.focus])) {
        const i = items.findIndex(remaining);
        ui.focus = i >= 0 ? i : null;
    }
    const item = ui.focus != null ? items[ui.focus] : null;
    const setIndex = item ? C.nextSetIndex(item) : null;
    const key = item ? app.active.id + ":" + ui.focus + ":" + item.exerciseId + ":" + setIndex : null;
    if (!ui.draft || ui.draft.key !== key) {
        if (!item) { ui.draft = null; return; }
        const planned = item.prescription.sets[setIndex];
        let reps = planned.targetReps;
        if (typeof reps !== "number") reps = item.prescription.baseline ? item.prescription.baseline.reps : 10;
        ui.draft = { key, load: planned.load, reps, ankle: false };
    }
}

// After a set, stay on the exercise unless it's in a superset with a
// partner that still has sets to do.
function nextFocus(fromIndex) {
    const items = app.active.items;
    const item = items[fromIndex];
    if (item.superset) {
        const partner = items.findIndex((x, i) => i !== fromIndex && x.superset === item.superset && remaining(x));
        if (partner >= 0) return { index: partner, partner: true };
    }
    if (remaining(item)) return { index: fromIndex, partner: false };
    const after = items.findIndex((x, i) => i > fromIndex && remaining(x));
    const any = items.findIndex(remaining);
    return { index: after >= 0 ? after : any >= 0 ? any : null, partner: false };
}

// ---- Rest timer --------------------------------------------------------

let audio = null;
function beep() {
    try {
        audio = audio || new (window.AudioContext || window.webkitAudioContext)();
        const o = audio.createOscillator();
        const g = audio.createGain();
        o.frequency.value = 880;
        g.gain.setValueAtTime(0.0001, audio.currentTime);
        g.gain.exponentialRampToValueAtTime(0.25, audio.currentTime + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.35);
        o.connect(g).connect(audio.destination);
        o.start();
        o.stop(audio.currentTime + 0.4);
    } catch (e) { /* no sound available */ }
}

function startRest(seconds, label) {
    ui.rest = { until: Date.now() + seconds * 1000, total: seconds, label, alerted: false };
}

function tick() {
    const r = ui.rest;
    const onSession = route() === "session" && app && app.active;
    if (!r || !onSession) {
        $rest.hidden = true;
    } else {
        const left = (r.until - Date.now()) / 1000;
        const over = left <= 0;
        if (over && !r.alerted) {
            r.alerted = true;
            beep();
            if (navigator.vibrate) navigator.vibrate([180, 80, 180]);
        }
        if (over && left < -90) {
            ui.rest = null;
            $rest.hidden = true;
        } else {
            $rest.hidden = false;
            const pct = Math.min(100, Math.max(0, 100 * (1 - left / r.total)));
            $rest.className = "restbar" + (over ? " over" : "");
            $rest.innerHTML = '<div class="inner" role="timer" aria-label="Rest timer">' +
                '<span class="time">' + (over ? "Go" : mmss(left)) + "</span>" +
                '<span class="meter"><span style="width:' + pct.toFixed(1) + '%"></span></span>' +
                '<span class="muted" style="font-size:.85rem">' + (r.label || "Rest") + "</span>" +
                '<button type="button" class="btn-link" data-action="rest-skip">' + (over ? "Hide" : "Skip") + "</button></div>";
        }
    }
    for (const el of document.querySelectorAll("[data-elapsed]")) {
        el.textContent = mmss((Date.now() - Number(el.dataset.elapsed)) / 1000);
    }
}
setInterval(tick, 500);

// ---- Actions -----------------------------------------------------------

function ladderOf(exerciseId) {
    return loadLadder(getExercise(exerciseId), app.equipment);
}

const actions = {
    // Today / check-in
    checkin(el) {
        ui.checkin = { ...ui.checkin, [el.dataset.field]: Number(el.dataset.value) };
        render();
    },
    start(el) {
        ui.focus = null;
        ui.draft = null;
        ui.swapFor = null;
        ui.warm = {};
        ui.rest = null;
        setApp(C.startSession(app, el.dataset.id, { ...ui.checkin }, today()), { rerender: false });
        requestPersistence();
        go("session");
    },
    skip(el) {
        if (!confirm("Skip this session? The plan moves on to the next one.")) return;
        setApp(C.skipSession(app, el.dataset.id));
    },

    // Session
    focus(el) {
        ui.focus = Number(el.dataset.item);
        ui.swapFor = null;
        ui.scrollToFocus = true;
        render();
    },
    "load-step"(el) {
        const item = app.active.items[ui.focus];
        const ladder = ladderOf(item.exerciseId);
        const e = el.dataset.dir === "up" ? nextLoad(ladder, ui.draft.load) : prevLoad(ladder, ui.draft.load);
        if (e) ui.draft.load = e.value;
        render();
    },
    "reps-step"(el) {
        const item = app.active.items[ui.focus];
        const step = getExercise(item.exerciseId).unit === "seconds" ? 5 : 1;
        ui.draft.reps = Math.max(0, ui.draft.reps + (el.dataset.dir === "up" ? step : -step));
        render();
    },
    "ankle-toggle"(el) {
        ui.draft.ankle = el.checked;
    },
    rir(el) {
        const index = ui.focus;
        const item = app.active.items[index];
        const ex = getExercise(item.exerciseId);
        const flagged = ui.draft.ankle;
        let next = C.logSet(app, index, { reps: ui.draft.reps, rir: Number(el.dataset.value), load: ui.draft.load, ankleFlag: flagged }, today());
        app = next;
        ui.draft = null;
        if (flagged) {
            ui.message = "Noted. " + ex.name + " is paused for two weeks" +
                (next.active.items[index + 1] && next.active.items[index + 1].swappedFrom === item.exerciseId ? " and swapped for something ankle-free." : ".");
            ui.focus = null;
        } else {
            const nf = nextFocus(index);
            ui.scrollToFocus = nf.index !== index;
            ui.focus = nf.index;
            const lastOfAll = nf.index === null;
            if (!lastOfAll) startRest(nf.partner ? 20 : ex.rest, nf.partner ? "Superset: next exercise" : "Rest");
        }
        setApp(next);
    },
    undo(el) {
        ui.focus = Number(el.dataset.item);
        ui.draft = null;
        setApp(C.undoSet(app, ui.focus));
    },
    "end-item"(el) {
        ui.draft = null;
        setApp(C.endItem(app, Number(el.dataset.item)));
    },
    "swap-open"(el) {
        const i = Number(el.dataset.item);
        ui.swapFor = ui.swapFor === i ? null : i;
        render();
    },
    "swap-to"(el) {
        const i = Number(el.dataset.item);
        ui.swapFor = null;
        ui.draft = null;
        const next = C.swapItem(app, i, el.dataset.id);
        ui.focus = next.active.items[i].ended ? i + 1 : i;
        setApp(next);
    },
    warm(el) {
        ui.warm[el.dataset.index] = !ui.warm[el.dataset.index];
        render();
    },
    "rest-skip"() {
        ui.rest = null;
        tick();
    },
    finish() {
        const left = app.active.kind === "strength" ? app.active.items.filter(remaining).length : 0;
        if (left > 0 && !confirm(left + " exercise" + (left > 1 ? "s have" : " has") + " sets left. Finish anyway? Unfinished sets don't count against you.")) return;
        ui.rest = null;
        setApp(C.finishSession(app, today()), { rerender: false });
        go("summary");
    },
    discard() {
        if (!confirm("Throw away this session? Nothing from it will be saved.")) return;
        ui.rest = null;
        setApp(C.discardActive(app), { rerender: false });
        go("today");
    },

    // Summary
    feel(el) {
        setApp(C.setFeel(app, Number(el.dataset.value)));
    },
    "accept-swap"(el) {
        setApp(C.acceptSwap(app, el.dataset.from, el.dataset.to));
    },
    "decline-swap"(el) {
        setApp(C.declineSwap(app, el.dataset.from));
    },

    // Library
    "lib-filter"(el) {
        ui.libFilter = el.dataset.value;
        render();
    },

    // Settings
    restore(el) {
        setApp(C.restore(app, el.dataset.id));
    },
    export() {
        const blob = new Blob([C.exportData(app)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "steady-gains-backup-" + today() + ".json";
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    },
    async reset() {
        if (!confirm("Delete all your training data and start again? Export a backup first if you might want it.")) return;
        if (!confirm("Really delete everything? This can't be undone.")) return;
        await clearApp();
        app = null;
        go("setup");
    }
};

document.addEventListener("click", e => {
    const el = e.target.closest("[data-action]");
    if (!el || !actions[el.dataset.action]) return;
    if (el.tagName === "INPUT" && el.type === "checkbox") return; // handled on change
    e.preventDefault();
    actions[el.dataset.action](el, e);
});

document.addEventListener("change", e => {
    const el = e.target;
    if (el.matches('input[type="checkbox"][data-action]')) actions[el.dataset.action](el, e);
    if (el.matches('input[type="file"][data-import]')) importFile(el);
});

document.addEventListener("submit", e => {
    const form = e.target;
    if (!form.dataset.form) return;
    e.preventDefault();
    const { profile, equipment, errors } = readProfileForm(form);
    if (errors.length) {
        ui.error = errors.join(" ");
        render();
        return;
    }
    ui.error = null;
    if (form.dataset.form === "setup") {
        app = C.createApp(profile, equipment);
        requestPersistence();
        setApp(app, { rerender: false });
        go("today");
    } else {
        setApp(C.updateSettings(app, { profile, equipment }), { rerender: false });
        ui.message = "Saved. Your plan has been updated.";
        render();
        window.scrollTo(0, 0);
    }
});

async function importFile(input) {
    const file = input.files && input.files[0];
    if (!file) return;
    try {
        const data = C.importData(await file.text());
        if (app && !confirm("Replace everything in the app with this backup?")) return;
        setApp(data, { rerender: false });
        ui.message = "Backup restored.";
        go("today");
    } catch (err) {
        ui.error = err.message;
        render();
    }
}

window.addEventListener("hashchange", () => {
    ui.swapFor = null;
    render();
    window.scrollTo(0, 0);
});

async function boot() {
    try {
        const saved = await loadApp();
        app = saved ? C.importData(saved) : null;
    } catch (e) {
        console.error(e);
        app = null;
    }
    render();
    if ("serviceWorker" in navigator && location.protocol !== "file:") {
        navigator.serviceWorker.register("sw.js").catch(() => {});
    }
}

boot();

// Exposed for set-up defaults and debugging in the console.
window.steadyGains = { get app() { return app; }, DEFAULT_EQUIPMENT };
