# Gemini art prompts — TRAPPED! Odysseus vs the Cyclops

The game runs today on procedural (code-drawn) pixel art, so nothing here is
required to play. Generate any or all of these with Gemini to upgrade the
look; drop the result in `assets/` under the exact filename listed and the
game will automatically use it instead of the built-in drawing (see
`js/images.js`). Nothing needs to be wired up — it's a drop-in swap.

## Before you generate anything: read this

**Style anchor** — prepend this block to every prompt below so all the
generated pieces feel like one game:

> Retro 8-bit / 16-bit video game pixel art, in the style of a late-1980s to
> early-1990s console adventure game (think Zelda II, Golden Axe, King's
> Quest, Willow). Hard-edged pixels, no anti-aliasing, no blur, no
> gradients — flat shaded color blocks only, like a hand-placed sprite.
> Limited, warm, torch-lit palette: cave browns (#241812, #4a3728, #7a5c3e,
> #a4805a), parchment cream (#f2e2b6), ink brown-black (#1a1008), gold
> (#ffcc33), fire orange (#ff7733), blood red (#c22a2a), moss green
> (#3fa35c), indigo night sky (#141033), pale moonlight (#f2ecd0), teal sea
> (#1f6f8b), and mossy monster-skin olive (#5c6b34). No modern UI, no text
> unless specified, no photorealism.

**Resize after you download.** Gemini will hand back a much larger image
than the game needs. Downscale it to the *exact* pixel dimensions listed
per asset using **nearest-neighbor / point resampling** (not bicubic —
that reintroduces the blur we just avoided). In most editors this is a
"pixelate" or "nearest neighbor" resize option. That step is what makes it
read as 8-bit instead of a shrunk photo.

**No real likenesses.** These prompts describe symbolic/mythic imagery
(a helmet, a masked figure, an owl-on-a-shield) rather than portraits of
the real film's cast — keep it that way when you generate, both to match
the game's style and to avoid depicting real people.

Save everything into `assets/` (create the folder if it doesn't exist).

---

## 1. Title screen — `assets/title.png`
**Size:** 320×240 (4:3)

> A moonlit rocky sea cave mouth seen from inside looking out, cave walls
> framing the shot on both sides, a calm dark teal sea and a low pale moon
> visible through the opening. A colossal one-eyed cyclops silhouette looms
> just outside the cave mouth in the far background, mostly in black
> silhouette with one glowing yellow eye. Scattered pixel stars in the sky.
> No text, no characters in the foreground — this is a background plate for
> a title logo to be overlaid separately.

## 2. Cave backdrop — `assets/cave_backdrop.png`
**Size:** 320×240 (4:3)

> Interior of a torch-lit sea cave, used repeatedly as a dialogue-scene
> background. Rough stone walls and stalactites along the top edge, two
> flickering torches mounted on the walls left and right throwing warm
> orange light, a glimpse of starry night sky and a sliver of moon through
> a distant opening at upper right. Empty of characters — this is a
> background plate.

## 3–7. Cyclops portraits (five moods)
**Size:** 280×220 each, transparent or cave-dark background

Use this shared description, swapping only the `{MOOD}` line:

> A single friendly-menacing cyclops character portrait, head and shoulders,
> facing forward. Mossy olive-green craggy skin, one huge round yellow eye
> centered on the forehead with a black pupil, a wide mouth, small blunt
> tusks. Cartoonish and expressive rather than gory or realistic — this is
> a comic party-game villain, not a horror creature.

- `assets/cyclops_idle.png` — {MOOD}: neutral, eyebrow relaxed, mouth in a flat curious line, waiting for an answer.
- `assets/cyclops_angry.png` — {MOOD}: furious, eyebrow slanted hard down over the eye, mouth wide open baring blunt teeth, steam-lines optional.
- `assets/cyclops_pleased.png` — {MOOD}: smug and satisfied, eye squinted half-shut like a happy cat, faint closed-mouth smile.
- `assets/cyclops_laugh.png` — {MOOD}: cackling with delight, head tipped back, mouth wide open laughing, eye scrunched shut.
- `assets/cyclops_sleeping.png` — {MOOD}: fast asleep, eye fully closed as a single horizontal line, mouth slightly open, maybe a small "Z" pixel shape drifting above its head.

## 8–14. Riddle scene banners (one per question)
**Size:** 312×118 each (wide banner)

Shared framing note: *wide banner illustration, symbolic/iconic objects
centered on a simple cave-stone backdrop, no readable text in the image.*

- `assets/scene_q1_odysseus.png` — A bronze Greek war helmet with a horsehair crest, resting beside a round bronze shield and a spear, on weathered ship planking. (Question: who plays Odysseus.)
- `assets/scene_q2_telemachus.png` — A small gold circlet crown resting next to a wooden bow and quiver of arrows, evoking a young prince waiting at home. (Question: who plays Telemachus.)
- `assets/scene_q3_athena.png` — A wise owl perched atop a bronze shield and spear, an olive branch draped across the shield, moonlight glow. (Question: who plays Athena.)
- `assets/scene_q4_imax.png` — A giant stylized antique film camera with visible film reels, glowing warm light beaming from the lens like a spotlight. (Question: the IMAX filming first.)
- `assets/scene_q5_runtime.png` — A large ornate hourglass with sand mid-fall, sitting on a stone pedestal. (Question: the film's runtime.)
- `assets/scene_q6_animatronic.png` — A massive hulking mechanical/animatronic cyclops framework (visible rivets and joints) towering over a tiny human figure standing next to a measuring pole for scale. (Question: height of the practical cyclops build.)
- `assets/scene_q7_nyongo.png` — Two ornate theatrical masks side by side — one regal and serene (a queen), one fierce and vengeful (another queen) — both gold-trimmed, on a dark backdrop. (Question: the actress's dual role.)

## 15–17. Ending scenes
**Size:** 320×240 each

- `assets/ending_great.png` — Triumphant: a wide-open cave mouth at night with the boulder rolled away, a small flock of sheep walking out freely toward moonlit water, one figure barely visible clinging to the underside of a sheep's belly. Warm, victorious mood, bright moon, open sky.
- `assets/ending_narrow.png` — Tense but hopeful: inside the cave, the huge cyclops asleep and snoring beside a toppled wine cup, a few small figures creeping past on tiptoe near the cave mouth, dim torchlight, mostly shadows.
- `assets/ending_caught.png` — Comic, not grim: the cyclops sitting cross-legged and laughing next to a big cooking pot full of potatoes, a tiny apron and pile of unpeeled potatoes nearby — a silly "chore punishment" ending, not violent or scary.

---

### Quick checklist
- [ ] title.png (320×240)
- [ ] cave_backdrop.png (320×240)
- [ ] cyclops_idle.png / cyclops_angry.png / cyclops_pleased.png / cyclops_laugh.png / cyclops_sleeping.png (280×220)
- [ ] scene_q1_odysseus.png … scene_q7_nyongo.png (312×118)
- [ ] ending_great.png / ending_narrow.png / ending_caught.png (320×240)
