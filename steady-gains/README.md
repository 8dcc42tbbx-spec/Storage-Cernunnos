# Steady Gains

A home-gym strength app that writes a 26-week weights programme around the kit you
own, logs every set, and adjusts future sessions from what you actually did. It never
assigns an exercise that loads an injured ankle. See [PLAN.md](PLAN.md) for the full
training and app design.

## Status

**M1 (the "brain") is built**: the pure-logic modules with no UI. Screens come next
(PLAN.md §10, M2 onwards).

```
js/
  dates.js       UTC-safe "YYYY-MM-DD" helpers
  equipment.js   Load ladders: dumbbell steps, kettlebells, band combinations
  library.js     ~55 exercises tagged with Ankle Load Rating, pattern, progression
  safety.js      Ankle filter, swaps, ankle-flag suspensions
  engine.js      Progression engine: targets, weight jumps, ceiling ladder, deloads
  programme.js   26-week calendar generator, block templates, validation
test/            node:test suites for all of the above
```

None of these touch the DOM or storage. They're plain ES modules, so the browser UI
and the tests import the same code.

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
