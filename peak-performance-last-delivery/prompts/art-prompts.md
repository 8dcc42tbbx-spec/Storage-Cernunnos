# Art Prompts for Peak Performance: Last Delivery (SNES-style pseudo-3D racer)

Companion to `../README.md` — that document explains *why* each asset exists
and how it's used; this file is the ready-to-run generation prompt sheet,
following the same convention as this repo's `prompts/gemini-art-prompts.md`
(Postie Run). These produce clean sprite sheets and tilesets with **no text
labels**, on strict grids, ready to drop into an `assets/` folder once the
game is implemented.

**IMPORTANT:** After each prompt, save the output PNG to the specified
filename under `assets/`. Any image model that can hold a strict grid and a
transparent background works (Gemini, Midjourney with a grid reference,
etc.) — these were written Gemini-first like the sibling prompt sheet.

---

## Style Guide (copy this into EVERY prompt)

```
Art style: SNES-era 16-bit pseudo-3D racing game (Top Gear / F-Zero / Rock
n' Roll Racing, 1991-1993). Chunky, confident pixel art with 1px dark
outlines, dithered gradient shading (visible dither pattern on curved
surfaces and skies, not smooth airbrushed gradient), saturated but not
neon colour palette, ambient occlusion via a single darker shade band
rather than soft shadow. No modern anti-aliasing, no glow/bloom, no
outlined text unless specified. Hard pixel edges only. Transparent PNG
background unless a full-frame background is specified. NO text, NO
labels, NO annotations anywhere on the image unless explicitly listed as
in-image text in the prompt.
```

---

## Prompt 1: Player Van — Steering & Light States
**Save as: `assets/van_player.png`**

```
Generate a pixel art sprite sheet for a racing game vehicle on a
transparent background. NO text or labels.

Vehicle: an Australia Post electric delivery van, seen from behind and
slightly above (rear three-quarter chase-cam view, the way the player's
car is drawn in Top Gear or F-Zero). Boxy compact van body, red with a
white roof and a white stripe across the rear doors, small Australia Post
red-circle logo centred on the rear doors, twin rear brake lights, small
roof-mounted amber beacon light.

Sprite sheet layout - strict grid, 32x32 pixels per frame, 5 columns x 4
rows:
Row 1 (y=0) - daylight, brake lights off: centred/straight, slight left
lean, hard left lean, slight right lean, hard right lean.
Row 2 (y=32) - daylight, brake lights ON (glowing red): same 5 lean poses
in the same column order.
Row 3 (y=64) - night, headlights/tail-lights on (warm light spill visible
at the sprite's lower edge, tail lights bright red): same 5 lean poses.
Row 4 (y=96) - snow/ice variant, light dusting of snow on the roof and
hood edges, headlights on: same 5 lean poses.

Colour palette: body red #C8202A, roof/stripe white #F2F0EA, window tint
dark blue-grey #2B3440, tyre/shadow black #1A1A1A, brake light red
#FF3B30, headlight warm yellow-white #FFE9A8, amber beacon #FFB020, snow
highlight #E8F0F5.

Output: single PNG, 160x128 pixels (5 columns x 4 rows of 32x32),
transparent background. Strict grid, no text.
```

---

## Prompt 2: Traffic Vehicles (rear view only — no oncoming lane)
**Save as: `assets/traffic.png`**

