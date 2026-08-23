# Peak Performance: Last Delivery

**Game design plan** for an Enduro-style endurance driving game starring an
Australia Post delivery van, racing the clock on Christmas Eve to deliver the
last parcel before the world closes down for Christmas.

This document is the design plan only — no game code exists yet. It's written
to be handed straight to implementation, following the same conventions as
the other games in this repo (self-contained folder, vanilla-JS canvas
namespace, `prompts/` folder for art generation). See
`prompts/art-prompts.md` for the companion SNES-style art generation prompts.

---

## 1. High concept

It's late afternoon on December 24th. One parcel didn't make it onto the
morning run — and it *has* to be under a tree by tonight. You're an
Australia Post driver, alone on the road, driving from the depot through
five stretches of Australian highway and backroad as the sun goes down,
the weather turns, and the clock runs out.

**Genre:** Endless/endurance pseudo-3D driving game, directly modelled on
*Enduro* (Activision, Atari 2600, 1983).
**Camera:** Fixed chase cam, low behind the van — Enduro's perspective,
exactly.
**Session length:** 6–12 minutes per full run (five legs), designed for
quick pick-up-and-play as well as one long push to the ending.
**Platforms:** Desktop browser (keyboard) and iPad (touch), landscape only.
**Tone:** Warm, a little tense, very Australian Christmas — ute tinsel,
magpies, servo Santas, sausage-sizzle smoke on the horizon, not a
snow-globe Christmas (until the last leg breaks that rule on purpose — see
§4).

---

## 2. What we're keeping from Enduro, and what we're changing

Enduro's entire design is one elegant loop: an unbroken road rendered in
first-person-behind perspective, a fixed number of cars you must pass
before the in-game day ends, and a slowly escalating gauntlet of
visibility conditions (dusk, night, fog, snow, ice) that make the same
passing task progressively harder without changing a single rule. We are
keeping that loop intact and re-skinning its two currencies:

| Enduro | Peak Performance: Last Delivery |
|---|---|
| Pass N cars to end the "day" and advance | Pass N vehicles (or reach a checkpoint) to clear a "leg" and advance |
| Day counter, no clock | **Countdown clock to midnight** — the endurance pressure is time, not a day quota |
| Passing a car has no reward beyond quota progress | Passing traffic, clean overtakes, and hitting checkpoints **add seconds to the clock** — this is the resource-management hook the brief asked for ("race to get milestones to obtain more time") |
| Getting hit by a car costs you position (drops you to the back of the pack) | Getting hit costs you clock time (a scrape costs less, a head-on costs more) and briefly kills your speed |
| Conditions cycle: day → dusk → night → fog day → snow/ice day, on a fixed schedule | Conditions cycle **once, in order, tied to the five legs** — afternoon → dusk → night fog → snow → Christmas Eve blizzard — because this is one evening, not a repeating week |
| No narrative | Christmas Eve delivery framing, one van, one parcel, a house at the end |

We are explicitly *not* copying Enduro's scoring/extra-life system, its
identical repeating single background, or its total absence of music —
we're building a soundscape "modelled on" 2600 audio (see §7), not a
literal TIA emulator.

---

## 3. Visual perspective — non-negotiable

This is the one piece of Enduro's identity that must be reproduced exactly,
so it gets its own section.

**The rule:** camera is fixed low and behind the van, looking straight down
a receding road. There is no camera rotation, no free look, no top-down
minimap taking over the main view. The van sits in the same screen
position (bottom-centre, slightly left-of-centre the way Enduro's sprite
sits) at all times; the *world* moves toward and past the player, not the
other way around.

**How the road reads as 3D on a 2D canvas** — the classic pseudo-3D "segment
road" technique (Enduro itself, later refined in *Out Run*, and reproduced
on SNES in *Top Gear*, *Rock n' Roll Racing*, and *F-Zero*'s Mode 7 track):

- The road is built from horizontal strips ("segments"), each one drawn as
  a trapezoid slice, narrower and higher up the screen the further away it
  represents.
- Each segment carries a world-space **curve** and **hill** value. Summing
  curve values from the horizon down to the camera each frame gives every
  segment's horizontal screen offset — that's what makes the road bend
  left/right and crest hills without ever rotating the camera.
- Roadside sprites (trees, houses, signposts, other vehicles) are placed at
  a world Z position, then scaled and horizontally offset by the same
  per-segment math as the road strip they sit on. A gum tree at the horizon
  is a few pixels tall and near the vanishing point; the same tree sprite
  at the player's Z is drawn many times larger, further out toward the
  segment's edge.
