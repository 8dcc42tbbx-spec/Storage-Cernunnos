# Art Prompts for Peak Performance: Last Delivery (SNES-style pseudo-3D racer)

Companion to `../README.md` — that document explains *why* each asset exists
and how it's used; this file is the ready-to-run generation prompt sheet,
following the same convention as this repo's `prompts/gemini-art-prompts.md`
(Postie Run). These produce clean sprite sheets and tilesets on strict grids,
ready to drop into an `assets/` folder once the game is implemented.

**Why solid colour, not "transparent background":** Gemini doesn't reliably
honour a transparency instruction — it hands back an opaque canvas regardless
of the prompt. So every prompt below asks for a **flat, solid background
colour** instead, meant to be knocked out afterward in Photoshop (Select >
Color Range on the background colour, delete, save as PNG with alpha).

Two background colours are used, and it matters which prompt uses which:

- **Solid white (`#FFFFFF`)** is the default for anything being cut out — used
  on 8 of the 13 prompts (1, 2, 3, 10, 12, 13, and both halves of 11's
  character work doesn't apply since 11 is full-frame — see the table below).
- **Solid magenta (`#FF00FF`)** is used instead, specifically, wherever the
  artwork itself is dominated by white or near-white content (snow, fog,
  Coach's white piping) — a white background there would be nearly
  impossible to Color-Range-select without also eating into the art. Magenta
  never occurs naturally in any of this game's palettes, so it's always a
  clean, unambiguous select. This applies to **Prompt 9 (weather FX)** and
  **Band 2 of all five environment tilesets (Prompts 4–8)**.

Wherever a prompt's own content includes something that would otherwise read
as "white" (Coach's t-shirt, the ute's paint, an ice patch, a speedometer
dial), that element has been given an explicit off-white/tinted hex instead
of literal white, so it survives a white-background Color Range select
without being eaten alongside the background. Where a hex value was already
locked elsewhere in this project (e.g. the van's off-white roof stripe), the
same value is reused here rather than inventing a second "white."

**IMPORTANT:** After each prompt, save the output PNG to the specified
filename under `assets/`, then knock out the background colour in Photoshop
before it's usable. Any image model that can hold a strict grid works
(Gemini, Midjourney with a grid reference, etc.) — these were written
Gemini-first like the sibling prompt sheet.

| # | Asset | Background to key out | Notes |
|---|---|---|---|
| 1 | van_player.png | white | roof/stripe uses off-white #F2F0EA, not pure white |
| 2 | traffic.png | white | ute repainted light grey #D9D9D9, not white |
| 3 | hazards.png | white | cone bands use off-white #F2F0EA, not pure white |
| 4–8 | env_leg*.png | **Band 1 & 3: none (fully opaque, use as-is). Band 2: magenta** | snow/fog bands would fight a white key |
| 9 | weather_fx.png | **magenta** | content is almost entirely white/pale |
| 10 | ui_hud.png | white | speedometer dial uses #D8C8A0, not cream/white |
| 11 | scene_*.png (x3) | none — fully opaque full-frame art | nothing to key |
| 12 | coach_title.png | white | her whites use off-white #F2F0EA, not pure white |
| 13 | coach_portrait.png | white | same off-white substitution |

---

## Style Guide (copy this into EVERY prompt)

```
Art style: SNES-era 16-bit pseudo-3D racing game (Top Gear / F-Zero / Rock
n' Roll Racing, 1991-1993). Chunky, confident pixel art with 1px dark
outlines, dithered gradient shading (visible dither pattern on curved
surfaces and skies, not smooth airbrushed gradient), saturated but not
neon colour palette, ambient occlusion via a single darker shade band
rather than soft shadow. No modern anti-aliasing, no glow/bloom, no
outlined text unless specified. Hard pixel edges only. Background is a
single FLAT, SOLID colour with no gradient, texture, or shading of any
kind, filling every pixel not covered by the actual subject -- this flat
colour will be knocked out afterward in Photoshop, so it must be
perfectly uniform, right up to the edge of the art, with no soft/blurred
transition. Use the exact background colour stated in each prompt (white
unless the prompt says magenta). NO text, NO labels, NO annotations
anywhere on the image unless explicitly listed as in-image text in the
prompt.
```

---

## Prompt 1: Player Van — Steering & Light States
**Save as: `assets/van_player.png`** — background to key: **white**

```
Generate a pixel art sprite sheet for a racing game vehicle on a solid
flat white (#FFFFFF) background. NO text or labels. The background must
be pure, uniform white right up to the edge of every sprite -- no
gradient, no shadow cast onto it, nothing but flat #FFFFFF -- since it
will be knocked out in Photoshop afterward.

Vehicle: an Australia Post electric delivery van, seen from behind and
slightly above (rear three-quarter chase-cam view, the way the player's
car is drawn in Top Gear or F-Zero). Boxy compact van body, red with an
off-white roof and an off-white stripe across the rear doors (use a
warm off-white, NOT pure white, so it reads as distinct from the
background -- see palette below), small Australia Post red-circle logo
centred on the rear doors, twin rear brake lights, small roof-mounted
amber beacon light.

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

Colour palette: body red #C8202A, roof/stripe off-white #F2F0EA (NOT
#FFFFFF -- must be visibly distinct from the white background), window
tint dark blue-grey #2B3440, tyre/shadow black #1A1A1A, brake light red
#FF3B30, headlight warm yellow-white #FFE9A8, amber beacon #FFB020, snow
highlight #E8F0F5.

Output: single PNG, 160x128 pixels (5 columns x 4 rows of 32x32), flat
solid #FFFFFF background. Strict grid, no text.
```

---

## Prompt 2: Traffic Vehicles (rear view only — no oncoming lane)
**Save as: `assets/traffic.png`** — background to key: **white**

```
Generate a pixel art sprite sheet of road vehicles, all seen from directly
behind (rear view, straight-on, no perspective skew) for a racing game
where all traffic travels the same direction as the player, on a solid
flat white (#FFFFFF) background. NO text or labels. The background must
stay pure, uniform #FFFFFF right up to each vehicle's edge -- no
gradient or shadow bleeding into it -- it will be knocked out in
Photoshop afterward.

Strict grid, 32x32 pixels per frame, 6 columns x 1 row:
Cell 1: red sedan, rear view, tail lights visible.
Cell 2: light grey ute (pickup) with an open tray, rear view -- paint it
a clearly visible light grey, NOT white or near-white, so it reads as
distinct from the background (see palette below).
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
light grey (ute body) #D9D9D9 -- deliberately a clear grey, not white, so
it doesn't get erased along with the background -- green #3D6B35,
brown/dust #8A6D4B, blue #2C5F8A, tail light red #FF3B30. 1px dark
outline on all shapes.

Output: single PNG, 192x64 pixels total (192x32 top row of six 32x32
cells, 64x32 second row containing the wide road-train sprite left-
aligned, remainder flat solid #FFFFFF). No text.
```

---

## Prompt 3: Hazards
**Save as: `assets/hazards.png`** — background to key: **white**

```
Generate a pixel art sprite sheet of road hazards for an Australian-themed
racing game, on a solid flat white (#FFFFFF) background. NO text or
labels. Background must stay pure uniform #FFFFFF right to the edge of
every shape, no gradient or cast shadow onto it -- it will be knocked out
in Photoshop afterward.

Strict grid, 24x24 pixels per frame, 4 columns x 2 rows:
Row 1: kangaroo hop cycle, 4 frames, side-on silhouette mid-leap at
different heights (crouch, launch, apex, landing), warm brown-grey fur,
simple but readable pixel shape.
Row 2, cell 1: black ice patch, viewed as a road decal (flattened oval,
pale blue with a faint shine streak -- keep it a visibly blue-tinted
pale colour, not a near-white haze, so it stays distinct from the
background).
Row 2, cell 2: fallen tree branch across part of the road, brown with a
few green leaf clusters.
Row 2, cell 3: an unlit wooden farm gate post, dark silhouette, meant to
sit at the road edge.
Row 2, cell 4: a small reflective road-works witches-hat (traffic cone)
with a warning light on top -- its reflective bands should be a warm
off-white, NOT pure white (see palette).

Palette: kangaroo #9C8064 with darker #6E5644 shading, ice patch #B8DCE8
(a clearly blue-tinted pale, not near-white), branch #5B4430 with leaves
#4C7A3D, gate post #4A3A28, cone orange #FF6A1A with off-white bands
#F2F0EA (NOT #FFFFFF -- must read as distinct from the background).

Output: single PNG, 96x48 pixels (4 columns x 2 rows of 24x24), flat
solid #FFFFFF background. No text.
```

---

## Prompt 4: Leg 1 Environment — Suburban Sprint (afternoon, clear)
**Save as: `assets/env_leg1_suburban.png`** — Band 1 & 3: opaque, use as-is. Band 2 background to key: **magenta**

```
Generate a pixel art background tileset for a pseudo-3D racing game
(SNES Top Gear / F-Zero style), for a road segment strip renderer. NO
text or labels.

Layout, three horizontal bands stacked vertically, each 256px wide:

Band 1 - "far" parallax (256x48px), FULLY PAINTED, no background to
remove: bright blue afternoon sky with a dither gradient to pale horizon
haze, a few soft white clouds, faint distant suburban rooftops as a low
silhouette strip along the bottom edge. This band should have paint in
every pixel -- it's used as a solid backdrop layer, not cut out.

Band 2 - "mid" parallax (256x64px), painted on a solid flat MAGENTA
(#FF00FF) background: suburban street scene - single-storey brick and
weatherboard houses in varied pastel colours, Hills Hoist rotary
clotheslines in a couple of yards, a wheelie bin at a kerb, a
jacaranda-ish tree in bloom, front fences. This band's magenta
background will be knocked out in Photoshop to leave a scenery cutout
that gets layered over Band 1 in-engine -- keep the magenta perfectly
flat and uniform in every gap around and between the buildings/trees, no
gradient or shadow bleeding into it. Repeatable/tileable left-to-right.

Band 3 - road surface strip (256x16px), FULLY PAINTED, no background to
remove: warm grey asphalt with the classic alternating-shade "distance
banding" look (two slightly different grey tones alternating), pale
dashed centre line, lighter gravel-coloured shoulder edge on each side.

Output: single PNG, 256x128 pixels, three bands stacked in order (Band 1
top, Band 2 middle, Band 3 bottom). Band 1 and Band 3 fully painted
edge-to-edge; Band 2's non-scenery area flat solid #FF00FF. No text.
```

---

## Prompt 5: Leg 2 Environment — Highway Dash (dusk, light rain)
**Save as: `assets/env_leg2_highway.png`** — Band 1 & 3: opaque, use as-is. Band 2 background to key: **magenta**

```
Generate a pixel art background tileset for a pseudo-3D racing game,
matching the layout and technique of a "Leg 1 suburban" tileset but for a
dusk highway scene with light rain. NO text or labels.

Band 1 - far (256x48px), FULLY PAINTED, no background to remove:
dramatic dusk sky, dithered gradient from deep orange near the horizon
up through purple to dark blue at the top, a strip of low hills
silhouetted at the very bottom.

Band 2 - mid (256x64px), painted on a solid flat MAGENTA (#FF00FF)
background: highway shoulder scene - sparse gum trees, sound-barrier
fencing, a green highway distance sign (numbers/text blanked/abstracted,
not legible letters), sodium highway lighting poles with a warm glow
halo, faint rain streaks angled across this whole band at reduced
opacity. Keep the magenta perfectly flat in every gap -- it gets knocked
out in Photoshop to make this a scenery cutout layered over Band 1.

Band 3 - road surface (256x16px), FULLY PAINTED, no background to
remove: wet dark asphalt, alternating shade banding as before but darker
and with a few small bright reflective highlight streaks to read as
"wet", pale lane-line dashes.

Output: single PNG, 256x128 pixels, same band structure as the suburban
tileset -- Band 1 and 3 fully painted, Band 2's non-scenery area flat
solid #FF00FF. No text.
```

---

## Prompt 6: Leg 3 Environment — Country Backroads (night, fog)
**Save as: `assets/env_leg3_country.png`** — Band 1 & 3: opaque, use as-is. Band 2 background to key: **magenta**

```
Generate a pixel art background tileset for a pseudo-3D racing game, night
countryside scene with drifting fog. NO text or labels.

Band 1 - far (256x48px), FULLY PAINTED, no background to remove:
near-black night sky with a scatter of small white stars, a low pale
band of fog-glow along the horizon (soft dithered white-grey gradient),
one or two distant unlit silo silhouettes.

Band 2 - mid (256x64px), painted on a solid flat MAGENTA (#FF00FF)
background: dark paddock scene - post-and-wire farm fencing, scattered
gum trees as near-black silhouettes, a single distant farmhouse window
lit warm yellow, a patch of drifting fog rendered as a soft white-grey
cloud shape overlapping the lower half of this band. IMPORTANT: because
this band already contains pale white-grey fog, using magenta (not
white) for the actual background is what keeps the fog itself
selectable/keepable during the Photoshop cutout -- keep the magenta
perfectly flat everywhere the fog and silhouettes don't cover.

Band 3 - road surface (256x16px), FULLY PAINTED, no background to
remove: very dark asphalt, faint alternating shade banding barely
visible (this leg reads as low-visibility by design), centre line only
lightly visible, no shoulder detail.

Output: single PNG, 256x128 pixels, same band structure as prior
tilesets -- Band 1 and 3 fully painted, Band 2's non-scenery area flat
solid #FF00FF. No text.
```

---

## Prompt 7: Leg 4 Environment — Mountain Pass (deep night, snow/ice)
**Save as: `assets/env_leg4_mountain.png`** — Band 1 & 3: opaque, use as-is. Band 2 background to key: **magenta**

```
Generate a pixel art background tileset for a pseudo-3D racing game, a
snowy mountain road at deep night. NO text or labels.

Band 1 - far (256x48px), FULLY PAINTED, no background to remove: deep
blue-black night sky, jagged dark mountain silhouette along the bottom,
thin snow-capped ridgeline highlighted in pale blue-white, light
snowfall as small scattered white dots across the whole band.

Band 2 - mid (256x64px), painted on a solid flat MAGENTA (#FF00FF)
background: snow-laden pine trees in silhouette with snow-highlighted
tips, a low guardrail dusted with snow along the road edge, a couple of
roadside reflector posts, denser snowfall dots than band 1. IMPORTANT:
this band is full of white snow highlights -- magenta (not white) for
the actual background is what keeps all that snow safely intact during
the Photoshop cutout. Keep the magenta perfectly flat everywhere the
trees/guardrail/snow dots don't cover.

Band 3 - road surface (256x16px), FULLY PAINTED, no background to
remove: icy grey-blue asphalt with visible pale ice-sheen patches
breaking up the usual alternating shade banding, thin snow accumulation
along both shoulders as a white fringe.

Output: single PNG, 256x128 pixels, same band structure as prior
tilesets -- Band 1 and 3 fully painted, Band 2's non-scenery area flat
solid #FF00FF. No text.
```

---

## Prompt 8: Leg 5 Environment — Last Delivery (midnight, blizzard)
**Save as: `assets/env_leg5_final.png`** — Band 1 & 3: opaque, use as-is. Band 2 background to key: **magenta**

```
Generate a pixel art background tileset for a pseudo-3D racing game, the
final approach into a small town at midnight during heavy snowfall. NO
text or labels.

Band 1 - far (256x48px), FULLY PAINTED, no background to remove:
near-white-out dark sky, heavy dense snowfall as larger, denser white
dots/streaks than the mountain leg, a soft warm glow low on the horizon
suggesting the town's lights ahead.

Band 2 - mid (256x64px), painted on a solid flat MAGENTA (#FF00FF)
background: a street of small houses with warm lit windows and a couple
with visible string-light outlines (no readable text, just coloured dot
strings along a roofline), snow piled at kerbs, one lamp-post with a
warm light halo partly obscured by falling snow, a dense layer of
falling snow over the whole band. IMPORTANT: this is the snowiest band
in the whole game -- magenta (not white) for the background is essential
here, or the entire snow effect would be lost in the Photoshop cutout.
Keep the magenta perfectly flat everywhere the houses/snow/lamp-post
don't cover.

Band 3 - road surface (256x16px), FULLY PAINTED, no background to
remove: snow-covered road, mostly pale white-blue with only faint hints
of the alternating shade banding showing through, tyre-track darker
lines down the centre suggesting other traffic has passed.

Output: single PNG, 256x128 pixels, same band structure as prior
tilesets -- Band 1 and 3 fully painted, Band 2's non-scenery area flat
solid #FF00FF. No text.
```

---

## Prompt 9: Weather FX Sheet
**Save as: `assets/weather_fx.png`** — background to key: **magenta** (this sheet is almost entirely white/pale content — see note)

```
Generate a pixel art visual effects sheet for weather overlays in a
racing game, on a solid flat MAGENTA (#FF00FF) background. NO text or
labels. This sheet's actual content (snow, rain, fog, a whiteout) is
almost entirely white and pale blue-white -- magenta is used here
INSTEAD OF white specifically so none of that content gets mistaken for
background and erased during the Photoshop cutout. Keep the magenta
perfectly flat and uniform in every gap between effects, right up to
each shape's edge, no gradient or soft transition into it.

Strict grid layout:
Row 1 (y=0, 8x8 each, 4 frames): snowflake particle, 4 slightly different
small white/pale-blue flake shapes for variety when scattered.
Row 2 (y=8, 16x4 each, 3 frames): rain streak, a short diagonal pale blue
-white line, 3 slightly different lengths/angles for variety.
Row 3 (y=12, 64x24, single image): fog gradient patch, soft white-grey
radial dither cloud, fully opaque centre fading toward its own edge
(fading in DENSITY/dither pattern, not fading into transparency -- the
area outside the cloud shape itself is still flat magenta), meant to be
tiled/overlapped for drifting fog banks.
Row 4 (y=36, 32x16, single image): headlight cone glow, warm
yellow-white soft dithered triangular glow, pointing downward, fading
in density toward its point rather than fading into transparency.
Row 5 (y=52, 96x32, single image): blizzard whiteout gradient, a wide
soft white cloud, denser/whiter at centre and thinning in density toward
the edges (still a dithered pattern, not alpha transparency), for the
leg 5 visibility-cut effect.

Output: single PNG, 96x84 pixels total, flat solid #FF00FF background
throughout except where the effects themselves are painted. No text.
```

---

## Prompt 10: HUD & UI
**Save as: `assets/ui_hud.png`** — background to key: **white**

```
Generate pixel art UI elements for an SNES-style racing game HUD, on a
solid flat white (#FFFFFF) background. Background must stay pure,
uniform #FFFFFF right to the edge of every element -- it will be knocked
out in Photoshop afterward. NO text/numerals baked into the image UNLESS
specified below as digit glyphs.

Layout:
Row 1 (y=0): digital clock frame, 64x24px, a chunky dashboard-style
digital-clock bezel in dark red plastic with a slightly recessed black
screen area (numerals will be drawn separately by the game, leave the
screen area empty/dark).
Row 2 (y=24): a full set of digital clock digits 0-9 and a colon, SNES
LCD-style blocky segmented font, warm amber-on-black, each glyph in its
own 8x12px cell, 11 cells total (10 digits + colon).
Row 3 (y=36, after digits): analogue speedometer dial, 40x40px, dial
face in a warm tan colour #D8C8A0 (NOT cream or white -- must read as
clearly distinct from the background) with dark tick marks and a red
needle pivot point (needle itself will be drawn/rotated separately by
the game - just provide the static dial face and one separate needle
sprite beside it in a 4x16px cell).
Row 4 (y=76): five parcel-shaped leg-progress pip icons in a row, each
12x12px, brown cardboard-parcel shape with a small red bow, one "filled/
delivered" bright version and one "pending" dim/grey version side by
side (use a visible mid-grey for "pending", not a pale near-white, so it
stays distinct from the background -- so 10 icons total: 5 pending + 5
filled, alternating).
Row 5 (y=88): a wide milestone banner frame, 160x20px, festive red and
gold ribbon-banner shape with a slightly scalloped bottom edge, empty
centre area for game-drawn text.

Output: single PNG, 200x108 pixels, flat solid #FFFFFF background. No
text except the digit/colon glyphs explicitly requested in Row 2.
```

---

## Prompt 11: Title & Cutscene Art
**Save as: `assets/scene_title.png`, `assets/scene_ending.png`, `assets/scene_fail.png`** — fully opaque, nothing to key

```
[Use once per scene below, each as its own generation - these are
full-frame illustrated backgrounds, not tile/sprite sheets, painted edge
-to-edge with no background colour to remove afterward, in the same
SNES 16-bit dithered pixel-art style as the rest of this sheet.]

Scene A - TITLE (save as assets/scene_title.png): An Australia Post
delivery van pulling out of a depot gate at dusk, seen from a low
three-quarter angle (not the in-game rear chase-cam - this one can show
the van's side/front for character), orange dusk sky behind it, a string
of fairy lights along the depot fence, motion-blur dust behind the rear
wheels suggesting urgency. Leave the top third of the image relatively
clear/uncluttered sky for a game logo to be overlaid separately. No text
in the image itself. 256x144 pixels, fully painted edge-to-edge.

Scene B - ENDING (save as assets/scene_ending.png): the same van parked
in a driveway at night, driver's silhouette carrying a parcel toward a
front door, porch light on, warm light spilling from a window, snow
lightly falling, a decorated tree visible through the window. No text.
256x144 pixels, fully painted edge-to-edge.

Scene C - FAIL (save as assets/scene_fail.png): the same van stopped on
a dark road, its headlights the only light source, a house visible in
the distance with its porch light just switching off (draw it dim/off,
not lit), gentle rather than bleak in mood - overcast night, not
horror-movie dark. No text. 256x144 pixels, fully painted edge-to-edge.
```

---

## Prompt 12: Coach — Title Screen Illustration
**Save as: `assets/coach_title.png`** — background to key: **white**

```
Art style: SNES-era 16-bit character illustration (Top Gear / F-Zero /
Rock n' Roll Racing, 1991-1993 title-screen quality). Chunky confident
pixel art, 1px dark outline, dithered gradient shading, saturated colour
palette, no modern anti-aliasing or glow. Solid flat white (#FFFFFF)
background, perfectly uniform right up to her silhouette's edge -- it
will be knocked out in Photoshop afterward. NO text, NO labels anywhere
on the image.

Character: "Coach", an Australia Post depot supervisor for the
Christmas "Peak" season. Woman with dark hair pulled up into a high bun,
warm confident open-mouthed smile, mid-call-out expression. Wearing a
red zip-up track jacket with off-white piping down each sleeve (use a
warm off-white #F2F0EA, NOT pure white, so it reads as distinct from the
background), an off-white t-shirt underneath (same #F2F0EA, not pure
white), a whistle on a lanyard, and a small circular Australia Post logo
patch on the right chest. Standing at a three-quarter angle, one hand on
her hip, the other raised holding an off-white megaphone (#F2F0EA again,
not pure white) with a red bell, as if calling out to someone driving
away from her.

Pose and framing: waist-up to just-above-the-knees, angled so she reads
as looking out toward the bottom-right of the frame (toward where a
delivery van would be pulling away in a composited title screen). Warm
dusk rim-lighting on her hair and shoulder from one side, consistent
with a depot-at-dusk setting.

Output: single PNG, 120x160 pixels, flat solid #FFFFFF background,
character only (no background elements, no depot props) so it can be
composited over a separate title background. No text.
```

---

## Prompt 13: Coach — In-Game Radio Portrait Sheet
**Save as: `assets/coach_portrait.png`** — background to key: **white**

```
Art style: SNES-era 16-bit dialogue/portrait art (the small talking-head
boxes used in SNES RPGs and racing-game pit-crew call-ins). Chunky
pixel art, 1px dark outline, dithered gradient shading, saturated
colour palette, no modern anti-aliasing or glow. Solid flat white
(#FFFFFF) background, perfectly uniform right up to her silhouette's
edge -- it will be knocked out in Photoshop afterward. NO text, NO
labels.

Character: "Coach" (see title-screen prompt for full description — dark
hair in a high bun, red Australia Post track jacket with off-white
#F2F0EA sleeve piping (not pure white), circular logo patch), shown here
as a head-and-shoulders bust portrait only, front-on, filling most of
each grid cell, consistent proportions and framing across every cell so
they can be swapped frame-to-frame without jittering.

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

Output: single PNG, 80x120 pixels (2 columns x 3 rows of 40x40), flat
solid #FFFFFF background. No text.
```

---

## How to use

1. Copy the **Style Guide** block and paste it at the start of every
   prompt (except Prompts 11-13, which already embed their own style/scene
   descriptions inline and intentionally break from the tile-grid
   framing).
2. Generate each prompt, then in Photoshop: Select > Color Range, click
   the flat background colour (white for most sheets, magenta for
   Prompts 4-9's Band 2 / weather FX), Delete, then File > Export As PNG
   with transparency. Save under the exact filename listed — this keeps
   them drop-in compatible with the module layout suggested in
   `../README.md` §9 once the game is implemented. A 0px feather and a
   small (~10-15) tolerance usually gets a clean cutout given how flat
   the requested background is; nudge tolerance up only if AI-generated
   edge dither leaves a visible fringe.
3. For Prompts 4-8, only Band 2 (the middle third of the image) needs
   this treatment — Bands 1 and 3 are meant to stay exactly as generated,
   fully opaque, no cutout.
4. Keep the five environment tilesets (Prompts 4-8) visually consistent in
   *technique* (same band heights, same alternating-shade road banding)
   even as palette and mood shift leg to leg — that consistency is what
   sells the single continuous evening the countdown clock is tracking.
5. Generate Coach (Prompts 12-13) after the title/cutscene art (Prompt
   11) and check her against it side by side — she should read as the
   same character in both, just at different scales and framing.