```
Generate a pixel art sprite sheet of road vehicles, all seen from directly
behind (rear view, straight-on, no perspective skew) for a racing game
where all traffic travels the same direction as the player. Transparent
background. NO text or labels.

Strict grid, 32x32 pixels per frame, 6 columns x 1 row:
Cell 1: red sedan, rear view, tail lights visible.
Cell 2: white ute (pickup) with an open tray, rear view.
Cell 3: green farm tractor towing nothing, rear view, tall and narrow.
Cell 4: a long articulated road train (semi-trailer truck) rear doors,
drawn wider than the grid cell allows if needed (see the 64x32 variant
below) — for THIS row draw only its rear cab/trailer end cropped to fit
32x32, reflective hazard stripe visible.
Cell 5: a rival red-and-blue courier van, rear view, generic logo shape
only (no readable text).
Cell 6: a dusty beige farm ute, rear view, roo-bar bumper visible as a
silhouette above the tray.

Second row (y=32), 64x32 pixel cell, single sprite: the full road train
from cell 4, wide rear trailer end with double rear doors, hazard
chevron stripe, tail lights each side, drawn at full width this time.

Palette: keep each vehicle's colour distinct and saturated - red #C0392B,
white #EDEDED, green #3D6B35, brown/dust #8A6D4B, blue #2C5F8A, tail
light red #FF3B30. 1px dark outline on all shapes.

Output: single PNG, 192x64 pixels total (192x32 top row of six 32x32
cells, 64x32 second row containing the wide road-train sprite left-
aligned, remainder transparent). No text.
```

---

## Prompt 3: Hazards
**Save as: `assets/hazards.png`**

```
Generate a pixel art sprite sheet of road hazards for an Australian-themed
racing game. Transparent background. NO text or labels.

Strict grid, 24x24 pixels per frame, 4 columns x 2 rows:
Row 1: kangaroo hop cycle, 4 frames, side-on silhouette mid-leap at
different heights (crouch, launch, apex, landing), warm brown-grey fur,
simple but readable pixel shape.
Row 2, cell 1: black ice patch, viewed as a road decal (flattened oval,
translucent pale blue-white with a faint shine streak, meant to be drawn
flush on the road surface).
Row 2, cell 2: fallen tree branch across part of the road, brown with a
few green leaf clusters.
Row 2, cell 3: an unlit wooden farm gate post, dark silhouette, meant to
sit at the road edge.
Row 2, cell 4: a small reflective road-works witches-hat (traffic cone)
with a warning light on top.

Palette: kangaroo #9C8064 with darker #6E5644 shading, ice patch
#CFE8F2 at reduced apparent opacity, branch #5B4430 with leaves #4C7A3D,
gate post #4A3A28, cone orange #FF6A1A with white bands #F2F2F2.

Output: single PNG, 96x48 pixels (4 columns x 2 rows of 24x24),
transparent background. No text.
```

---

## Prompt 4: Leg 1 Environment — Suburban Sprint (afternoon, clear)
**Save as: `assets/env_leg1_suburban.png`**

```
Generate a pixel art background tileset for a pseudo-3D racing game
(SNES Top Gear / F-Zero style), for a road segment strip renderer.
Transparent background where noted. NO text or labels.

Layout, three horizontal bands stacked vertically, each 256px wide:
Band 1 - "far" parallax (256x48px): bright blue afternoon sky with a
dither gradient to pale horizon haze, a few soft white clouds, faint
distant suburban rooftops as a low silhouette strip along the bottom edge.
Band 2 - "mid" parallax (256x64px): suburban street scene - single-storey
brick and weatherboard houses in varied pastel colours, Hills Hoist
rotary clotheslines in a couple of yards, a wheelie bin at a kerb, a
jacaranda-ish tree in bloom, front fences. Repeatable/tileable
left-to-right.
Band 3 - road surface strip (256x16px, this one opaque not transparent):
warm grey asphalt with the classic alternating-shade "distance banding"
look (two slightly different grey tones alternating), pale dashed
centre line, lighter gravel-coloured shoulder edge on each side.

Output: single PNG, 256x128 pixels (three bands stacked, band 3 opaque,
bands 1-2 transparent outside their silhouettes), no text.
```

---

## Prompt 5: Leg 2 Environment — Highway Dash (dusk, light rain)
**Save as: `assets/env_leg2_highway.png`**

