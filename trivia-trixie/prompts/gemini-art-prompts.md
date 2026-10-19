# Gemini Art Prompts for Trivia Trixie's Wishing Quiz

Use these prompts with Google Gemini's image generator to create the art for the game.
The game already runs and looks good without any of these — every image has a CSS/emoji
fallback — so treat this as an optional visual upgrade pass, in whatever order you like.

**Save each output PNG to the exact filename shown, inside the `assets/` folder.**

---

## Style Guide (paste this into EVERY prompt, before the specific prompt text)

```
Art style: warm, whimsical children's storybook illustration. Soft painterly digital
brushwork, rounded friendly shapes, gentle rim lighting, dreamy fairy-tale game-show
color palette (magenta pink, deep violet, gold, sparkle-white). Wholesome and cheerful,
never scary or dark. No text, no logos, no watermarks anywhere in the image unless a
prompt specifically asks for lettering. Transparent background where noted.
```

---

## Trivia Trixie the Fabulous Fairy — character reference

Paste this description into every Trixie prompt so she stays consistent across images:

```
Character: "Trivia Trixie", a fabulous fairy game-show host. Bright bubblegum-pink
pixie-cut hair with a small sparkling tiara. Big warm friendly eyes, a wide welcoming
smile. Wears a glittery purple-and-gold game-show hostess gown with a sweetheart
neckline, plus a pair of large iridescent butterfly-style fairy wings that catch the
light. Carries a star-tipped magic wand. Rounded, charming storybook proportions —
not realistic, not a mascot costume. Consistent design across every pose.
```

---

## Prompt 1: Trixie — Idle
**Save as: `assets/trixie_idle.png`**
```
[Style Guide] + [Trixie character reference]

Pose: standing gracefully with wand resting at her side, warm welcoming smile, one
wing raised slightly as if mid-flutter. Neutral, friendly "hosting the show" pose.
Full body visible, floating just above the ground. Transparent background, no shadow
plane beneath her — just a soft glow at her feet.

Output: single PNG, roughly 800x800px, transparent background.
```

## Prompt 2: Trixie — Happy
**Save as: `assets/trixie_happy.png`**
```
[Style Guide] + [Trixie character reference]

Pose: mid-air happy hop, wand raised triumphantly with a small burst of gold sparkles
around its tip, delighted grin, wings fluttering fast. Used when the player answers a
question correctly. Transparent background.

Output: single PNG, roughly 800x800px, transparent background.
```

## Prompt 3: Trixie — Laugh
**Save as: `assets/trixie_laugh.png`**
```
[Style Guide] + [Trixie character reference]

Pose: doubled over with joyful laughter, eyes crinkled shut with delight, one hand on
her stomach, wand tucked under her arm, wings fluttering wildly, sparkles scattered
around her. Used for an extra-delighted correct-answer reaction. Transparent background.

Output: single PNG, roughly 800x800px, transparent background.
```

## Prompt 4: Trixie — Sad (gentle, not upsetting)
**Save as: `assets/trixie_sad.png`**
```
[Style Guide] + [Trixie character reference]

Pose: a small, sweet "aw, shucks" pout — NOT crying, NOT distressed. Wand tip drooping
down, shoulders slightly slumped, one eyebrow raised sympathetically, still warm and
kind. Used for a wrong-answer reaction and should stay gentle and encouraging in tone,
never sad or upsetting for a child. Transparent background.

Output: single PNG, roughly 800x800px, transparent background.
```

## Prompt 5: Trixie — Sleepy
**Save as: `assets/trixie_sleepy.png`**
```
[Style Guide] + [Trixie character reference]

Pose: drifting and dozing on a small cushion of soft clouds, eyes gently closed, one
hand tucked under her cheek, wand resting beside her, wings folded and still, tiny
"zzz" sparkles drifting up. Used on the title screen before the show starts.
Transparent background.

Output: single PNG, roughly 800x800px, transparent background.
```

## Prompt 6: Trixie — Cheer (big win pose)
**Save as: `assets/trixie_cheer.png`**
```
[Style Guide] + [Trixie character reference]

Pose: arms thrown wide in triumphant celebration, wand shooting an enormous burst of
stars, confetti, and sparkles overhead, huge joyful grin, wings spread fully open and
glowing. Used when the player wins their wish. Transparent background.

Output: single PNG, roughly 800x800px, transparent background.
```

---

## Prompt 7: Title Logo
**Save as: `assets/title_logo.png`**
```
[Style Guide]

Generate an ornate storybook title logo reading exactly: "Trivia Trixie's Wishing Quiz".
Sparkly hand-lettered fairy-tale typography in gold and pink with a soft white outline,
small wand-and-star flourishes framing the text, a light sparkle trail beneath it.
No other elements, no characters. Transparent background.

Output: single PNG, roughly 1200x500px, transparent background.
```

