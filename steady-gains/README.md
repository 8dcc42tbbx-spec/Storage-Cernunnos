# Steady Gains

A home-gym strength app that writes a 26-week weights programme around the kit you
own, logs every set, and adjusts future sessions from what you actually did. It never
assigns an exercise that loads an injured ankle. See [PLAN.md](PLAN.md) for the full
training and app design.

## Status

**Usable.** Milestones M1–M5 from PLAN.md §10 are built: the training logic, every
screen, on-device storage, offline support and home-screen install.

- **Set-up**: ankle level, schedule, experience, pace, equipment
- **Today**: what's next, with weights and reps, plus a 10-second check-in (sleep,
  energy, soreness, ankle)
- **Session**: pre-filled weight and reps. Tap how many reps you had left to log a set.
  Also: rest timer with beep/vibrate, swap exercise, "felt it in my ankle", undo,
  supersets
- **Summary**: what changes next time and why, new bests, harder-variation offers
- **Plan**: all 26 weeks, with what's done and skipped
- **Progress**: strength trend per main lift, weekly volume, week 1 vs now
- **Exercises**: the full library, with each one's ankle rating and why any are
  excluded for you
- **Settings**: change anything (the calendar rebuilds and keeps your logs),
  restore ankle-paused exercises, export/import a backup, reset

```
index.html, sw.js, manifest.webmanifest, css/, icons/
js/
  main.js        Controller: routing, taps -> coach calls, rest timer, saving
  db.js          IndexedDB storage (localStorage fallback)
  coach.js       Runs sessions: check-in, prescriptions, logging, swaps, summaries
  dates.js       UTC-safe "YYYY-MM-DD" helpers
  equipment.js   Load ladders: dumbbell steps, kettlebells, band combinations
  library.js     55 exercises tagged with Ankle Load Rating, pattern, progression
  safety.js      Ankle filter, swaps, ankle-flag suspensions
  engine.js      Progression engine: targets, weight jumps, ceiling ladder, deloads
  programme.js   26-week calendar generator, block templates, validation
  ui/            One file per screen, plus shared helpers
test/            node:test suites for everything below the UI
```

Everything except `main.js`, `db.js` and `ui/` is pure logic with no DOM or storage,
so the tests run the same code the app does.

## Use it

**Live:** https://8dcc42tbbx-spec.github.io/Storage-Cernunnos/steady-gains/

Open it on your phone, then "Add to Home Screen" (Safari) or "Install app"
(Chrome). It's published by `.github/workflows/pages.yml` on every push to this
branch, alongside Trivia Trixie at the site root.

To run it locally instead, serve the `steady-gains/` folder from any web server (it's
a static site with no build step):

```
cd steady-gains
python3 -m http.server 8000
```

After the first load it works offline. Your data stays on the device: export a
backup from Settings now and then.

## Run the tests

Needs Node 18+ and nothing else (no dependencies to install):

```
cd steady-gains
npm test
```

## How the pieces fit

```js
import { DEFAULT_EQUIPMENT, loadLadder } from "./js/equipment.js";
import { getExercise } from "./js/library.js";
import { generateProgramme } from "./js/programme.js";
import { createState, prescribe, updateAfterSession } from "./js/engine.js";

const profile = {
    ankle: { ceiling: 1, bikeOk: true, flatFootOk: true },
    schedule: { strength: ["mon", "wed", "fri"], bike: ["tue", "sat"] },
    sessionMinutes: 45,
    startDate: "2026-10-26"
};
const plan = generateProgramme(profile, DEFAULT_EQUIPMENT);

const week = plan.weeks[1];
const item = week.sessions[0].items[0];            // e.g. DB bench press, 3 x 12-15
const exercise = getExercise(item.exerciseId);
const ladder = loadLadder(exercise, DEFAULT_EQUIPMENT);

let state = createState(exercise, item, ladder);
const today = prescribe(state, ladder, week.mods); // loads + rep targets per set

// ...after the session, with the logged sets:
const { state: next, change } = updateAfterSession(state, loggedSets, {
    exercise, ladder, equipment: DEFAULT_EQUIPMENT, pace: "gentle",
    today: "2026-11-02", rir: week.mods.rir
});
// change.reason -> "Top of the range: do it once more to earn the next step"
```
