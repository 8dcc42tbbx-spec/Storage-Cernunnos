Painted art overrides, generated from prompts/gemini-art-prompts.md.

All 17 are present and in use. Each has been centre-cropped to the aspect
its on-screen slot needs and downsampled (Lanczos) to the exact pixel size
the game draws it at, so nothing is stretched and the canvas upscale stays
crisp:

  320x240  title, cave_backdrop, ending_{great,narrow,caught}
  280x220  cyclops_{idle,angry,pleased,laugh,sleeping}
  312x118  scene_q1..q7

These are optional. Delete any file and the game silently falls back to the
built-in procedural pixel art for that slot (see js/images.js).
