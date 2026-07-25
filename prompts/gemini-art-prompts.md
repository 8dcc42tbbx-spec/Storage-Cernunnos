# Gemini art prompts — TRAPPED! Odysseus vs the Cyclops

The game currently falls back to code-drawn placeholder art, which is
functional but flat and cartoonish — it's not a substitute for real art.
These prompts are written to get Gemini to produce actual **16-bit
JRPG-cutscene-quality** pixel art: painterly shading, real lighting, real
mood. Generate them, drop the result in `assets/` under the exact filename
listed, and the game automatically uses it instead of the built-in drawing
(see `js/images.js`) — nothing to wire up.

## Before you generate anything

**Style anchor** — paste this at the start of every prompt below so all the
pieces read as one consistent game, not a grab-bag:

> Painterly 16-bit-era JRPG cutscene/cover art, in the visual tradition of
> Chrono Trigger, Secret of Mana, Golden Axe, and Zelda: A Link to the Past
> box art — NOT flat 8-bit blocks, NOT a vector "retro" cartoon, NOT a
> smooth modern digital painting. Hand-placed pixel shading with soft
> dithered gradients, rich directional lighting (warm torchlight vs. cool
> moonlight), confident silhouettes, and a mythic, slightly cinematic mood
> — ancient Greek legend rendered as a beloved 90s console game's most
> memorable cutscene. Rich but disciplined color palette, not oversaturated.
> No modern UI elements, no readable text baked into the image, no
> photorealism, no 3D render look.

**Ask Gemini for the closest supported aspect ratio, then crop/resize to
the exact pixel size listed per asset** (Gemini's image generation
supports a fixed set of ratios, not arbitrary ones). The mapping to use:

| Asset type | Ask Gemini for | Then resize/crop to |
|---|---|---|
| Title / backdrop / endings | `4:3` | 320×240 |
| Cyclops portraits | `4:3` (or `1:1` and crop) | 280×220 |
| Riddle scene banners | `16:9`, then crop top+bottom to widen it further | 312×118 (~2.6:1) |

Use **nearest-neighbor / point resampling** for the final resize, not
bicubic/smooth — that's what keeps the crisp pixel-art read instead of
turning it into a shrunk photo. Most editors call this "pixelate" or
"nearest neighbor" resize.

**No real likenesses.** Every prompt below describes symbolic/mythic
objects (a helmet, an owl on a shield, a masked figure) rather than
portraits of the real film's cast — keep it that way, both for style
consistency and to avoid depicting real people.

