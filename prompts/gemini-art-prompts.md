# Gemini Art Prompts for Postie Run (v2 - Clean Sprite Sheets)

Use these prompts with Google Gemini to generate sprite assets. These produce CLEAN sprite sheets with NO text labels, on strict grids, ready to drop into the `assets/` folder.

**IMPORTANT**: After each prompt, save the output PNG to the specified filename in the `assets/` folder.

---

## Style Guide (Copy this into EVERY prompt)

```
Art style: Metal Slug (SNK, 1996) pixel art. Bubbly exaggerated proportions - big heads (1/3 of character height), stubby bodies, small legs. Thick 1-2 pixel black outlines on all characters. Bright saturated colors. Early-to-mid 1990s 16-bit arcade aesthetic. Transparent PNG background. Hard pixel edges only, no anti-aliasing. NO text, NO labels, NO annotations anywhere on the image.
```

---

## Prompt 1: Player Sprite Sheet
**Save as: `assets/player.png`**

```
Generate a pixel art sprite sheet for a video game character on a transparent background. NO text or labels anywhere.

Character: "Ernie", an Australian postman (postie) wearing Australia Post uniform - bright red polo shirt with yellow hi-vis stripe across chest, navy blue shorts, red cap with white logo, brown leather satchel bag, black work boots. Light skin, short brown hair. Metal Slug bubbly proportions.

Sprite sheet layout - strict grid, 16x24 pixels per frame:
- Row 1 (y=0): 2 idle frames (subtle breathing)
- Row 2 (y=24): 4 run cycle frames (bouncy exaggerated run)
- Row 3 (y=48): Jump frame, Fall frame
- Row 4 (y=72): Shooting frame (arm forward throwing parcel), Crouching frame
- Row 5 (y=96): Hurt frame (knocked back), Death frame 1 (arms up)
- Row 6 (y=120): Death frame 2 (falling), Death frame 3 (on ground, 24x12 pixels)

Color palette: Red #CC2200, Yellow #FFD700, Skin #F5C6A0, Navy #1A1A5A, Brown #8B4513, Black #2A2A2A, White #FFFFFF, Outline #000000

Output: Single PNG, 64x144 pixels (4 columns x 6 rows), transparent background. Strict 16x24 grid. No text.
```

---

## Prompt 2: eDV Vehicle
**Save as: `assets/edv.png`**

```
Generate a pixel art sprite of an Australia Post eDV electric delivery vehicle on transparent background. NO text or labels.

The eDV is a small 3-wheeled electric scooter/trike with an enclosed cargo box. Red and white color scheme with Australia Post branding (red circle logo). Has a clear windshield dome.

Layout - strict grid, 64x32 pixels per frame:
- Left frame (x=0): eDV vehicle empty, side view facing right
- Right frame (x=64): eDV with driver (Ernie the postie visible through windshield, waving)

Metal Slug arcade pixel art style. Thick black outlines. Bright colors.
Colors: Red #CC2200, White #F0F0F0, Grey #888888, Black outline #000000, Skin #F5C6A0

Output: Single PNG, 128x32 pixels (2 frames side by side), transparent background. No text.
```

---

## Prompt 3: Enemy Sprites
**Save as: `assets/enemies.png`**

```
Generate a pixel art enemy sprite sheet for an Australian-themed arcade game. NO text or labels. Metal Slug style. Transparent background.

Strict grid layout, each enemy in its own row:

Row 1 (y=0, 16x12 each): Angry brown dog - 2 run frames (mouth open, snarling)
Row 2 (y=12, 16x12 each): Swooping magpie - 2 flap frames + 1 diving frame
Row 3 (y=24, 16x12 each): Seagull - 2 flap frames (white/grey recolor of magpie)
Row 4 (y=36, 48x28): Amazon delivery van - dark blue with orange arrow logo, 1 frame
Row 5 (y=64, 16x24 each): Angry person with "Sorry We Missed You" card - 2 frames
Row 6 (y=88, 12x16): Green wheelie bin with yellow lid - 1 frame
Row 7 (y=104, 20x14): Red ride-on lawn mower - 1 frame
Row 8 (y=118, 12x14 each): Orange tabby cat - 2 frames (sitting, swiping)
Row 9 (y=132, 20x24 each): Brown emu - 2 walk frames
Row 10 (y=156, 14x14): Drop bear (aggressive grey koala) - 1 frame
Row 11 (y=170, 64x24): Road train truck - 1 frame
Row 12 (y=194, 48x40 each): Giant Rottweiler boss - 2 attack frames (massive, red eyes, drooling)
Row 13 (y=234, 10x8 each): Chihuahua - 2 run frames (tiny, yapping)

Output: Single PNG, 128x242 pixels, transparent background. No text, no labels.
```

---

## Prompt 4: Projectiles & Pickups
**Save as: `assets/projectiles.png`**