```
Generate a pixel art background tileset for a pseudo-3D racing game,
matching the layout and technique of a "Leg 1 suburban" tileset but for a
dusk highway scene with light rain. Transparent background where noted.
NO text or labels.

Band 1 - far (256x48px): dramatic dusk sky, dithered gradient from deep
orange near the horizon up through purple to dark blue at the top, a
strip of low hills silhouetted at the very bottom.
Band 2 - mid (256x64px): highway shoulder scene - sparse gum trees,
sound-barrier fencing, a green highway distance sign (numbers/text
blanked/abstracted, not legible letters), sodium highway lighting poles
with a warm glow halo, faint rain streaks angled across this whole band
at reduced opacity.
Band 3 - road surface (256x16px, opaque): wet dark asphalt, alternating
shade banding as before but darker and with a few small bright
reflective highlight streaks to read as "wet", pale lane-line dashes.

Output: single PNG, 256x128 pixels, same band structure as the suburban
tileset. No text.
```

---

## Prompt 6: Leg 3 Environment — Country Backroads (night, fog)
**Save as: `assets/env_leg3_country.png`**

```
Generate a pixel art background tileset for a pseudo-3D racing game, night
countryside scene with drifting fog. Transparent background where noted.
NO text or labels.

Band 1 - far (256x48px): near-black night sky with a scatter of small
white stars, a low pale band of fog-glow along the horizon (soft dithered
white-grey gradient), one or two distant unlit silo silhouettes.
Band 2 - mid (256x64px): dark paddock scene - post-and-wire farm fencing,
scattered gum trees as near-black silhouettes, a single distant farmhouse
window lit warm yellow, a patch of semi-transparent drifting fog rendered
as a soft white-grey cloud shape overlapping the lower half of this band.
Band 3 - road surface (256x16px, opaque): very dark asphalt, faint
alternating shade banding barely visible (this leg reads as low-visibility
by design), centre line only lightly visible, no shoulder detail.

Output: single PNG, 256x128 pixels, same band structure as prior
tilesets. No text.
```

---

## Prompt 7: Leg 4 Environment — Mountain Pass (deep night, snow/ice)
**Save as: `assets/env_leg4_mountain.png`**

```
Generate a pixel art background tileset for a pseudo-3D racing game, a
snowy mountain road at deep night. Transparent background where noted.
NO text or labels.

Band 1 - far (256x48px): deep blue-black night sky, jagged dark mountain
silhouette along the bottom, thin snow-capped ridgeline highlighted in
pale blue-white, light snowfall as small scattered white dots across the
whole band.
Band 2 - mid (256x64px): snow-laden pine trees in silhouette with
snow-highlighted tips, a low guardrail dusted with snow along the road
edge, a couple of roadside reflector posts, denser snowfall dots than
band 1.
Band 3 - road surface (256x16px, opaque): icy grey-blue asphalt with
visible pale ice-sheen patches breaking up the usual alternating shade
banding, thin snow accumulation along both shoulders as a white fringe.

Output: single PNG, 256x128 pixels, same band structure as prior
tilesets. No text.
```

---

## Prompt 8: Leg 5 Environment — Last Delivery (midnight, blizzard)
**Save as: `assets/env_leg5_final.png`**

```
Generate a pixel art background tileset for a pseudo-3D racing game, the
final approach into a small town at midnight during heavy snowfall.
Transparent background where noted. NO text or labels.

Band 1 - far (256x48px): near-white-out dark sky, heavy dense snowfall as
larger, denser white dots/streaks than the mountain leg, a soft warm glow
low on the horizon suggesting the town's lights ahead.
Band 2 - mid (256x64px): a street of small houses with warm lit windows
and a couple with visible string-light outlines (no readable text, just
coloured dot strings along a roofline), snow piled at kerbs, one
lamp-post with a warm light halo partly obscured by falling snow, a
denser layer of falling snow rendered over the whole band at moderate
opacity so the scene reads as harder to see through.
Band 3 - road surface (256x16px, opaque): snow-covered road, mostly pale
white-blue with only faint hints of the alternating shade banding showing
through, tyre-track darker lines down the centre suggesting other traffic
has passed.

Output: single PNG, 256x128 pixels, same band structure as prior
tilesets. No text.
```

---

## Prompt 9: Weather FX Sheet
**Save as: `assets/weather_fx.png`**