---

## Prompt 8: Stage Backdrop
**Save as: `assets/stage_backdrop.png`**
```
[Style Guide]

An empty magical game-show stage, viewed from the audience. Deep twilight-purple sky
sprinkled with stars, soft floating sparkle dust drifting in the air, tall dreamy
curtains in violet and gold pulled to each side, a glowing crescent-moon shaped stage
platform catching soft pink and gold light. No characters, no text — just the set,
ready for a host to stand on it. Full-bleed scene, no transparency needed.

Output: single PNG, 1920x1080px (landscape).
```

---

## Category Scene Backgrounds

One illustrated backdrop per trivia topic, shown behind the question card while that
topic's questions are on screen. These are **original, evocative scenes inspired by
each topic's vibe and iconography** (settings, colors, motifs) rather than exact
reproductions of any copyrighted character — keep character designs generic/your-own
rather than duplicating a specific studio's exact character.

All 21 share this size:
```
Output: single PNG, 1920x1080px (landscape), full-bleed scene, no text.
```

### Prompt 9 — SpongeBob
**Save as: `assets/scene_spongebob.png`**
```
[Style Guide]
An undersea kitchen scene on a sandy ocean floor: a cheerful yellow sponge-shaped
short-order cook character flipping patties on a grill inside a giant pineapple-shaped
house, bubbles drifting up, coral and starfish scattered around, bright turquoise water.
```

### Prompt 10 — TMNT
**Save as: `assets/scene_tmnt.png`**
```
[Style Guide]
A moonlit city rooftop scene: four small green turtle-shelled ninja silhouettes
crouched together, colorful eye masks, nunchaku and a giant pizza box nearby, city
skyline and a manhole cover glowing below.
```

### Prompt 11 — Zombies
**Save as: `assets/scene_zombies.png`**
```
[Style Guide]
A pastel, cute (not scary) high-school pep-rally scene: friendly cartoon zombie
students with mint-green skin dancing alongside cheerleaders in matching uniforms,
confetti and pom-poms in the air, school banners in the background.
```

### Prompt 12 — Descendants
**Save as: `assets/scene_descendants.png`**
```
[Style Guide]
A split fantasy scene: on one side a shadowy fog-wrapped island with a crooked purple
castle, on the other a bright fairy-tale kingdom with a golden castle and blue sky,
a glowing bridge connecting the two.
```

### Prompt 13 — Simpsons
**Save as: `assets/scene_simpsons.png`**
```
[Style Guide]
A bright cartoon suburban street at sunset: yellow-toned houses, a donut shop with a
giant pink donut sign, a nuclear power plant's twin smokestacks on the horizon,
simple blue sky with fluffy clouds.
```

### Prompt 14 — Spirited Away
**Save as: `assets/scene_spiritedaway.png`**
```
[Style Guide]
A dreamy Japanese spirit bathhouse at dusk: a tall wooden building strung with glowing
red lanterns, a stone bridge over misty water, soft steam rising, tiny soot-sprite
silhouettes in a window.
```

### Prompt 15 — Christmas
**Save as: `assets/scene_christmas.png`**
```
[Style Guide]
A cozy snow-covered village square at night: a giant decorated Christmas tree strung
with lights, stockings hanging from a nearby lamppost, softly falling snow, warm
golden window-light from nearby cottages.
```

### Prompt 16 — Easter
**Save as: `assets/scene_easter.png`**
```
[Style Guide]
A sunny pastel spring meadow: tall grass dotted with wildflowers, hand-painted eggs
tucked among the blooms, a wicker Easter basket, a fluffy bunny mid-hop, soft morning
light.
```

### Prompt 17 — Grinch
**Save as: `assets/scene_grinch.png`**
```
[Style Guide]
A snowy mountain silhouette looming over a cheerful candy-striped village below,
warm twinkling lights from the village windows, a swirl of falling snow, a mischievous
shadow peeking from the mountaintop cave.
```

### Prompt 18 — Dr. Seuss
**Save as: `assets/scene_drseuss.png`**
```
[Style Guide]
A whimsical Seussian landscape: impossibly tall swirly striped trees, gravity-defying
polka-dotted hills, wild candy-colored sky, playful curved architecture with no
straight lines.
```

### Prompt 19 — Cat in the Hat
**Save as: `assets/scene_catinthehat.png`**
```
[Style Guide]
A cozy living room on a rainy day, seen through a big window with raindrops streaking
down the glass: a red-and-white striped tall hat resting on an armchair, toys and
books scattered playfully across the floor, warm lamp light.
```

### Prompt 20 — Elf
**Save as: `assets/scene_elf.png`**
```
[Style Guide]
A candy-cane striped North Pole workshop: shelves stacked with wrapped presents and
giant candy canes, a snow-dusted window showing the aurora outside, warm fairy lights
strung along wooden beams.
```