```
Generate pixel art projectiles and pickup items for an Australian postman arcade game. NO text or labels. Metal Slug style. Transparent background.

Strict grid layout:

Row 1 (y=0): Projectiles, 10x10 grid per cell
- Cell 1: Brown cardboard parcel box (8x6 px, centered in cell)
- Cell 2: Cannon parcel with fire trail (6x5 px)
- Cell 3: White envelope letter (5x3 px)
- Cell 4-7: Red ninja stamp shuriken, 4 rotation frames (10x10 px, red star shape with "DELIVERED" text)
- Cell 8: Red "DELIVERED" stamp mark (14x8 px)
- Cell 9: White "Sorry We Missed You" card (8x6 px)

Row 2 (y=10): Pickup items, 14x14 grid per cell
- Cell 1: Cannon pickup box (gold box with "C")
- Cell 2: Spray pickup box (blue box with "S")
- Cell 3: Stamp pickup box (red box with star)
- Cell 4: Health pickup (white box with red cross)
- Cell 5: eDV pickup (gold box with vehicle icon)

Output: Single PNG, 126x24 pixels, transparent background. No text outside the sprites themselves.
```

---

## Prompt 5: Background Tilesets
**Save as: `assets/backgrounds.png`**

```
Generate pixel art background tilesets for 5 Australian environment themes. NO text or labels. 16-bit arcade style. Transparent background where noted.

Layout - 5 theme rows, each row contains:
- Ground tile (16x16, repeating) at x=0
- Far parallax background (256x64) at x=16
- Near parallax foreground (256x96) at x=272

Theme rows:
1. SUBURBAN (y=0): Green grass ground tile. Far: blue sky with clouds, distant houses silhouettes. Near: Houses with red/brown roofs, picket fences, trees, letterboxes, gardens.

2. URBAN (y=96): Grey concrete ground tile. Far: city skyline with tall buildings, grey sky. Near: Shops, traffic lights, power lines, parked cars, bins.

3. REGIONAL (y=192): Brown-green grass ground tile. Far: rolling hills, windmills, distant silos. Near: Country pub, general store, farm fences, gum trees.

4. COASTAL (y=288): Sandy ground tile. Far: ocean horizon, lighthouse, blue sky. Near: Beach houses, palm trees, surf shop, beach fence, sand dunes.

5. OUTBACK (y=384): Red dirt ground tile. Far: Uluru/red rock formations, orange sky. Near: Dusty road, dead trees, outback pub, rusty ute.

Output: Single PNG, 528x480 pixels. No text.
```

---

## Prompt 6: UI Elements
**Save as: `assets/ui.png`**

```
Generate pixel art UI elements for an arcade game called "Postie Run". Metal Slug style. Transparent background. NO text labels on the image.

Layout:
- Row 1 (y=0): "POSTIE RUN" title logo, 160x40 pixels. Bold red and gold arcade text with sparkle effects, thick black outline. Dramatic and eye-catching.

- Row 2 (y=40): Delivery house, 32x32 pixels. Australian suburban house with pitched roof, front door, windows, mailbox, garden. Pixel art.

- Row 3 (y=72): Parcel locker, 24x32 pixels. Red Australia Post parcel locker unit with multiple compartment doors and Australia Post logo.

- Row 4 (y=104): HUD icons, 8x8 pixels each in a row:
  - Postie hat icon (red cap)
  - Heart icon (red heart)  
  - Arrow/marker icon (gold arrow pointing right)
  - Grenade icon (small bomb)

Output: Single PNG, 160x112 pixels, transparent background. No text labels.
```

---

## Prompt 7: Effects
**Save as: `assets/effects.png`**

```
Generate pixel art visual effect animations for an arcade game. Metal Slug style. Transparent background. NO text or labels.

Strict grid layout:

Row 1 (y=0, 32x32 each): Explosion - 4 frames expanding from small spark to large fireball to smoke. Orange/yellow/red with white hot center.

Row 2 (y=32, 32x32): Smoke cloud - 1 large grey smoke puff, semi-transparent look.

Row 3 (y=64, 8x8 each): Dust puff - 3 frames, small brown cloud appearing and dissipating.

Row 4 (y=72, 8x8 each): Water splash - 3 frames, blue droplets arcing up then falling.

Row 5 (y=80, 8x8 each): Muzzle flash - 2 frames, yellow-orange star burst.

Output: Single PNG, 128x88 pixels, transparent background. No text.
```

---

## How to Use

1. Copy the **Style Guide** text and paste it at the start of each prompt
2. Copy the specific prompt (1-7) and paste it after the style guide
3. Generate the image in Gemini
4. Save the output PNG with the filename shown (e.g. `assets/player.png`)
5. Open `index.html` in your browser - the game will automatically detect and use the sprite images