- Depth cue: alternate segment stripes (road surface and grass/gravel
  shoulder) in two shades each, like Enduro's alternating grey road bands —
  this is what sells speed even on straights, and it's a direct visual
  quote of the source material.
- The van itself never moves toward/away in screen space — steering shifts
  it a few pixels left/right within a fixed screen lane, exactly like
  Enduro's car sprite, while curve/hill values on the *road* create all
  apparent cornering.
- Traffic and hazards are always drawn ahead of or overlapping the player
  (Enduro has no oncoming lane — everyone travels the same direction, and
  you close on them from behind). We keep that: there is no head-on
  traffic. It reads as safer and it also halves the sprite work.

This is a well-understood, cheap-to-render-in-Canvas2D technique — no
WebGL required, which matters for the iPad target (see §8).

---

## 4. The endurance structure — five legs, one countdown clock

The whole game is **one continuous countdown from a starting time budget**
(recommend 3:30 shown as a stylised in-game clock reading "8:30 PM →
Midnight", i.e. a fictional in-fiction clock, not literal real-time
minutes — see the HUD note in §6). The clock only ever loses time to
collisions and gains time from milestones; there is no other way to add
time. When it hits zero, the run ends — you didn't make it.

Each of the five legs re-skins Enduro's "pass enough cars to end the day"
loop as a **delivery route leg**, and each leg is where one new hazard or
condition is introduced — mirroring how Enduro strictly staggers dusk,
fog, and snow across separate in-game days rather than throwing everything
at the player at once.

| Leg | Setting | Time of day | Weather | New hazard introduced | Clear condition |
|---|---|---|---|---|---|
| 1 — Suburban Sprint | Outer-suburb streets, Hills Hoists and trailer-tinsel visible in yards | Late afternoon, full sun | Clear | Parked cars pulling out, kids on bikes, a council wheelie-bin day | Pass 15 vehicles |
| 2 — Highway Dash | Multi-lane highway out of town | Dusk, sky going orange/purple | Light rain starts, wet-road glare | Road trains (long, slow, hard to pass safely), spray reducing visibility behind trucks | Pass 20 vehicles **or** reach the highway-exit checkpoint |
| 3 — Country Backroads | Two-lane blacktop through paddocks | Night falls fully, headlights on | Fog patches drift across the road | Kangaroos leaping across at random, unlit farm gates/tractors | Reach 3 checkpoint gates before the fog "closes" the road |
| 4 — Mountain Pass | Climbing road toward an alpine regional town (a deliberate, acknowledged rarity — see the in-fiction wink in §5) | Deep night | Snow flurries, road icing over | Black ice patches (van loses steering grip briefly), snowdrift debris | Pass 18 vehicles while keeping the van on the road |
| 5 — Last Delivery | Final street into the destination town, houses lit with Christmas lights | Midnight approaching | Full blizzard, whiteout gusts that briefly cut visibility to near zero | Everything from legs 1–4 recombined at increased density; visibility is the leg's core challenge, not new obstacle types | Reach the final house before the clock runs out |

**Milestones and time:** within a leg, every checkpoint gate and every
clean overtake (passing without clipping the other vehicle) adds a small
amount of clock time; finishing a leg under the vehicle-count requirement
awards a bonus chunk on top, scaled by how much of the vehicle-clear buffer
is unused (encourages pushing speed, not just surviving). This is the
"milestones give you more time" mechanic the brief asked for, and it's the
resource loop that replaces Enduro's simple pass-counter: **time is both
the game's fail state and its scoring currency.**

**Failure state:** clock hits zero → "The house lights go out" ending
(gentle, not punishing — a Christmas game shouldn't end on a jump-scare
game-over). **Success state:** deliver the parcel on leg 5 → short
hand-off cutscene (see §9) and a summary screen (time remaining, vehicles
passed, cleanest-leg badge).

---

## 5. Narrative framing

You play the driver of a single Australia Post van (design continuity nod:
this can visually reuse the *eDV*-style electric delivery vehicle silhouette
established in this repo's sibling game, `../assets/edv.png`/`../prompts/`,
re-rendered at SNES fidelity — see the art prompts) on the last run of
Christmas Eve. Every line of flavour text and every hint the player gets
comes from one character — **Coach** — who's on the depot radio for the
whole shift.