### Prompt 21 — Lollies
**Save as: `assets/scene_lollies.png`**
```
[Style Guide]
A rainbow-colored candy shop interior: glass jars overflowing with jellybeans and
gummy sweets, giant swirly lollipops in a display stand, striped candy-cane pillars,
warm inviting glow.
```

### Prompt 22 — Fairies
**Save as: `assets/scene_fairies.png`**
```
[Style Guide]
An enchanted flower garden glade at twilight: giant glowing toadstools, fireflies
drifting through the air, delicate flower blossoms the size of umbrellas, a
sparkling dewy path winding through.
```

### Prompt 23 — Faraway Tree
**Save as: `assets/scene_farawaytree.png`**
```
[Style Guide]
A colossal fantasy tree trunk rising into fluffy clouds, spiral windows and tiny
wooden doors carved into the bark at different heights, a rope ladder winding upward,
a magical glow coming from the very top where the clouds part.
```

### Prompt 24 — Ghostbusters
**Save as: `assets/scene_ghostbusters.png`**
```
[Style Guide]
A friendly, not-scary cartoon city street at night: soft glowing ghost silhouettes
drifting between buildings, criss-crossing beams of colorful light, a fire-station
garage door open and glowing warmly, retro city skyline.
```

### Prompt 25 — Toys
**Save as: `assets/scene_toys.png`**
```
[Style Guide]
A cozy playroom shelf scene: a spinning top mid-spin, a teddy bear propped against
building blocks, a kite leaning in the corner, a yo-yo dangling, soft afternoon light
through a nearby window.
```

### Prompt 26 — Toy Story
**Save as: `assets/scene_toystory.png`**
```
[Style Guide]
A sunlit child's bedroom: a colorful rug covered in toys lined up as if about to
spring to life, a toy chest with the lid ajar, string lights on the wall, warm
late-afternoon window light.
```

### Prompt 27 — Pixar
**Save as: `assets/scene_pixar.png`**
```
[Style Guide]
A dreamy collage-style landscape blending a few whimsical worlds: a colorful coral
reef on one side, a little house lifted by a bundle of balloons floating above,
and a winding race-track road curving through green hills below.
```

### Prompt 28 — Disney
**Save as: `assets/scene_disney.png`**
```
[Style Guide]
A grand fairy-tale castle at sunset: tall spires catching golden light, sparkling
fireworks bursting overhead in pink and gold, a wide plaza in front dotted with
glowing lamp posts.
```

### Prompt 29 — Pop Culture
**Save as: `assets/scene_popculture.png`**
```
[Style Guide]
A bright blocky sandbox-world landscape with rolling cube-shaped hills, a cheerful
cartoon rescue pup sitting beside a little toy vehicle, a floating rainbow-colored
pocket-monster-style creature nearby, playful clouds shaped like game controllers.
```

---

## Ending Scenes

### Prompt 30 — Ending: Perfect Score
**Save as: `assets/ending_perfect.png`**
```
[Style Guide] + [Trixie character reference]

Trixie stands triumphant center-stage amid an enormous magical fireworks and confetti
explosion in gold and pink, arms raised, wand blazing with light, sparkle trails
spiraling upward — a full "champion" celebration moment. Full-bleed scene.

Output: single PNG, 1920x1080px (landscape).
```

### Prompt 31 — Ending: Win
**Save as: `assets/ending_win.png`**
```
[Style Guide] + [Trixie character reference]

Trixie floats center-stage, presenting a glowing sparkling wish orb forward with both
hands toward the viewer, warm delighted smile, soft golden stage light and drifting
sparkles all around. Full-bleed scene.

Output: single PNG, 1920x1080px (landscape).
```

### Prompt 32 — Ending: Try Again (kept warm, not punishing)
**Save as: `assets/ending_lose.png`**
```
[Style Guide] + [Trixie character reference]

Trixie gives a warm, encouraging smile directly to the viewer, kneeling slightly with
one hand extended as if offering an invitation to try again, wand resting gently,
soft twilight-purple stage lighting — comforting and hopeful, NOT sad or discouraging.
Full-bleed scene.

Output: single PNG, 1920x1080px (landscape).
```

---

## How to Use

1. Copy the **Style Guide** (and the **Trixie character reference**, for any Trixie prompt)
   and paste it at the start of each prompt.
2. Copy the specific numbered prompt and paste it after.
3. Generate the image in Gemini.
4. Save the output PNG with the exact filename shown, into the `assets/` folder.
5. Open `index.html` in your browser — the game automatically detects and uses any
   art files that are present, and gracefully falls back to its emoji/gradient look
   for any that aren't (yet).
