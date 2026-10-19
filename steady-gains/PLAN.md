# Steady Gains — App & Training Plan

A home-gym strength app that builds a 26-week (six-month) weights programme around
**your** equipment, logs every set, and adjusts future sessions from what you actually
did. It pushes you forward steadily, never aggressively, and **never assigns an exercise
that loads your injured ankle**.

This document is two things at once:

1. **The training plan** (what a personal trainer would write for you): structure,
   exercise selection, progression rules, the full 26-week calendar.
2. **The app plan** (what an app designer would hand to a developer): screens, data
   model, the progression engine, tech stack, build milestones.

> **Safety first.** This is general fitness guidance, not medical advice. If you've never
> had your ankle assessed by a physio, a single appointment to confirm which positions are
> safe is worth more than anything in this document. The app is built to work fine with
> the most cautious setting and only unlocks more if you tell it to.

---

## Contents

1. [Your setup](#1-your-setup)
2. [Ankle-safety system](#2-ankle-safety-system)
3. [Exercise library](#3-exercise-library)
4. [Programme structure: 26 weeks](#4-programme-structure-26-weeks)
5. [Session templates by block](#5-session-templates-by-block)
6. [The progression engine](#6-the-progression-engine)
7. [App design: screens and flows](#7-app-design-screens-and-flows)
8. [Data model](#8-data-model)
9. [Technical architecture](#9-technical-architecture)
10. [Build roadmap](#10-build-roadmap)
11. [Assumptions and open questions](#11-assumptions-and-open-questions)

---

## 1. Your setup

### Equipment inventory (as the app stores it)

| Item | Loads available | Notes for planning |
|---|---|---|
| Flat bench | n/a | No incline/decline. Used for pressing, prone rows, seated work, hip thrusts. |
| Adjustable dumbbells ×2 | 2.5 → 20 kg each | Assumed 2.5 kg steps: 2.5, 5, 7.5, 10, 12.5, 15, 17.5, 20. Configurable in Settings. |
| Kettlebells | 5, 7, 12 kg | Big jump 7 → 12 kg (+71 %). Engine uses "step loading" to bridge it (§6.4). |
| Resistance bands | Low, Medium, High | Can be combined → 7 usable levels: L, M, L+M, H, L+H, M+H, L+M+H. |
| Gym mat | n/a | Floor work, core, glute bridges, kneeling padding. |
| Exercise bike | n/a | Warm-ups and low-impact conditioning (see ankle note in §2). |

### What the equipment means for programming

- **Load ceiling is real.** 20 kg dumbbells will eventually be light for presses, rows and
  hip thrusts. The engine has a ceiling ladder (§6.5): reps → tempo → pauses → single-arm →
  added band → mechanical drop sets. You won't stall just because the rack ran out.
- **Small jumps are relatively big.** 2.5 → 5 kg is +100 %; 7.5 → 10 kg is +33 %. The
  engine never makes a jump bigger than ~15 % in one go. It extends the rep range or mixes
  loads across sets until the jump is safe.
- **No cable or leg machine**, so quads and hamstrings get less direct loading than a
  commercial gym would allow. Glutes and hamstrings are covered well from the floor and
  bench; quads mostly come from the bike unless you unlock ALR-2 exercises (§2).

---

## 2. Ankle-safety system

Every exercise in the library carries an **Ankle Load Rating (ALR)**. The app only offers
exercises at or below your ceiling. This is a hard filter in the engine, not a suggestion.

| ALR | Meaning | Examples | Default |
|---|---|---|---|
| **0** | Ankle uninvolved: lying, seated with feet resting, side-lying. | Bench press, prone row, seated curl, clamshell, dead bug | ✅ Allowed |
| **1** | Ankle bears light, static, flat-footed load or passive position. | Glute bridge (feet planted), hip thrust, tall-kneeling band work, exercise bike at low resistance | ✅ Allowed, with a check-in at onboarding |
| **2** | Standing, bilateral, loaded. Ankle stable but under body weight plus load. | KB deadlift, goblet box squat, standing DB press | 🔒 Off. Opt-in only (e.g. after physio clearance). |
| **3** | Single-leg, impact, balance, or loaded ankle range of motion. | Lunges, step-ups, jumps, calf raises, KB swings, running | ⛔ Never assigned, can't be unlocked |

### Rules the engine enforces

1. **Hard filter:** `exercise.alr <= user.ankleCeiling` (default ceiling = 1). ALR 3 is
   excluded regardless of the setting.
2. **No straps or bands around the ankle or foot.** Band anchors go on a door, a sturdy
   post or the bench, never looped round the feet. Exercises that need foot anchoring are
   tagged `ankleContact: true` and excluded.
3. **Ankle check-in at the start of every session** (0–5). At ≥ 3 the session is rebuilt
   as ALR-0 only (all ALR-1 items swapped for ALR-0 alternatives, bike skipped).
4. **In-session flag.** Any set can be flagged "felt it in my ankle". That exercise is
   suspended for two weeks and replaced with the nearest ALR-0 alternative from the same
   movement pattern. Two flags on the same exercise means it's permanently removed until
   you restore it in Settings.
5. **Bike guidance:** low resistance, pedal with the midfoot (not the toes) to reduce
   ankle flexion demand. If the onboarding check says cycling bothers your ankle, all bike
   work is replaced with seated band circuits.
6. **Kneeling:** the app reminds you to put a folded mat or towel under the shins and
   ankles so the tops of the feet aren't pressed into the floor.

---

## 3. Exercise library

Starter library: about 45 exercises, every one achievable with your kit. Each is tagged
with pattern, equipment, ALR, and **progression type**, which tells the engine how to make
it harder.

Progression types: **L** = load (add kg) · **R** = reps · **B** = band level ·
**T** = time/hold · **V** = variation (harder version).

### Push

| Exercise | Equipment | ALR | Prog. | Notes |
|---|---|---|---|---|
| DB bench press | Bench, 2×DB | 0 | L | Feet up on the bench end if planting them bothers the ankle. |
| DB floor press | Mat, 2×DB | 0 | L | Shoulder-friendly; good heavy-load option near the ceiling. |
| Single-arm DB bench press | Bench, DB | 0 | L | Ceiling-ladder variation; adds core demand. |
| DB fly (lying) | Bench, 2×DB | 0 | L | |
| Close-grip DB press | Bench, 2×DB | 0 | L | Triceps emphasis. |
| Seated DB shoulder press | Bench, 2×DB | 0 | L | Sit tall; feet resting flat, no bracing through the feet. |
| Seated Arnold press | Bench, 2×DB | 0 | L | |
| Seated DB lateral raise | Bench, 2×DB | 0 | L | |
| Seated KB press (single-arm) | Bench, KB | 0 | L | Uses the 5/7/12 kg bells. |
| Lying DB triceps extension | Bench, 2×DB | 0 | L | |
| Seated overhead DB triceps extension | Bench, DB | 0 | L | |
| Seated band chest press | Bench, band | 0 | B | Band anchored behind at chest height. |
| Push-up from knees, feet raised | Mat | 1 | R→V | Shins on the mat, feet lifted off the floor. |

### Pull

| Exercise | Equipment | ALR | Prog. | Notes |
|---|---|---|---|---|
| Prone (chest-supported) DB row | Bench, 2×DB | 0 | L | Lie face-down on the bench. Replaces the standard one-arm row, whose standing leg loads the ankle. |
| Prone single-arm DB row (pause) | Bench, DB | 0 | L | Ceiling-ladder variation. |
| Prone rear-delt raise | Bench, 2×DB | 0 | L | |
| Prone Y-raise | Bench, 2×DB | 0 | L | Light: 2.5–5 kg. |
| Lying DB pullover | Bench, DB/KB | 0 | L | |
| Seated band lat pulldown | Bench, band (high anchor) | 0 | B | Anchor over a door top. |
| Seated band row | Bench/mat, band (door anchor) | 0 | B | Band anchored to the door, not the feet. |
| Seated band face pull | Bench, band | 0 | B | |
| Seated band pull-apart | Bench, band | 0 | B | Warm-up staple. |
| Seated DB curl | Bench, 2×DB | 0 | L | |
| Seated hammer curl | Bench, 2×DB | 0 | L | |
| Seated concentration curl | Bench, DB | 0 | L | |
| Tall-kneeling band pulldown | Mat, band | 1 | B | Alternative if seated anchor is awkward. |

### Hips & legs (ankle-safe)

| Exercise | Equipment | ALR | Prog. | Notes |
|---|---|---|---|---|
| Glute bridge | Mat (+ KB/DB on hips) | 1 | L | Feet flat; push through the heels only as far as comfortable. |
| DB hip thrust | Bench, DB | 1 | L | Upper back on the bench, DB across the hips. Main lower-body lift. |
| Single-leg glute bridge | Mat | 1 | R→L | Uses the good-side foot or both alternately; set per side. |
| Banded glute bridge (abduction) | Mat, band above knees | 1 | B | |
| Banded clamshell | Mat, band above knees | 0 | B | |
| Side-lying hip abduction | Mat (+ band above knees) | 0 | R→B | |
| Banded fire hydrant | Mat, band above knees | 0 | B | Quadruped; tops of feet relaxed on the mat. |
| Prone straight-leg hip extension | Bench | 0 | R→T | Lie on the bench, hips at the end, lift straight legs. A "reverse hyper" substitute. |
| Lying straight-leg raise (quad) | Mat, band above knee | 0 | R→B | Light quad work with no ankle loading. |
| Seated band adductor squeeze | Bench, folded band/cushion | 0 | T | Isometric. |

**Opt-in ALR-2 (locked by default):** KB deadlift, DB Romanian deadlift, KB goblet box squat
(sit back to the bench), standing DB shoulder press. If unlocked, these go into Blocks 2–4
as a second lower-body lift. They give the best quad and hamstring loading available
with your kit.

### Core

| Exercise | Equipment | ALR | Prog. | Notes |
|---|---|---|---|---|
| Dead bug | Mat | 0 | R→V | Progress to holding a 2.5–5 kg DB. |
| Forearm plank from knees | Mat | 0 | T→V | Progress to full plank only if toes-on-floor is comfortable (ALR 1). |
| Side plank from knees | Mat | 0 | T | |
| Hollow body hold | Mat | 0 | T | |
| Seated Pallof press | Bench, band | 0 | B | Anti-rotation. |
| Lying KB pullover crunch | Mat, KB | 0 | L | |
| Lying leg raise | Mat | 0 | R | Bent-knee first. |
| Bird dog | Mat | 1 | R→T | Quadruped; pad under ankles. |

### Conditioning

| Exercise | ALR | Notes |
|---|---|---|
| Bike: easy steady ride (Zone 2) | 1 | Conversational pace, RPE 4–5. |
| Bike: intervals | 1 | 30 s brisk / 90 s easy. Introduced from Block 3. |
| Seated band circuit | 0 | Swap-in if the bike is off-limits: pull-apart, press, row, Pallof in rotation. |

---

## 4. Programme structure: 26 weeks

### Weekly rhythm (default; adjustable)

- **3 strength sessions** (about 45 min): Mon / Wed / Fri, rotating A → B → C.
- **1–2 optional bike sessions**: Tue / Sat.
- **At least one full rest day** between strength days is preferred but not required.

Every strength session follows the same shape:

```
Ankle check-in (5 sec) → Warm-up (6–8 min) → 5–6 exercises → Cool-down (3 min) → Summary
```

Warm-up: 5 min easy bike (or seated band circuit) + 2 × 15 band pull-aparts +
1 light "ramp" set (about 50 % load) of the first lift.

### The four blocks

The plan is **periodised** into a calibration week plus four 6-week blocks. Each block is
5 build weeks followed by 1 deload week. The final week is a retest.

| Weeks | Phase | Sets × reps | Effort target (RIR*) | Focus |
|---|---|---|---|---|
| 1 | **Calibration** | 2 × 10–12 | find weights at RIR 3 | Learn the movements, find starting weights, establish the baseline. |
| 2–6 | **Block 1: Foundation** | 3 × 12–15 | RIR 3 → 2 | Technique, work capacity, tendon/joint prep. |
| 7 | Deload | 2 × 12 | RIR 4 | Recover. Same exercises, lighter. |
| 8–12 | **Block 2: Build** | 3 × 10–12 | RIR 2 | Hypertrophy. Exercise variations rotated. |
| 13 | Deload | 2 × 10 | RIR 4 | |
| 14–18 | **Block 3: Strength-hypertrophy** | 4 × 8–10 (main) / 3 × 10–12 (accessory) | RIR 2 → 1 | Heavier main lifts; bike intervals added. |
| 19 | Deload | 2 × 8 | RIR 4 | |
| 20–25 | **Block 4: Consolidate** | 3–4 × 6–10 + tempo/pause work | RIR 1–2 | Push the 20 kg ceiling with harder variations; supersets for density. |
| 26 | **Retest + deload** | Rep-max tests at set loads | RIR 0–1 (tests only) | Measure six-month progress; plan what comes next. |

\* **RIR = reps in reserve**: how many more clean reps you could have done. RIR 2 means
"I had two more in me". The app asks you this after each set with four buttons:
**0 · 1 · 2 · 3+**. That is the main signal the progression engine uses.

### Why "push, but not aggressive"

- Effort stays at RIR 1–3 all programme. You never grind to failure except on the
  final retest.
- A weight increase normally needs **two consecutive sessions** hitting the top of the
  range (one session is enough only if it was clearly easy, RIR 3+).
- Weekly training volume grows at most about 10 % between blocks.
- A planned deload every sixth week, plus automatic "lighter day" sessions when your
  check-in says you're tired or sore.

---

## 5. Session templates by block

Each block rotates exercise **variations** (same movement pattern, slightly different
stimulus). This stops boredom and plateaus. Loads carry over via each exercise's
estimated one-rep max (e1RM; §6.6) when a variation changes.

### Block 1: Foundation (weeks 2–6)

**Session A: Push + Glutes**

| # | Exercise | Sets × reps |
|---|---|---|
| 1 | DB bench press | 3 × 12–15 |
| 2 | DB hip thrust | 3 × 12–15 |
| 3 | Seated DB shoulder press | 3 × 12–15 |
| 4 | Lying DB triceps extension | 2 × 12–15 |
| 5 | Banded clamshell | 2 × 15–20 /side |
| 6 | Dead bug | 2 × 8 /side |

**Session B: Pull + Posterior**

| # | Exercise | Sets × reps |
|---|---|---|
| 1 | Prone DB row | 3 × 12–15 |
| 2 | Glute bridge (KB on hips) | 3 × 15–20 |
| 3 | Seated band lat pulldown | 3 × 12–15 |
| 4 | Seated DB curl | 2 × 12–15 |
| 5 | Prone Y-raise | 2 × 12–15 |
| 6 | Forearm plank from knees | 3 × 20–30 s |

**Session C: Full body**

| # | Exercise | Sets × reps |
|---|---|---|
| 1 | DB floor press | 3 × 12–15 |
| 2 | Lying DB pullover | 3 × 12–15 |
| 3 | Single-leg glute bridge | 2 × 10–12 /side |
| 4 | Seated DB lateral raise | 2 × 12–15 |
| 5 | Seated band face pull | 2 × 15–20 |
| 6 | Seated Pallof press | 2 × 10 /side |

**Bike:** 2 × 20 min Zone 2 per week.

### Block 2: Build (weeks 8–12)

| Session | Changes from Block 1 |
|---|---|
| A | Triceps ext. → **close-grip DB press**; shoulder press → **seated Arnold press**; clamshell → **banded glute bridge**; dead bug holds a 2.5 kg DB. |
| B | Prone row → **prone single-arm row** (1 s pause at top); lat pulldown band level carries over; curl → **hammer curl**; plank → **side plank from knees**. |
| C | Floor press → **DB bench press (tempo 3-1-1)**; pullover → **KB pullover**; add **prone straight-leg hip extension** 2 × 12–15. |

Rep scheme 3 × 10–12 throughout. **Bike:** 2 × 25 min Zone 2.

### Block 3: Strength-hypertrophy (weeks 14–18)

- **Main lifts** (first two in each session) go to **4 × 8–10**: DB bench press,
  DB hip thrust, prone DB row, DB floor press, glute bridge, lying pullover.
- **Accessories** at 3 × 10–12; rotate curl → concentration curl, lateral raise →
  seated lateral raise with 2 s hold at top, Y-raise → rear-delt raise.
- **Core** progresses by variation: hollow body hold replaces plank; dead bug with a 5 kg DB.
- **Bike:** 1 × 25 min Zone 2 + 1 × intervals (6 × 30 s brisk / 90 s easy).

### Block 4: Consolidate (weeks 20–25)

By now several lifts will be at or near 20 kg. Block 4 uses the ceiling ladder on purpose:

- **Bench:** single-arm DB bench press 4 × 6–10, or 20 kg pair with a 3 s lowering.
- **Hip thrust:** 20 kg DB + **band above the knees** (abduction), or single-leg hip
  thrust holding the DB.
- **Rows:** prone row with 2 s pause, then a **mechanical drop set** (row → rear-delt
  raise with the same weight) on the last set.
- **Supersets** (antagonist pairs, e.g. press + row) to keep sessions under 45 min with
  more total work.
- **Bike:** 1 × 30 min Zone 2 + 1 × intervals (8 × 30 s / 90 s).

### Deload weeks (7, 13, 19) and retest (26)

- Deload: same exercises, **sets cut by about 40 %**, same weight, stop at RIR 4.
- Week 26: one **rep-max test** per main lift at a fixed load (e.g. "as many clean reps as
  possible at 15 kg"), compared with the same test in calibration week. This gives you a
  clear before/after number without testing a risky true 1RM.

---

## 6. The progression engine

This is the core of the app. After each session it reads the logged sets and writes the
targets for the **next time that exercise appears**.

### 6.1 What gets logged per set

```
{ exerciseId, setIndex, load, reps, rir (0|1|2|3), ankleFlag (bool), completed (bool) }
```

Logging a set takes two taps: confirm or adjust reps (pre-filled with the target), then
tap RIR. Weight is pre-filled from the plan.

### 6.2 Per-exercise state

```
{ load, repRange: [lo, hi], sets, successStreak, failStreak,
  stepPlan (for split loads, §6.4), ceilingStage (§6.5), e1rm, lastPerformed }
```

### 6.3 Core rule: gentle double progression

Double progression means you first earn more **reps** at a weight, then more **weight**.

```
after session for exercise E:
  top   = every working set reached hi reps AND min(RIR) >= 1
  easy  = top AND every set RIR >= 3
  miss  = any set below lo reps OR first set RIR == 0

  if easy:            increaseLoad(E)                    # clearly too light
  elif top:
      E.successStreak += 1
      if E.successStreak >= 2: increaseLoad(E)           # earned twice → step up
  elif miss:
      E.failStreak += 1
      if E.failStreak >= 2: decreaseLoad(E)              # two misses → step back
  else:
      nudgeReps(E)                                       # in range → add a rep
```

**`nudgeReps`**, the "push but not aggressive" knob: next session's per-set targets are
last session's reps **+1 on at most two sets**, capped at `hi`.
Example (range 10–12): last time `12, 11, 10` → next targets `12, 12, 11`.

**`increaseLoad`**: move to the next available load (§6.4). Reset reps to `lo`, reset streaks.

**`decreaseLoad`**: drop one load step (about 10 %), target mid-range reps, reset
streaks, and record a "stall" against the exercise. Three stalls within a block means the
exercise is rotated to a variation at the next block boundary.

A user setting, **Pace**, changes the thresholds:

| Pace | Sessions at top before increasing | Max rep nudge |
|---|---|---|
| Gentle (default) | 2 | +1 on 2 sets |
| Steady | 1 (or 2 if RIR = 1) | +1 on all sets |
| Easy-going | 3 | +1 on 1 set |

### 6.4 Handling big weight jumps

The next load is the smallest available load above the current one, based on your
equipment list. If that jump is **more than 15 %** of the current load, the engine
doesn't jump straight to it. It uses one of two bridges:

**A. Rep extension** (when the jump is 15–35 %): raise `hi` by 2 (once). Only after
you reach the extended top twice does the weight go up, with targets reset to `lo`.

**B. Step loading** (when the jump is over 35 %, e.g. KB 7 → 12 kg, DB 2.5 → 5 kg): move
one set at a time to the new weight.

```
3 × 7 kg → [12, 7, 7] → [12, 12, 7] → [12, 12, 12]
```

Each step needs one "top" session at the new weight before the next set moves over. If the
new weight is too heavy (a miss), the set drops back to the lower load for that session.

### 6.5 Ceiling ladder (when there is no heavier weight)

When an exercise is at the maximum load and hits the top of the range twice, it climbs the
ladder instead of adding weight:

| Stage | Change | Example (DB bench at 20 kg) |
|---|---|---|
| 1 | Extend rep range +3 | 3 × 12–15 instead of 10–12 |
| 2 | Slow eccentric (3 s lowering) | Back to 10–12 at 3-0-1 tempo |
| 3 | Pause (1–2 s at the hardest point) | 3-1-1 tempo |
| 4 | Unilateral swap | Single-arm DB bench press |
| 5 | Accommodating resistance | Add a band (L → M → H) where the anchor allows |
| 6 | Intensity technique | Mechanical drop set or rest-pause on the last set only |

Each stage resets reps to `lo`. Stages are tracked so progress charts stay meaningful.

### 6.6 Swapping variations and starting weights

- **e1RM (Epley):** `e1rm = load × (1 + reps / 30)`, using RIR-adjusted reps
  (`reps + rir`). Recalculated every session; drives charts and new-exercise suggestions.
- **New exercise or variation:** starting load = the largest available load where
  predicted reps at RIR 2 land inside the new range, scaled by a per-variation factor
  (e.g. floor press ≈ 1.0× bench, Arnold press ≈ 0.85× seated press, single-arm row ≈ 1.0×
  prone row).
- **Calibration week:** each exercise starts light (the app's suggested default for a new
  lifter, or your entry). After set 1: RIR 3+ at top reps → +2 steps; RIR 2–3 → +1 step;
  RIR 0–1 → −1 step. Set 2 confirms. The final load becomes the Block 1 starting weight.

### 6.7 Session-level adjustments

| Trigger | Response |
|---|---|
| Readiness check-in (sleep, energy, soreness; 1–5 each) averages ≤ 2 | **Lighter day**: −1 set per exercise, RIR floor 3, no progressions recorded from it. |
| Ankle check-in ≥ 3 | Session rebuilt ALR-0 only; bike swapped for seated band circuit. |
| Ankle flag on a set | Exercise suspended for 2 weeks and swapped (§2). |
| 8–14 days since last session | Loads −10 % for the first session back. |
| 15+ days since last session | Loads −20 %, a mini-deload week inserted, then the block resumes. |
| Session cut short | Uncompleted sets aren't counted as misses. |
| Weekly volume load up more than 10 % on the previous build week | Hold any further load increases that week. |

### 6.8 Test plan for the engine

The engine is a pure function `(state, sessionLog, settings) → newState`, so it can be
unit-tested with scenario tables, e.g.:

- 2 × top sessions → load increases exactly one step.
- One top session with RIR 3+ → increases immediately.
- 7.5 → 10 kg (+33 %) → rep extension, not a jump.
- KB 7 → 12 kg → step loading sequence `[12,7,7] → [12,12,7] → [12,12,12]`.
- 20 kg + top twice → ceiling stage 1, not a phantom 22.5 kg.
- ALR filter never returns an ALR-3 exercise for any settings combination.
- Ankle flag twice → exercise permanently excluded.

---

## 7. App design: screens and flows

### 7.1 Onboarding (about 5 min, once)

1. **About you:** age range, training experience (new / some / regular), main goal
   (strength / muscle / general fitness). This sets the defaults only; the plan structure is
   the same.
2. **Equipment:** pre-filled with your list. Confirm dumbbell step size (2.5 kg default,
   2 kg and 1.25 kg options) and band labels.
3. **Ankle profile:** three yes/no questions:
   - "Can you sit with feet flat on the floor and push gently through them without discomfort?" → controls ALR 1 lower-body work.
   - "Is pedalling an exercise bike comfortable?" → bike on/off.
   - "Has a physio cleared standing, two-footed lifting?" → only "yes" unlocks ALR 2.
4. **Schedule:** training days (default Mon/Wed/Fri + optional bike Tue/Sat), session
   length (35 / 45 / 60 min, which changes accessory count).
5. **Pace:** Gentle (default) / Steady / Easy-going.
6. **Start date:** generates the 26-week calendar; week 1 = calibration.

### 7.2 Main screens

```
┌──────────────────────────┐  ┌──────────────────────────┐  ┌──────────────────────────┐
│ TODAY        Wk 4 · B1   │  │ DB BENCH PRESS  Set 2/3  │  │ SESSION DONE ✓           │
│                          │  │                          │  │                          │
│ Session B · Pull         │  │   12.5 kg  ×  target 13  │  │ 42 min · 17 sets         │
│ ~45 min · 6 exercises    │  │                          │  │                          │
│                          │  │   Reps:  [−]  13  [+]    │  │ ▲ Prone row → 15 kg next │
│ Prone DB row   3×12–15   │  │                          │  │ ▲ Curl: +1 rep target    │
│ Glute bridge   3×15–20   │  │   Reps left in tank?     │  │ = Hip thrust: hold       │
│ Band pulldown  3×12–15   │  │   [0] [1] [2] [3+]       │  │                          │
│ ...                      │  │                          │  │ New best: Row e1RM 19.8  │
│                          │  │   ☐ Felt it in my ankle  │  │                          │
│ [ Start session ]        │  │                          │  │ How did it feel overall? │
│                          │  │   Rest  01:24  ●●●○      │  │ 😫  😐  🙂  💪           │
│ Today · Plan · Progress  │  │   [ Swap exercise ]      │  │ [ Done ]                 │
└──────────────────────────┘  └──────────────────────────┘  └──────────────────────────┘
```

| Screen | Purpose | Key elements |
|---|---|---|
| **Today** | What to do now | Session card, readiness + ankle check-in, start button, "move to tomorrow" |
| **Active set** | Fast logging | Pre-filled load/reps, RIR buttons, ankle flag, auto rest timer (60–120 s by exercise type), how-to sheet, swap button (only ALR-safe alternatives shown) |
| **Session summary** | Close the loop | What changes next time and why ("You hit 15,15,15 twice → +2.5 kg"), PRs, overall feel |
| **Plan** | The 26 weeks | Calendar of blocks/weeks, deloads highlighted, tap a week to preview sessions |
| **Progress** | Motivation | e1RM line per main lift, weekly volume bars, consistency streak, calibration vs. now table |
| **Library** | Exercise reference | Filter by pattern/equipment, ALR badge on each, written cues + simple diagrams |
| **Settings** | Control | Equipment, step size, ankle profile, pace, schedule, export/import data, reset |

### 7.3 Design principles

- **One-handed, two-tap logging.** Big buttons; you're holding a dumbbell.
- **Explain every change.** Each target shown has a "why" line, so the progression feels
  coached, not arbitrary.
- **Encouraging, not nagging.** Missed sessions reschedule quietly; no streak-shaming.
- **Dark mode by default** with high-contrast numbers readable from the floor.
- **Offline-first.** Works with no signal in a garage.

---

## 8. Data model

All data lives on-device (IndexedDB), exportable as one JSON file.

```jsonc
// Profile
{ "id": "me", "experience": "some", "goal": "strength",
  "ankle": { "ceiling": 1, "bikeOk": true, "flatFootOk": true },
  "pace": "gentle", "sessionMinutes": 45,
  "schedule": { "strength": ["mon","wed","fri"], "bike": ["tue","sat"] },
  "startDate": "2026-10-26" }

// Equipment
{ "dumbbell": { "min": 2.5, "max": 20, "step": 2.5, "pairs": true },
  "kettlebell": [5, 7, 12],
  "band": ["L","M","H"],              // combos derived: L, M, L+M, H, L+H, M+H, L+M+H
  "bench": "flat", "mat": true, "bike": true }

// Exercise (library, static)
{ "id": "db_bench", "name": "DB bench press", "pattern": "horizontal_push",
  "equipment": ["bench","dumbbell_pair"], "alr": 0, "ankleContact": false,
  "progression": "load", "defaultRest": 90, "loadFactor": { "ref": "db_bench", "x": 1.0 },
  "alternatives": ["db_floor_press","sa_db_bench","band_chest_press"],
  "cues": ["Shoulder blades pinched", "Lower to mid-chest", "Feet on bench if needed"] }

// Programme (generated once, regenerated on settings change)
{ "weeks": [ { "n": 1, "phase": "calibration", "sessions": [ "A","B","C" ] }, ... ],
  "templates": { "B1-A": [ { "exerciseId": "db_bench", "sets": 3, "reps": [12,15], "rir": 2 }, ... ] } }

// Per-exercise progression state
{ "exerciseId": "db_bench", "load": 12.5, "repRange": [12,15], "sets": 3,
  "targets": [15,14,13], "successStreak": 1, "failStreak": 0,
  "stepPlan": null, "ceilingStage": 0, "e1rm": 18.3, "stalls": 0,
  "suspendedUntil": null, "ankleFlags": 0 }

// Session log
{ "id": "2026-11-04-B", "date": "2026-11-04", "template": "B1-B",
  "readiness": { "sleep": 4, "energy": 3, "soreness": 2, "ankle": 0 },
  "sets": [ { "exerciseId": "prone_row", "i": 0, "load": 12.5, "reps": 15, "rir": 2, "ankleFlag": false } ],
  "feel": 3, "durationMin": 43 }
```

---

## 9. Technical architecture

Fits the conventions already in this repo (plain HTML/CSS/JS, no build step, served from
GitHub Pages):

| Concern | Choice | Why |
|---|---|---|
| Platform | **Progressive Web App**: installable on phone home screen | One codebase, offline, no app-store friction |
| UI | Vanilla JS ES modules + CSS; small hand-rolled router | Matches repo style; tiny and fast |
| Storage | IndexedDB (tiny wrapper) + JSON export/import | On-device, private, survives restarts |
| Offline | Service worker caching the app shell | Works in the garage |
| Charts | Inline SVG (hand-drawn) | No dependency |
| Tests | Node's built-in `node:test` for the engine | No install, runs in CI |
| Hosting | Existing GitHub Pages workflow pattern | Already set up per-branch in this repo |

### Proposed file layout

```
steady-gains/
  index.html
  manifest.webmanifest
  sw.js
  css/app.css
  js/
    main.js            # boot, router
    db.js              # IndexedDB wrapper, export/import
    equipment.js       # available-load maths (DB steps, KB list, band combos)
    library.js         # exercise data (ALR, patterns, alternatives)
    programme.js       # 26-week generator, block templates
    engine.js          # progression engine: pure functions (§6)
    safety.js          # ALR filter, ankle flag/suspension logic
    views/             # today.js, session.js, summary.js, plan.js, progress.js, library.js, settings.js
  test/
    engine.test.js
    safety.test.js
    equipment.test.js
  PLAN.md              # this document
```

**Separation that matters:** `engine.js`, `safety.js`, `equipment.js` and `programme.js` have
no DOM access. They're pure, deterministic and fully unit-testable. The views only read
state and dispatch logged sets.

---

## 10. Build roadmap

| Milestone | Scope | Done when |
|---|---|---|
| **M1: Brain** | `equipment.js`, `library.js`, `safety.js`, `engine.js`, `programme.js` + tests | All §6.8 scenarios pass; generator outputs a valid 26-week plan with zero ALR violations |
| **M2: Log a session** | Onboarding, Today, Active set, Summary, IndexedDB | A full session can be logged on a phone and next-session targets update |
| **M3: See the plan** | Plan calendar, Library with cues, swap exercise | Any week is previewable; swaps only offer ALR-safe alternatives |
| **M4: Progress** | Charts, calibration vs. now, export/import | Six-month data round-trips through export/import |
| **M5: Polish** | PWA install, offline, rest-timer sound/vibration, dark mode, accessibility pass | Installs to home screen; works in airplane mode |

M1–M2 are the minimum to start training with the app; M3–M5 can land during Block 1.

---

## 11. Assumptions and open questions

Assumed for now (all changeable in Settings):

- **3 strength days a week, about 45 minutes**, plus optional bike.
- **Some prior lifting experience**, with starting weights found in calibration week.
- **Dumbbells adjust in 2.5 kg steps.**
- **Ankle:** lying, seated and flat-footed bridging are fine; standing loaded work isn't
  (ceiling ALR 1). The bike is OK at low resistance.

Answers that would sharpen the plan:

1. Which ankle (left/right), and which positions or movements bother it? E.g. pointing
   the toes, flexing the foot up, standing for long periods, or kneeling.
2. Is standing (two feet, no load) comfortable for 5+ minutes? If yes, ALR 2 could be
   worth discussing with a physio, since it unlocks much better leg training.
3. Main goal: getting stronger, building muscle, or general fitness/health?
4. How many days a week, and how long per session, can you realistically commit to?
5. Any other injuries or niggles (shoulders, lower back, knees)?
6. What is the exact dumbbell step size? Some sets go 2 kg, some 2.5 kg, some have 1.25 kg plates.
