# Gemini Art Prompts for Postie Run

Use these prompts with Google Gemini (or Imagen) to generate replacement sprite assets for the programmatic pixel art in Postie Run. Each prompt targets a specific sprite sheet. All assets should be generated at the specified pixel dimensions with transparent backgrounds.

---

## Style Guide (Include with every prompt)

> **Art style reference**: Metal Slug (SNK, 1996) pixel art. Bubbly, exaggerated proportions — big heads (about 1/3 of character height), short stubby bodies, small legs. Thick 1-2 pixel black outlines on all characters. Bright, saturated colors with cel-shading style highlights. Early-to-mid 1990s arcade aesthetic. 16-bit era pixel art. Transparent background (PNG). No anti-aliasing — hard pixel edges only.

---

## Prompt 1: Ernie the Postie (Player Character Sprite Sheet)

Generate a pixel art sprite sheet for a video game character. The character is "Ernie", an Australian postman (postie) in the style of Metal Slug arcade game characters.

**Character description**: Male postie wearing an Australia Post uniform — bright red polo shirt with a yellow hi-vis stripe across the chest, navy blue shorts, red cap with white Australia Post logo, brown leather satchel bag slung across his body, black work boots. Light skin, short brown hair visible under the cap. Bubbly Metal Slug proportions — big round head (1/3 of height), stubby body, short legs.

**Sprite sheet layout** (16x24 pixels per frame, arranged in rows):
- Row 1: Idle (2 frames — subtle breathing animation)
- Row 2: Run cycle (4 frames — exaggerated bouncy run)
- Row 3: Jump ascending (1 frame), Jump descending/falling (1 frame)
- Row 4: Shooting (1 frame — arm extended forward throwing a parcel), Shooting while crouching (1 frame)
- Row 5: Crouching/ducking (1 frame)
- Row 6: Taking damage/hurt (1 frame — knocked back expression)
- Row 7: Death animation (3 frames — comical collapse, Metal Slug style)