Save everything into `assets/` (create the folder if it doesn't exist).

---

## 1. Title screen — `assets/title.png`
**Aspect:** 4:3 → resize to 320×240

> Cinematic 16-bit JRPG title-screen illustration: the mouth of a vast sea
> cave at night, viewed from deep inside looking out toward a moonlit
> Aegean sea. Jagged rock walls frame the shot in dramatic silhouette on
> both sides; the cave floor is scattered with broken oars, and the edge of
> a massive rolled boulder is just visible in frame. Outside the cave
> mouth, a colossal one-eyed cyclops crouches in near-total silhouette
> against the night sky — one huge glowing amber eye is the brightest
> point in the whole composition. Low pale moon, scattered stars, faint
> reflection on calm dark teal water. Warm torchlight glow bleeds in from
> off-frame lower-left, contrasting the cool moonlit blue outside. Epic,
> ominous, painterly. No text, no foreground characters — this is a
> background plate a logo will be overlaid on top of.

## 2. Cave backdrop — `assets/cave_backdrop.png`
**Aspect:** 4:3 → resize to 320×240

> 16-bit painterly pixel art, interior of a torch-lit sea cave used as a
> recurring dialogue background. Rough hand-painted stone walls with
> glistening damp highlights, jagged stalactites along the ceiling. Two
> wall-mounted torches — one left, one right — throw warm flickering
> orange light with soft dithered falloff across the stone, leaving the
> cave's upper corners in cool shadow. Far background: a narrow gap in the
> rock reveals a sliver of star-flecked night sky and a crescent moon.
> Empty foreground, no characters — a background plate.

## 3–7. Cyclops portraits (five moods)
**Aspect:** 4:3 (or 1:1 cropped) → resize to 280×220

Shared base — paste this, then add the one mood line under it:

> 16-bit painterly pixel-art character portrait of a cyclops: head and
> upper shoulders, facing the camera, filling most of the frame like a
> JRPG dialogue-box character portrait. Craggy, weathered, mossy
> olive-green skin with warm torchlit highlights on one side and cool blue
> shadow on the other. One huge round amber eye centered on the forehead
> with a sharp black pupil, a heavy brow, blunt worn tusks, coarse dark
> beard tufts. The character design should read as imposing but
> charismatic and a little funny — a memorable, larger-than-life game
> antagonist hosting a trivia night, not a horror-movie monster. Plain
> dark cave-stone background kept simple so the face reads clearly at
> small size, single dramatic light source from lower-left.

- `assets/cyclops_idle.png` — Add: **Neutral, expectant expression** — eyebrow relaxed, mouth a flat curious line, head tilted slightly as if waiting for an answer.
- `assets/cyclops_angry.png` — Add: **Furious expression** — brow slammed down hard over the eye, mouth wide open roaring, baring blunt teeth, a vein or two visible, hot rim-light flicker.
- `assets/cyclops_pleased.png` — Add: **Smug, satisfied expression** — eye squinted half-shut like a cat, faint closed-mouth smirk, chin slightly raised.
- `assets/cyclops_laugh.png` — Add: **Cackling with delight** — head tipped back, mouth wide open laughing, eye scrunched shut, a little motion-blur on the head to sell the laugh.
- `assets/cyclops_sleeping.png` — Add: **Fast asleep** — eye fully closed as a single relaxed line, mouth slightly open, head slumped to one side, moonlight instead of torchlight, peaceful and a little comedic.

## 8–14. Riddle scene banners (one per question)
**Aspect:** 16:9, then crop top+bottom to widen further → resize to 312×118

Shared framing — paste this, then add the per-question line under it:

> Wide 16-bit painterly pixel-art scene banner, cinematic horizontal
> composition like a JRPG cutscene establishing shot. A symbolic still-life
> of objects arranged center-frame against a simple torchlit cave-stone
> backdrop, shallow depth of field feel with the background slightly
> softer/darker than the hero objects in front. Dramatic single-source
> lighting, soft dithered gradients, no readable text in the image.

- `assets/scene_q1_zeuslaw.png` — Add: A weary hooded traveler seen from behind, standing at a lit doorway at night, staff in hand — an ordinary beggar at the threshold. A faint, almost-imperceptible golden divine glow flickers at the edge of the hood, hinting this stranger might secretly be a god in disguise. Warm lamplight from the doorway against a cool dusk sky.
- `assets/scene_q2_telemachus.png` — Add: A small gold laurel circlet resting beside a polished wooden hunting bow and a quiver of arrows, laid across a folded traveler's cloak on a windowsill overlooking a moonlit harbor — evoking a young prince waiting at home for his father's return.
- `assets/scene_q3_practical.png` — Add: A giant one-eyed puppet head, rigged from above by thick rope and a wooden marionette control bar just visible at the top of frame, hanging inside a real, damp stone cave lit by work-lights rather than torches — deliberately showing the practical, hand-built craftsmanship (rivets, seams, rigging) rather than hiding it, like a proud behind-the-scenes reveal.
- `assets/scene_q4_imax.png` — Add: A large stylized antique brass film camera on a wooden tripod, visible film reels catching warm light, a bright cone of golden light beaming from the lens like a spotlight cutting through cave darkness — half ancient artifact, half movie magic.
- `assets/scene_q5_runtime.png` — Add: An ornate bronze-and-glass hourglass on a carved stone pedestal, fine sand caught mid-fall and faintly luminous, dramatic raking side-light casting long shadows across the floor.
- `assets/scene_q6_animatronic.png` — Add: A colossal hulking mechanical cyclops framework looming in near-silhouette — visible rivets, gears, and a single glowing lens-eye — towering over a tiny human figure standing beside a marked wooden measuring pole for scale, scattered tools in the foreground.
- `assets/scene_q7_nyongo.png` — Add: Two ornate gold-trimmed theatrical masks side by side on a dark velvet backdrop — one serene and regal like a mourning queen, one fierce and vengeful with a furious expression — lit by a single dramatic spotlight from above.

## 15–17. Ending scenes
**Aspect:** 4:3 → resize to 320×240

- `assets/ending_great.png` —
  > 16-bit painterly pixel-art cinematic ending illustration: a triumphant
  > scene at a wide-open sea cave mouth at night, the great boulder rolled
  > aside. A small flock of sheep walks free out of the cave toward a
  > moonlit shoreline; one figure is barely visible clinging to the belly
  > of the rearmost sheep. Warm golden moonlight breaking through, a
  > strong sense of relief and release after tension, wide cinematic
  > framing, soft dithered shading.

- `assets/ending_narrow.png` —
  > 16-bit painterly pixel-art scene: inside a dim torchlit cave, a
  > colossal cyclops slumped in exhausted sleep beside a toppled wine cup,
  > a couple of small drifting motion-lines suggesting snoring. In the
  > foreground shadows near the cave mouth, small silhouetted figures
  > creep past on tiptoe, backlit by a sliver of moonlight from outside.
  > Tense, hushed mood, strong chiaroscuro lighting contrast between warm
  > torch-glow and cool moonlit blue.

- `assets/ending_caught.png` —
  > 16-bit painterly pixel-art scene, comedic tone, not scary or violent: a
  > cyclops sitting cross-legged by firelight, laughing heartily, beside a
  > large bubbling cooking pot, a big pile of unpeeled potatoes, and a tiny
  > apron draped over a nearby rock. Warm cozy torchlight, exaggerated
  > comedic character acting and expression, storybook-illustration
  > feel rather than horror.

---

### Quick checklist
- [ ] title.png (320×240)
- [ ] cave_backdrop.png (320×240)
- [ ] cyclops_idle.png / cyclops_angry.png / cyclops_pleased.png / cyclops_laugh.png / cyclops_sleeping.png (280×220)
- [ ] scene_q1_zeuslaw.png / scene_q2_telemachus.png / scene_q3_practical.png / scene_q4_imax.png / scene_q5_runtime.png / scene_q6_animatronic.png / scene_q7_nyongo.png (312×118)
- [ ] ending_great.png / ending_narrow.png / ending_caught.png (320×240)
