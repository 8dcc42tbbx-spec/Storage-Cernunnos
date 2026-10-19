# Trivia Trixie's Wishing Quiz

A kid-friendly trivia game show. You're a contestant on Trivia Trixie the Fabulous
Fairy's show — answer 7 out of 10 multiple-choice questions correctly to win a
magical wish. Questions are drawn randomly from a bank of 200, across 21 topics kids
love: SpongeBob, Ninja Turtles, ZOMBIES, Descendants, The Simpsons, Spirited Away,
Christmas, Easter, The Grinch, Dr. Seuss, The Cat in the Hat, Elf, lollies, fairies,
The Magic Faraway Tree, Ghostbusters, toys, Toy Story, Pixar movies, Disney movies,
and general kids' pop culture.

## Play it

Just open `index.html` in a browser — no build step, no server required (though
serving it locally, e.g. `python3 -m http.server`, works fine too and is needed if
your browser blocks `file://` fetches).

The game is fully playable right now with a charming emoji/gradient look. Dropping
real art into `assets/` (see below) upgrades the visuals with no code changes needed.

## Adding the art

See `prompts/gemini-art-prompts.md` for the full set of Gemini image prompts. Generate
each one and save it to `assets/` under the exact filename listed — the game detects
whatever's present and quietly falls back to its default look for anything missing,
so you can add art incrementally in any order.

## Structure

```
index.html          Entry point
css/style.css        All styling (magical fairy game-show theme)
js/constants.js      Game constants (pass threshold, wish flavor text, etc.)
js/questions.js      The 200-question bank
js/game.js           State machine, rendering, audio, asset loading
assets/              Art drops in here (see prompts/)
prompts/             Gemini art prompt sheet
```

## How it works

- Each round randomly samples 10 unique questions from the 200-question bank, and
  shuffles each question's 4 answer choices.
- Score 7+ out of 10 to win a wish (10/10 gets a special "perfect score" ending).
- Score below 7 gets a warm, encouraging "try again" screen — never a harsh game-over.
- Playable by mouse/touch, or by keyboard: Enter/Space to start or continue, number
  keys 1-4 to pick an answer.