```
Generate a pixel art visual effects sheet for weather overlays in a
racing game. Transparent background throughout. NO text or labels.

Strict grid layout:
Row 1 (y=0, 8x8 each, 4 frames): snowflake particle, 4 slightly different
small white/pale-blue flake shapes for variety when scattered.
Row 2 (y=8, 16x4 each, 3 frames): rain streak, a short diagonal pale blue
-white line, 3 slightly different lengths/angles for variety.
Row 3 (y=12, 64x24, single image): fog gradient patch, soft white-grey
radial dither cloud, fully opaque centre fading to transparent edges,
meant to be tiled/overlapped for drifting fog banks.
Row 4 (y=36, 32x16, single image): headlight cone glow, warm
yellow-white soft dithered triangular glow fading to transparent,
pointing downward.
Row 5 (y=52, 96x32, single image): blizzard whiteout gradient, a wide
soft white cloud with lower opacity at the edges and near-full white at
centre, for the leg 5 visibility-cut effect.

Output: single PNG, 96x84 pixels total, transparent background
throughout. No text.
```

---

## Prompt 10: HUD & UI
**Save as: `assets/ui_hud.png`**

```
Generate pixel art UI elements for an SNES-style racing game HUD.
Transparent background. NO text/numerals baked into the image UNLESS
specified below as digit glyphs.

Layout:
Row 1 (y=0): digital clock frame, 64x24px, a chunky dashboard-style
digital-clock bezel in dark red plastic with a slightly recessed black
screen area (numerals will be drawn separately by the game, leave the
screen area empty/dark).
Row 2 (y=24): a full set of digital clock digits 0-9 and a colon, SNES
LCD-style blocky segmented font, warm amber-on-black, each glyph in its
own 8x12px cell, 11 cells total (10 digits + colon).
Row 3 (y=36, after digits): analogue speedometer dial, 40x40px, cream
dial face with dark tick marks and a red needle pivot point (needle
itself will be drawn/rotated separately by the game - just provide the
static dial face and one separate needle sprite beside it in a 4x16px
cell).
Row 4 (y=76): five parcel-shaped leg-progress pip icons in a row, each
12x12px, brown cardboard-parcel shape with a small red bow, one "filled/
delivered" bright version and one "pending" dim/greyscale version side by
side (so 10 icons total: 5 pending + 5 filled, alternating).
Row 5 (y=88): a wide milestone banner frame, 160x20px, festive red and
gold ribbon-banner shape with a slightly scalloped bottom edge, empty
centre area for game-drawn text.

Output: single PNG, 200x108 pixels, transparent background. No text
except the digit/colon glyphs explicitly requested in Row 2.
```

---

## Prompt 11: Title & Cutscene Art
**Save as: `assets/scene_title.png`, `assets/scene_ending.png`, `assets/scene_fail.png`**

```
[Use once per scene below, each as its own generation - these are
full-frame illustrated backgrounds, not tile/sprite sheets, opaque
throughout, painted in the same SNES 16-bit dithered pixel-art style as
the rest of this sheet.]

Scene A - TITLE (save as assets/scene_title.png): An Australia Post
delivery van pulling out of a depot gate at dusk, seen from a low
three-quarter angle (not the in-game rear chase-cam - this one can show
the van's side/front for character), orange dusk sky behind it, a string
of fairy lights along the depot fence, motion-blur dust behind the rear
wheels suggesting urgency. Leave the top third of the image relatively
clear/uncluttered sky for a game logo to be overlaid separately. No text
in the image itself. 256x144 pixels, opaque full-frame background.

Scene B - ENDING (save as assets/scene_ending.png): the same van parked
in a driveway at night, driver's silhouette carrying a parcel toward a
front door, porch light on, warm light spilling from a window, snow
lightly falling, a decorated tree visible through the window. No text.
256x144 pixels, opaque full-frame background.

Scene C - FAIL (save as assets/scene_fail.png): the same van stopped on
a dark road, its headlights the only light source, a house visible in
the distance with its porch light just switching off (draw it dim/off,
not lit), gentle rather than bleak in mood - overcast night, not
horror-movie dark. No text. 256x144 pixels, opaque full-frame background.
```