Ending beat (leg 5 clear): the van pulls into a driveway, porch light on,
a silhouette in the window — parcel delivered, cut to black, "Merry
Christmas" over the results screen, Coach's last line of the run over the
top of it.

### Coach

Modelled directly on Australia Post's real "Peak" campaign coach
character (red Australia Post track jacket, "COACH" across the chest,
white piping down the sleeves, the circular Australia Post logo patch,
hair up in a high bun, whistle on a lanyard, a megaphone she reaches for
when she means it) — she's the depot's Peak-season hype coach, the one
who gets everyone through the Christmas rush, and tonight she's the only
voice this driver's got. This also makes the title a deliberate double
meaning rather than a generic sports phrase: *Peak Performance* is both
"drive well" and a direct nod to Australia Post's own name for the
Christmas delivery crunch, "Peak" — Coach is, in-universe, the actual
Peak coach.

**Where she appears:**
- **Title screen** — foreground illustration, layered over the depot
  background art, megaphone half-raised, addressing the player directly
  before the run starts (see `prompts/art-prompts.md` for the title
  illustration and how it composites with `scene_title.png`).
- **In-game radio popups** — a small portrait box (see HUD note below)
  that slides in with a burst of radio static, holds for a couple of
  seconds while a caption line prints, then slides back out. She never
  takes over the driving view — this is Enduro's fixed-perspective rule
  again, applied to the UI: nothing is allowed to break the chase-cam.
  Trigger points, roughly in order of how often they fire:
  - **Leg start** — one hype line setting up what's changing (traffic
    density, the new hazard, the new condition).
  - **First sight of a leg's new hazard** — a heads-up line, timed to the
    hazard's first spawn.
  - **Milestone/checkpoint clear** — a short, genuinely pumped line,
    reusing her most excited portrait expression.
  - **Low-clock warning** (clock under a threshold, e.g. 30 in-fiction
    "minutes") — one urgent line, at most once per leg so it doesn't nag.
  - **Leg clear** — proud, sets up the next leg.
  - **Run end** — a warm line either way: cheering the delivery home on
    success, or staying supportive rather than mocking on failure.
- She does **not** appear mid-hazard or stacked with the milestone banner
  from §6 — only one HUD interruption on screen at a time, milestone
  banner takes priority if both would fire the same frame.

**Her lines: sport-and-Peak-season puns.** This is Coach's whole voice,
not seasoning on top of it — every line runs fitness/sports-coaching
language through Australia Post's Christmas "Peak" season and parcel
delivery, the same way the title itself does. A few seed lines per
trigger, to set the tone for the full line pool later:

- *Leg start (leg 2, Highway Dash):* "Warm-up's done — this is your
  first real interval, driver. Pace yourself, PB pending."
- *First hazard sighting (leg 3, first kangaroo):* "Hurdles! Well...
  roos. Same event, different track."
- *Milestone/checkpoint clear:* "That's a personal best overtake! Feel
  the burn? That's just Peak season — keep repping."
- *Low-clock warning:* "The clock doesn't stretch for anyone, driver.
  Final kilometres — dig deep."
- *Leg clear:* "Set complete! Rest happens after Christmas, not before
  it. Onto the next leg."
- *Run end, success:* "Gold-medal delivery! That's how you finish a
  Peak season — flying colours, right under the tree."
- *Run end, failure:* "Didn't stick the landing tonight, but that's a
  Peak-season effort right there. Go again?"
- *Leg 4, mountain town (self-aware wink at the snow):* "Yeah, I know
  it doesn't usually snow here either — call it a bonus interval.
  Just get up the hill."

Keep every line short enough to read in the couple of seconds the
portrait's on screen, and keep the pun *legible* even to a player who
isn't parsing it closely — the joke should land as tone (upbeat,
sporty, a bit cheesy) even if the wordplay itself is missed.

The full line pool (every trigger above, including per-leg hazard and
leg-clear variants, plus the run-end success/failure pools) is written
out in `coach-lines.md`.

**Voice, not VO:** lines are printed captions, not recorded speech —
keeps this consistent with §7's "no sampled voice" rule for the
soundscape. Her popup is instead sold through a short radio-static
sting (see §7) and a simple two-frame mouth-open/mouth-closed talk cycle
on the portrait, timed to roughly how long the caption takes to read —
the same trick SNES-era dialogue portraits (RPG text boxes, pit-crew
call-ins in racing games) used to make a static illustration feel like
it's actually talking.

---

## 6. Controls & HUD