**Color palette**: Red (#CC2200), Yellow hi-vis (#FFD700), Skin (#F5C6A0), Navy pants (#1A1A5A), Brown satchel (#8B4513), Black boots (#2A2A2A), White (#FFFFFF), Black outline (#000000)

**Output**: Single PNG sprite sheet, 128x192 pixels (8 columns x 8 rows of 16x24 frames), transparent background.

---

## Prompt 2: eDV Electric Delivery Vehicle

Generate a pixel art sprite of an Australia Post electric delivery vehicle (eDV) for a Metal Slug-style arcade game.

**Vehicle description**: Small red and white electric delivery van, resembling a miniaturised Australia Post delivery vehicle. Rounded, bubbly shape like a Metal Slug tank. Red body (#CC2200) with white panels (#F0F0F0). Australia Post yellow stripe. Small windshield (#AADDFF). Chunky black wheels with grey hubcaps. The vehicle should look like a cute, cartoonish version of a real eDV.

**Two versions**:
1. Empty vehicle (32x20 pixels) — no driver visible
2. Manned vehicle (32x20 pixels) — Ernie visible in the cab wearing his red cap, waving

**Output**: Single PNG, 64x20 pixels (2 frames side by side), transparent background.

---

## Prompt 3: Enemy Sprite Sheets

Generate pixel art enemy sprites for a Metal Slug-style Australian postie arcade game. All enemies should have exaggerated, cartoony Metal Slug proportions and thick black outlines.

### 3A: Angry Dog (16x12 pixels, 2 run frames)
Brown medium-sized dog (could be a cattle dog mix), angry expression with bared teeth, running on all fours. Exaggerated big head, small body. Looks aggressive but cartoonish.

### 3B: Swooping Magpie (16x12 pixels, 2 flap frames + 1 swoop/dive frame)
Australian magpie — black and white plumage, sharp yellow beak. Two frames of level flight (wings up/down), one frame of aggressive downward swoop with beak pointed at player. Classic Aussie magpie terror.

### 3C: Amazon Delivery Van (48x28 pixels, 1 frame)
Dark blue delivery van with the Amazon smile/arrow logo in orange on the side. Menacing front grille, bright headlights. Chunky wheels. Should look like an oversized threat barrelling toward the player.

### 3D: Angry Person (14x24 pixels, 2 frames)
Angry suburban resident in casual clothes, waving a red-and-white "Sorry We Missed You" card. Two frames alternating the card-waving animation. Furious expression. Metal Slug civilian proportions.

### 3E: Wheelie Bin (12x16 pixels, 1 frame)
Standard Australian green wheelie bin with yellow lid. Simple but recognisable. Slight anthropomorphic menace optional.

### 3F: Lawn Mower (20x14 pixels, 1 frame)
Red ride-on lawn mower, unmanned, looking dangerous. Spinning blade effect on front. Exhaust smoke puff.

### 3G: Cat on Fence (12x14 pixels, 2 frames — sitting, swiping)
Orange tabby cat sitting on a fence, then swiping with paw extended. Green eyes, angry expression. Classic suburban menace.

### 3H: Emu (20x24 pixels, 2 run frames)
Large Australian emu running with long legs. Brown feathered body, long neck, beady eyes. Looks like it could win another Emu War. Metal Slug big-head style.

### 3I: Drop Bear (14x14 pixels, 1 frame)
Mythical Australian drop bear — grey koala-like creature with red eyes, sharp teeth, and claws. Menacing but cute. Falling pose with arms spread.

### 3J: Road Train (64x24 pixels, 1 frame)
Massive outback road train — truck cab pulling two trailers. Rust red/orange cab, grey trailers, huge bull bar on front. Multiple wheels. Should look intimidatingly large.

### 3K: BOSS: Giant Rottweiler (48x40 pixels, 2 frames)
Enormous rottweiler — black and tan coloring, spiked collar, glowing red eyes, bared teeth with drool. Two frames: standing menacingly, and mid-charge/lunge. Should be at least 3x the size of the player. Pure intimidation. Metal Slug boss energy.

### 3L: Chihuahua (10x8 pixels, 2 run frames)
Tiny tan chihuahua, disproportionately large head with huge eyes, trembling with rage. Comically small but aggressive. Boss summon minion.

**Output**: Each enemy as a separate PNG sprite sheet with all frames arranged horizontally, transparent backgrounds.

---

## Prompt 4: Projectile & Pickup Sprites

Generate pixel art items and projectiles for a Metal Slug-style postie game.

### Projectiles (transparent background):
- **Parcel** (8x6 px): Brown cardboard box with packing tape stripe. The classic Australia Post parcel.
- **Cannon Parcel** (6x5 px): Smaller, faster parcel with a yellow speed trail.
- **Letter** (5x3 px): White envelope with blue stamp in corner.
- **Ninja Stamp** (10x10 px, 4 rotation frames): Red rubber stamp shaped like a shuriken star. White cross/kanji pattern. "DELIVERED" text visible when not spinning. Spins through the air like a throwing star. 4 frames at 0°, 90°, 180°, 270° rotation.
- **"DELIVERED" Stamp Mark** (14x8 px): Red ink stamp impression reading "DELIVERED!" — appears on enemies hit by the Ninja Stamp.
- **Sorry We Missed You Card** (8x6 px): Enemy projectile — white card with red header stripe.

### Pickups (transparent background, 12x10 px each):
- **Cannon Pickup**: Gold box with "C" marking
- **Spray Pickup**: Blue box with "S" marking
- **Stamp Pickup**: Red box with star/shuriken marking
- **Health Pickup**: White box with red cross
- **eDV Pickup**: Gold box with small red vehicle silhouette

**Output**: Single PNG with all items arranged in a grid, transparent background.

---

## Prompt 5: Background Tilesets (5 themes)

Generate pixel art tileset backgrounds for a Metal Slug-style side-scrolling game set in Australia. Each theme needs parallax layers.

### 5A: Suburban (Levels 1-4)
Quiet Australian suburban street. Weatherboard houses with corrugated iron roofs, white picket fences, green lawns, gum trees (eucalyptus), letterboxes, garden beds. Blue sky with fluffy clouds. Warm, inviting colors. Two parallax layers: far houses (muted) and near houses/fences (detailed).

### 5B: Urban (Levels 5-8)
Australian city street. Multi-story buildings, shop awnings, apartment blocks with balconies, traffic lights, power lines, parked cars. Concrete and asphalt tones. More grey and steel, but still the bright Metal Slug palette. Office buildings with lit windows.

### 5C: Regional Town (Levels 9-12)
Country Australian town. Wide main street, pub with verandah, grain silos in background, wide open sky, windmills, ute trucks, gum trees. Earthy greens and browns. Countryside feel with distant hills.

### 5D: Coastal Town (Levels 13-16)
Australian beach town. Sandy ground, Norfolk pines/palm trees, surf club, pastel-colored beach houses, boardwalk planks, ocean visible in background. Bright blues and sandy yellows. Relaxed but colorful.

### 5E: Outback (Levels 17-20)
Red Centre Australian outback. Red/orange dirt ground, sparse dead trees, distant red rock formations (Uluru-esque silhouette in far background), massive blue sky, dust in the air, heat shimmer. Rust reds, burnt oranges, deep blue sky. Dramatic and sparse.

**For each theme provide**:
- Ground tile (16x16 px) — surface and sub-surface
- Sky gradient colors (top and bottom)
- Far parallax layer — buildings/landscape silhouettes (256x64 px repeating)
- Near parallax layer — detailed buildings/objects (256x96 px repeating)

**Output**: 5 separate PNG files, one per theme.

---

## Prompt 6: UI Elements

### Title Logo
"POSTIE RUN" in bold, chunky pixel art lettering. Red and yellow color scheme matching Australia Post branding. Metal Slug-style arcade game logo with slight 3D beveled effect. 160x40 pixels.

### Delivery Targets
- **House** (32x32 px): Typical Australian suburban house — brick/weatherboard walls, pitched roof, front door, windows, small front yard, red Australia Post mailbox at the front.
- **Parcel Locker** (24x32 px): Red Australia Post parcel locker unit with multiple compartment doors, each with a small keyhole. Yellow stripe and logo at top.

### HUD Icons
- **Postie Hat** (8x6 px): Small red Australia Post cap icon for lives display
- **Heart** (8x8 px): Health icon
- **Arrow/marker** (8x8 px): Delivery direction indicator

---

## Prompt 7: Explosion & Effect Sprites

Generate pixel art explosion and effect animations for a Metal Slug-style game.

### Explosion (4 frames, sizes 8px, 14px, 20px, 26px diameter)
Metal Slug-style explosion sequence. Frame 1: Small white flash. Frame 2: Expanding orange/yellow fireball. Frame 3: Larger fireball with smoke edges. Frame 4: Dissipating smoke puffs. Bright saturated colors: white center (#FFFFFF), yellow (#FFCC00), orange (#FF6600), red (#FF2200), grey smoke (#888888).

### Dust Puff (3 frames, 8x8 px each)
Small tan/brown dust cloud for landing and running. Grows and fades.

### Water Splash (3 frames, 8x8 px each)
Blue water droplets arcing upward then falling. For sprinkler/hose effects.

### Muzzle Flash (2 frames, 6x6 px)
Small yellow-white flash at the shooting point.

**Output**: Single PNG sprite sheet with all effect frames, transparent background.

---

## Usage Notes

1. **Resolution**: The game runs at 320x240 pixels scaled 3x. All sprites should be at the exact pixel dimensions specified — they will appear chunky and retro at display size.

2. **Transparency**: All sprites MUST have transparent backgrounds (PNG-24 with alpha).

3. **Outline**: Every character/object sprite should have a 1px black (#000000) outline for that authentic Metal Slug look.

4. **Integration**: To use generated sprites in the game, they would replace the programmatic canvas-drawn sprites in `sprites.js`, `sprites-enemies.js`, `sprites-effects.js`, and `sprites-env.js`. Each sprite would be loaded as an Image element and drawn via `ctx.drawImage()` instead of the current pixel-map approach.

5. **Color consistency**: Stick to the palette defined in `js/constants.js` under `PR.CONST.COL` for character and enemy colors to maintain visual consistency.