---

## Prompt 12: Coach — Title Screen Illustration
**Save as: `assets/coach_title.png`**

```
Art style: SNES-era 16-bit character illustration (Top Gear / F-Zero /
Rock n' Roll Racing, 1991-1993 title-screen quality). Chunky confident
pixel art, 1px dark outline, dithered gradient shading, saturated colour
palette, no modern anti-aliasing or glow. Transparent background. NO
text, NO labels anywhere on the image.

Character: "Coach", an Australia Post depot supervisor for the
Christmas "Peak" season. Woman with dark hair pulled up into a high bun,
warm confident open-mouthed smile, mid-call-out expression. Wearing a
red zip-up track jacket with white piping down each sleeve, a white
t-shirt underneath, a whistle on a lanyard, and a small circular
Australia Post logo patch on the right chest. Standing at a
three-quarter angle, one hand on her hip, the other raised holding a
white megaphone with a red bell, as if calling out to someone driving
away from her.

Pose and framing: waist-up to just-above-the-knees, angled so she reads
as looking out toward the bottom-right of the frame (toward where a
delivery van would be pulling away in a composited title screen). Warm
dusk rim-lighting on her hair and shoulder from one side, consistent
with a depot-at-dusk setting.

Output: single PNG, 120x160 pixels, transparent background, character
only (no background elements, no depot props) so it can be composited
over a separate title background. No text.
```

---

## Prompt 13: Coach — In-Game Radio Portrait Sheet
**Save as: `assets/coach_portrait.png`**

```
Art style: SNES-era 16-bit dialogue/portrait art (the small talking-head
boxes used in SNES RPGs and racing-game pit-crew call-ins). Chunky
pixel art, 1px dark outline, dithered gradient shading, saturated
colour palette, no modern anti-aliasing or glow. Transparent background.
NO text, NO labels.

Character: "Coach" (see title-screen prompt for full description — dark
hair in a high bun, red Australia Post track jacket with white sleeve
piping, circular logo patch), shown here as a head-and-shoulders bust
portrait only, front-on, filling most of each grid cell, consistent
proportions and framing across every cell so they can be swapped frame
-to-frame without jittering.

Strict grid, 40x40 pixels per frame, 2 columns x 3 rows (mouth-closed
frame in column 1, mouth-open/talking frame in column 2, for each
expression row):
Row 1 - NEUTRAL/SUPPORTIVE: warm, calm, encouraging half-smile. Column 1
mouth closed, column 2 mouth open mid-word.
Row 2 - PUMPED/EXCITED: big open grin, eyebrows raised, genuinely
delighted. Column 1 mouth closed (big smile), column 2 mouth wide open
(cheering).
Row 3 - ALERT/WARNING: eyebrows drawn in, focused urgent expression,
leaning slightly toward camera. Column 1 mouth closed (tense), column 2
mouth open (calling out a warning).

Output: single PNG, 80x120 pixels (2 columns x 3 rows of 40x40),
transparent background. No text.
```

---

## How to use

1. Copy the **Style Guide** block and paste it at the start of every
   prompt (except Prompts 11-13, which already embed their own style/scene
   descriptions inline and intentionally break from the tile-grid
   framing).
2. Generate each prompt and save the output PNG under the exact filename
   listed — this keeps them drop-in compatible with the module layout
   suggested in `../README.md` §9 once the game is implemented.
3. Keep the five environment tilesets (Prompts 4-8) visually consistent in
   *technique* (same band heights, same alternating-shade road banding)
   even as palette and mood shift leg to leg — that consistency is what
   sells the single continuous evening the countdown clock is tracking.
4. Generate Coach (Prompts 12-13) after the title/cutscene art (Prompt
   11) and check her against it side by side — she should read as the
   same character in both, just at different scales and framing.