**Desktop:** Arrow keys / A-D to steer, Up/W to accelerate, Down/S to
brake, Space to honk (cosmetic — nudges AI traffic slightly, mirrors
Enduro having no horn but gives desktop players a reason to use a fifth
key). Enter to start/confirm, Esc to pause. This matches the existing
repo's `PR.Input` pattern (`js/input.js`): a single polled `actions` object
translated from raw key state each frame, so the same action layer can
later accept gamepad with no game-logic changes, exactly as the existing
game does.

**iPad (touch):** Because the camera is fixed and the only inputs are
steer/accelerate/brake, map controls to two zones rather than a virtual
d-pad (a virtual d-pad is fiddly on glass and the brief specifically wants
this playable, not just ported): left half of the screen = steer by
horizontal touch position relative to a centre deadzone (drag left/right,
van follows proportionally — closer to how players actually expect a
driving touch control to feel than discrete left/right buttons); a single
accelerate pedal (large lower-right touch zone, hold to go, release to
coast, a smaller adjacent brake zone). Auto-detect touch vs. keyboard on
boot the same way the canvas already resizes on `window.resize` in
`index.html`, and swap the HUD's control hints accordingly.

**HUD (SNES-style chrome, drawn in the same corner-anchored style as the
existing games' `hud.js`):**
- Countdown clock, top-centre, styled as a car-dash digital clock reading
  a fictional PM time counting up toward midnight (frames the countdown as
  "race the clock to midnight" rather than a bare numeric timer — more in
  keeping with the Christmas Eve premise).
- Speedometer, bottom-left, analogue dial in SNES arcade-racer style
  (Top Gear/Rock n' Roll Racing influence).
- Vehicles-passed counter for the current leg, top-left, small icon +
  number.
- Leg indicator, top-right (five parcel-shaped pips, filling in as legs
  clear).
- Milestone banner: a brief full-width text/graphic overlay ("HIGHWAY
  CLEAR +0:45") on leg completion, styled after Enduro's own "extra car"
  and day-transition text cards.
- Coach radio popup: a badge-framed portrait box, opposite corner from the
  leg-progress pips so it never collides with them, with a caption line
  beneath it in the same festive-banner styling as the milestone banner.
  Slides in/out over roughly half a second; see §5 for trigger points and
  §7 for its radio-static audio cue. Queued, not stacked — if two triggers
  fire close together, the second waits rather than overlapping the
  first.

---

## 7. Soundscape — modelled on the Atari 2600 / Enduro

Enduro's audio is almost the whole reason the game has a personality:
there is no music, only a continuous, pitch-shifting engine drone (rises
with speed, an octave or so of range), a distinct low thud/skid noise on
collision, and one or two simple square-wave blips for menu/score events.
We reproduce that *character*, not a literal chip register dump:

- **Engine drone:** a continuous oscillator (square or narrow-pulse wave,
  TIA-style) whose frequency tracks van speed in real time — same
  technique Enduro used on the 2600's two-channel TIA, reproducible today
  with the Web Audio API's `OscillatorNode` + a `GainNode` envelope. This
  is the single most important sound in the game; it should never stop
  while driving.
- **Collision thud:** a short low-frequency square/noise burst with a fast
  decay, pitched down further for a head-on than for a scrape, echoing
  Enduro's "you got bumped" sound rather than a modern crash-crunch sample.
- **Passing blip:** a brief rising two-note square-wave chirp on a clean
  overtake — functions as both feedback and, because it's genuinely
  pleasant to hear repeated, a soft reward loop.
- **Milestone/leg-clear chime:** a short 3–4 note arpeggio, still
  square-wave, more melodic than the passing blip so it reads as "bigger"
  — this is as close to "music" as the game gets mid-run, deliberately,
  because Enduro has none either.
- **Weather layer:** a low filtered-noise bed for rain/snow-wind starting
  in leg 2, volume scaling with weather intensity — the one texture
  Enduro's hardware couldn't do that we can now, used sparingly so it
  doesn't drift the game away from its source's austerity.
- **Coach's radio sting:** a short burst of filtered white noise
  (bandpass + a little amplitude wobble, the classic "walkie-talkie
  keying up" texture) plays under every Coach popup from §5, instead of
  any sampled voice. It's the audio equivalent of the two-frame talk
  animation on her portrait — cheap, in-period, and it's doing the job a
  VO line would do without breaking the "no sampled voice" rule below.
- **Title/results screen:** a short, sparse chiptune sting (think Enduro's
  actual silence, split the difference by giving the *menus* a simple
  square-wave Christmas motif — four bars of "Jingle Bells" arranged for
  two square channels + noise-channel percussion — and keeping the driving
  itself as bare as the original).
- **No voice, no sampled instruments, no reverb** — bus everything through
  a light bitcrush/downsample stage if the Web Audio output otherwise
  sounds too clean; Enduro's charm is partly its narrow bandwidth.

Implementation note: this repo's existing `js/audio.js` (Postie Run) already
demonstrates a synthesized-SFX-via-WebAudio approach with no external audio
files — the same pattern (a small `PPLD.Audio` module wrapping
`AudioContext`, oscillators, and gain envelopes) is the right fit here, and
keeps the whole game dependency-free and asset-light for sound.

---

## 8. SNES-style graphics on Enduro's bones

The brief's central visual tension — 1983 Atari perspective, but
1990s-Nintendo production values — resolves cleanly because the *technique*
in §3 (scaled/positioned sprites on a segmented pseudo-3D road) is exactly
how SNES pseudo-3D racers (*F-Zero*'s Mode 7, *Top Gear*, *Rock n' Roll
Racing*) achieved their look on real hardware. We're not fighting the
source material's perspective to get SNES fidelity — the same math produces
both; only the sprite/tile art changes from Atari's four-pixel blocks to
16-bit density.

**Look targets:** *Top Gear* (SNES, 1992) and *Rock n' Roll Racing* for
road/vehicle rendering density and palette confidence; *F-Zero* for
horizon/sky gradient banding; general late-SNES environmental art (rich
2–3 layer parallax, dithered colour transitions, chunky but detailed
16–32px sprites, hard 1px dark outlines) for everything off the road.
Full asset list, palettes, and ready-to-run generation prompts (this
repo's `prompts/gemini-art-prompts.md` convention, adapted for this style)
are in `prompts/art-prompts.md`.

**Asset categories** (detailed per-prompt in the companion file):
1. Player van — Australia Post delivery van, rear-three-quarter view, 5
   steering-lean frames + brake-lit + headlights-on (night) variants.
2. Traffic vehicles — sedans, utes, road trains/trucks, tractors, a rival
   delivery van — all rear-view only (no oncoming lane, per §3).
3. Hazards — kangaroo hop-cycle, black ice decal, snowdrift debris, fallen
   branch, unlit farm gate.
4. Five environment tilesets (one per leg) — road surface + shoulder
   strips, and three parallax layers (far/mid/near) per leg's setting and
   time of day/weather.
5. Weather FX — rain streak, snow particle, fog gradient overlay, headlight
   cone glow, blizzard whiteout gradient.
6. HUD/UI — clock frame, speedometer dial, leg-pip icons, milestone banner,
   title logo, results-screen frame, Christmas-themed border dressing.
7. Cutscene art — title screen (van pulling out of the depot at dusk),
   ending screen (porch delivery), fail screen (a house with the lights
   just going out).
8. Coach — the depot radio host from §5: a foreground title-screen
   illustration, and an in-HUD portrait sheet (neutral, pumped, and alert
   expressions, each with a talking/mouth-closed frame pair for the
   two-frame animation described in §5).

---

## 9. Scope notes for whoever implements this

- **Rendering:** Canvas2D is sufficient (see §3) — no WebGL dependency,
  which keeps iPad Safari support simple and matches this repo's existing
  games.
- **Suggested module layout**, mirroring `js/` in this repo's Postie Run:
  `constants.js` (namespace `PPLD.CONST` — timings, palettes, leg table),
  `input.js` (keyboard + touch, unified `actions` object), `road.js`
  (segment table, curve/hill math, projection), `vehicle.js` (player +
  traffic movement/collision), `weather.js` (per-leg condition state
  machine + particle overlays), `hud.js`, `audio.js`, `menu.js`, `game.js`
  (state machine: menu → leg intro → driving → leg-clear/collision →
  results), `coach.js` (owns the §5 trigger table, a small line queue so
  two popups never overlap, and the talk-frame animation timer for her
  portrait).
- **Christmas Eve cutscene art** (title/ending/fail screens) is the one
  category worth generating as illustrated full-frame art rather than
  tile/sprite sheets — see the last section of `prompts/art-prompts.md`.
- **Not in scope for v1** (flag if asked to build, don't build by default):
  leaderboards/online scores, multiple playable vans, a level editor,
  oncoming traffic, real-world clock/time-of-day sync. All would be
  reasonable v2 ideas but none are needed to deliver the brief.
