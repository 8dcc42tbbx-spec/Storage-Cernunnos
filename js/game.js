// State machine + main loop. The whole game is host-paced: one person runs
// the keyboard while the room writes answers on paper, so every transition
// waits for a keypress rather than a fixed timer (except the countdown bar,
// which is advisory and never forces a transition on its own).
var CY = CY || {};
CY.Game = (function () {
    var canvas, ctx;
    var state = 'TITLE';
    var pageIndex = 0;
    var riddleIndex = 0; // 0-based into CY.QUESTIONS
    var escapeScore = 0;
    var timerStart = 0;
    var timerRunning = false;
    var lastTickSecond = -1;
    var picked = null;       // the room's locked-in answer for the current riddle
    var lastResult = null;   // 'correct' | 'wrong' | 'none' -- drives the taunt
    var taunt = '';          // chosen once per round, never inside draw()

    // Portrait framing. The Cyclops is shrunk to fit entirely inside this
    // height above the text rather than cropped to fill it -- the expression
    // lives in the eye and the mouth together, and any crop tight enough to
    // fill a wide slot loses one of them.
    // 164 is the most the portrait can take while still leaving room below for
    // the counter, a three-line taunt and the prompt without anything colliding.
    var FACE_H = 164;

    var CRAWL = [
        'YOU ARE ODYSSEUS, KING OF ITHACA, BLOWN OFF COURSE SAILING HOME FROM TROY.',
        'YOUR SHIP TOOK SHELTER IN A SEASIDE CAVE -- THE LAIR OF THE CYCLOPS POLYPHEMUS.',
        'HE HAS ROLLED A BOULDER ACROSS THE ENTRANCE. YOU AND YOUR CREW ARE TRAPPED.',
        'BUT THE CYCLOPS IS STRANGELY OBSESSED WITH A NEW EPIC FROM THE MORTAL WORLD...'
    ];
    var CYCLOPS_INTRO = [
        'HOO HOO! FRESH VISITORS! I AM POLYPHEMUS, SON OF POSEIDON!',
        'I HEAR YOUR PEOPLE MADE A FILM OF YOUR LITTLE VOYAGE -- A CHRISTOPHER NOLAN PICTURE, NO LESS.',
        'ANSWER MY SEVEN RIDDLES ABOUT "THE ODYSSEY" TRUTHFULLY, AND THE BOULDER MOVES ASIDE.',
        'ANSWER POORLY... AND YOU PEEL MY POTATOES FOREVER. HA HA HA! BEGIN!'
    ];

    function q() { return CY.QUESTIONS[riddleIndex]; }

    function endingTier() {
        return escapeScore >= 6 ? 'great' : (escapeScore >= 3 ? 'narrow' : 'caught');
    }

    function goto(next) {
        state = next;
        pageIndex = 0;
    }

    function startTimer() {
        timerStart = performance.now();
        timerRunning = true;
        lastTickSecond = -1;
    }

    function timeLeftSeconds() {
        var elapsed = (performance.now() - timerStart) / 1000;
        return Math.max(0, CY.TIMER_SECONDS - elapsed);
    }

    // Lock in the room's guess (0-3), or null when nobody answered / time ran out.
    // The game adjudicates immediately -- the host never has to score anything.
    function pick(index) {
        picked = index;
        state = 'REVEAL';
        timerRunning = false;
        CY.Audio.stopMusic(); // drop the tension bed so the verdict lands clean
        if (index !== null && index === q().correct) {
            lastResult = 'correct';
            escapeScore++;
            CY.Audio.correct();
            CY.Audio.cyclopsPleased();
        } else {
            lastResult = index === null ? 'none' : 'wrong';
            CY.Audio.wrong();
            CY.Audio.cyclopsAngry();
        }
    }

    // Single entry point into the between-riddle beat, so the taunt is chosen
    // exactly once per round rather than re-rolled every animation frame.
    function enterRiddleIntro() {
        taunt = CY.pickTaunt(lastResult || 'opening');
        goto('RIDDLE_INTRO');
    }

    function nextRiddle() {
        riddleIndex++;
        picked = null;
        if (riddleIndex >= CY.QUESTIONS.length) {
            goto('ENDING');
            var tier = endingTier();
            if (tier === 'great') { CY.Audio.cyclopsRoar(); CY.Audio.playMusic('endGreat'); }
            else if (tier === 'narrow') { CY.Audio.cyclopsSnore(); CY.Audio.playMusic('endNarrow'); }
            else { CY.Audio.cyclopsLaugh(); CY.Audio.playMusic('endCaught'); }
        } else {
            enterRiddleIntro();
        }
    }

    function restart() {
        riddleIndex = 0;
        escapeScore = 0;
        picked = null;
        lastResult = null;
        goto('TITLE');
        CY.Audio.playMusic('title');
    }

    // action is 'ADVANCE' | 'A' | 'B' | 'C' | 'D' -- shared by the keyboard
    // handler and the on-screen touch buttons so both drive identical logic.
    function dispatch(action) {
        CY.Audio.unlock();
        var advance = action === 'ADVANCE';
        var letterIndex = ['A', 'B', 'C', 'D'].indexOf(action);

        switch (state) {
            case 'TITLE':
                if (advance) { CY.Audio.select(); goto('CRAWL'); }
                break;
            case 'CRAWL':
                if (advance) {
                    CY.Audio.select();
                    if (pageIndex < CRAWL.length - 1) pageIndex++;
                    else { CY.Audio.cyclopsRoar(); goto('CYCLOPS_INTRO'); }
                }
                break;
            case 'CYCLOPS_INTRO':
                if (advance) {
                    CY.Audio.select();
                    if (pageIndex < CYCLOPS_INTRO.length - 1) pageIndex++;
                    else {
                        // Opening credits end here; the tension bed takes over
                        // once a riddle is actually on screen.
                        CY.Audio.stopMusic();
                        CY.Audio.cyclopsLaugh();
                        enterRiddleIntro();
                    }
                }
                break;
            case 'RIDDLE_INTRO':
                if (advance) {
                    CY.Audio.select();
                    state = 'QUESTION';
                    startTimer();
                    CY.Audio.playMusic('question');
                }
                break;
            case 'QUESTION':
                if (letterIndex >= 0) pick(letterIndex);
                else if (advance) pick(null); // nobody guessed / time ran out
                break;
            case 'REVEAL':
                if (advance) nextRiddle();
                break;
            case 'ENDING':
                if (advance) restart();
                break;
        }
    }

    function handleKey(e) {
        var k = e.key;
        if (k === 'm' || k === 'M') { e.preventDefault(); CY.Audio.toggleMute(); return; }
        var action = null;
        if (k === ' ' || k === 'Enter') action = 'ADVANCE';
        else if (/^[abcdABCD]$/.test(k)) action = k.toUpperCase();
        else if (/^[1-4]$/.test(k)) action = ['A', 'B', 'C', 'D'][parseInt(k, 10) - 1];
        if (!action) return;
        e.preventDefault();
        dispatch(action);
    }

    function updateTimerAudio() {
        if (!timerRunning) return;
        var left = timeLeftSeconds();
        var sec = Math.ceil(left);
        if (sec !== lastTickSecond) {
            lastTickSecond = sec;
            // The tension bed supplies the pulse now, so only the final
            // countdown gets an audible tick.
            if (sec <= 5 && sec > 0) CY.Audio.tickUrgent();
        }
    }

    // ---------------------------------------------------------------- draw
    function drawArtPanel(t, imageKey, fallback) {
        if (!CY.Images.draw(ctx, imageKey, 4, 14, CY.WIDTH - 8, 118)) {
            fallback();
        }
    }

    function drawCaveBg(t) {
        if (!CY.Images.draw(ctx, 'cave_backdrop', 0, 0, CY.WIDTH, CY.HEIGHT)) {
            CY.Art.drawCaveBackdrop(ctx, t);
        }
    }

    function draw(t) {
        var C = CY.COLORS;

        if (state === 'TITLE') {
            if (!CY.Images.draw(ctx, 'title', 0, 0, CY.WIDTH, CY.HEIGHT)) {
                CY.Art.drawTitle(ctx, t);
            }
            CY.UI.drawCentered(ctx, 'TRAPPED!', CY.WIDTH / 2, 150, 3, C.gold);
            CY.UI.drawCentered(ctx, 'ODYSSEUS VS THE CYCLOPS', CY.WIDTH / 2, 180, 1, C.white);
            CY.UI.drawCentered(ctx, 'A TRIVIA ESCAPE', CY.WIDTH / 2, 194, 1, C.parchmentDark);
            CY.UI.drawBlinkPrompt(ctx, 'PRESS SPACE TO BEGIN', CY.WIDTH / 2, 218, t, 1, C.white);
            return;
        }

        if (state === 'CRAWL') {
            drawCaveBg(t);
            // The painted backdrop has its own torches; only light the
            // procedural fallback.
            if (!CY.Images.has('cave_backdrop')) {
                CY.Art.drawTorch(ctx, 20, 60, t);
                CY.Art.drawTorch(ctx, CY.WIDTH - 20, 60, t);
            }
            CY.UI.drawCentered(ctx, (pageIndex + 1) + '/' + CRAWL.length, CY.WIDTH - 22, 140, 1, C.parchmentDark);
            CY.UI.drawDialogue(ctx, 20, 150, CY.WIDTH - 40, 74, CRAWL[pageIndex], 1);
            CY.UI.drawBlinkPrompt(ctx, 'PRESS SPACE', CY.WIDTH / 2, 230, t, 1, C.parchment);
            return;
        }

        if (state === 'CYCLOPS_INTRO') {
            var mood = pageIndex === CYCLOPS_INTRO.length - 1 ? 'laugh' : 'idle';
            drawCaveBg(t);
            var introRect = CY.Images.drawContain(ctx, 'cyclops_' + mood, 0, 2, CY.WIDTH, FACE_H);
            if (introRect) CY.UI.drawFrame(ctx, introRect);
            else CY.Art.drawCyclops(ctx, CY.WIDTH / 2, 20, 1.6, mood, t);
            CY.UI.drawDialogue(ctx, 6, FACE_H + 10, CY.WIDTH - 12, 46, CYCLOPS_INTRO[pageIndex], 1);
            CY.UI.drawBlinkPrompt(ctx, 'PRESS SPACE', CY.WIDTH / 2, 228, t, 1, C.parchment);
            return;
        }

        if (state === 'RIDDLE_INTRO') {
            // His mood inverts the room's fortune: smug when you miss,
            // irritated when you land one.
            var introMood = lastResult === 'correct' ? 'angry'
                : (lastResult ? 'pleased' : 'idle');
            drawCaveBg(t);
            var faceRect = CY.Images.drawContain(ctx, 'cyclops_' + introMood, 0, 2, CY.WIDTH, FACE_H);
            if (faceRect) CY.UI.drawFrame(ctx, faceRect);
            else CY.Art.drawCyclops(ctx, CY.WIDTH / 2, 6, 1.3, introMood, t);
            // Counter tucks into the gap beside the portrait rather than over it.
            CY.UI.drawCentered(ctx, 'RIDDLE ' + (riddleIndex + 1) + ' OF ' + CY.QUESTIONS.length, CY.WIDTH / 2, FACE_H + 8, 1, C.gold);
            CY.UI.drawDialogue(ctx, 6, FACE_H + 18, CY.WIDTH - 12, 44, taunt, 1);
            CY.UI.drawBlinkPrompt(ctx, 'PRESS SPACE', CY.WIDTH / 2, 230, t, 1, C.white);
            return;
        }

        if (state === 'QUESTION' || state === 'REVEAL') {
            updateTimerAudio();
            var cur = q();
            var isRevealed = state === 'REVEAL';
            var gotIt = picked !== null && picked === cur.correct;

            // Art first, HUD second -- the procedural fallbacks paint the whole
            // canvas, so drawing the HUD before them would wipe it out.
            if (isRevealed) {
                // The reveal is the payoff beat: the Cyclops reacts to the answer.
                // Cover the whole banner slot so it reads as a dramatic close-up
                // rather than a portrait floating over the previous scene.
                var mood = gotIt ? 'pleased' : 'angry';
                drawCaveBg(t);
                var rr = CY.Images.drawContain(ctx, 'cyclops_' + mood, 4, 14, CY.WIDTH - 8, 118);
                if (rr) CY.UI.drawFrame(ctx, rr);
                else CY.Art.drawCyclops(ctx, CY.WIDTH / 2, 18, 1.4, mood, t);
            } else {
                drawArtPanel(t, 'scene_' + cur.scene, function () {
                    drawCaveBg(t);
                    CY.Art.drawSceneIcon(ctx, CY.WIDTH / 2, 74, cur.scene, t);
                });
            }

            CY.UI.drawHUD(ctx, riddleIndex + 1, CY.QUESTIONS.length, escapeScore,
                isRevealed ? 'SPACE = NEXT' : 'PICK A B C D');

            var frac = isRevealed ? 0 : (timeLeftSeconds() / CY.TIMER_SECONDS);
            CY.UI.drawTimerBar(ctx, 4, 133, CY.WIDTH - 8, 5, frac);

            CY.UI.drawPanel(ctx, 4, 139, CY.WIDTH - 8, 99);

            if (isRevealed) {
                var verdict = gotIt ? 'CORRECT!' : (picked === null ? 'NO ANSWER!' : 'WRONG!');
                CY.drawText(ctx, verdict, 12, 144, 1, gotIt ? '#2c7a44' : C.red);
                // Tight line spacing so even a 3-line fact clears the options at y=183.
                CY.drawTextBlock(ctx, cur.fact, 12, 155, 1, C.ink, CY.WIDTH - 24, 2);
            } else {
                CY.drawTextBlock(ctx, cur.question, 12, 147, 1, C.ink, CY.WIDTH - 24, 3);
            }
            CY.UI.drawOptions(ctx, 12, 183, CY.WIDTH - 24, cur.options, cur.correct, isRevealed, picked);

            if (state === 'QUESTION' && timeLeftSeconds() <= 0) {
                CY.UI.drawBlinkPrompt(ctx, "TIME'S UP! PICK OR PRESS SPACE", CY.WIDTH / 2, 236, t, 1, C.red);
            }
            return;
        }

        if (state === 'ENDING') {
            var tier = endingTier();
            var drawFn = { great: CY.Art.drawEndingGreat, narrow: CY.Art.drawEndingNarrow, caught: CY.Art.drawEndingCaught }[tier];
            var usedArt = CY.Images.draw(ctx, 'ending_' + tier, 0, 0, CY.WIDTH, CY.HEIGHT);
            if (!usedArt) drawFn(ctx, t);
            // The painted endings are bright; without this the score sinks into
            // the grass. The procedural ones only need a light touch.
            CY.UI.drawScrim(ctx, 0, 190, CY.WIDTH, CY.HEIGHT - 190, usedArt ? 0.72 : 0.4);
            if (usedArt) {
                // The procedural endings draw their own headline; the art
                // versions need one so the outcome reads at a glance.
                var head = {
                    great: 'THE BOULDER ROLLS ASIDE -- ODYSSEUS ESCAPES!',
                    narrow: 'YOU SLIP PAST HIS SNORES. A NARROW ESCAPE!',
                    caught: 'CAUGHT! YOU PEEL POTATOES FOR HIS STEW.'
                }[tier];
                CY.UI.drawCentered(ctx, head, CY.WIDTH / 2, 196, 1, tier === 'caught' ? C.red : C.gold);
            }
            CY.UI.drawCentered(ctx, 'FINAL SCORE: ' + escapeScore + ' / ' + CY.QUESTIONS.length, CY.WIDTH / 2, 212, 1, C.parchment);
            CY.UI.drawBlinkPrompt(ctx, 'PRESS SPACE TO PLAY AGAIN', CY.WIDTH / 2, 228, t, 1, C.white);
            return;
        }
    }

    function loop(t) {
        ctx.imageSmoothingEnabled = false;
        draw(t);
        requestAnimationFrame(loop);
    }

    return {
        // For on-screen touch controls: CY.Game.action('ADVANCE' | 'A' | 'B' | 'C' | 'D')
        action: function (a) { dispatch(a); },
        toggleMute: function () { return CY.Audio.toggleMute(); },
        init: function (canvasEl) {
            canvas = canvasEl;
            ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            window.addEventListener('keydown', handleKey);

            // Browsers block audio until the user interacts. Ask for the opening
            // theme now -- CY.Audio queues it and starts it on the first gesture
            // if the context is still locked.
            CY.Audio.playMusic('title');
            var unlockAudio = function () {
                CY.Audio.unlock();
                window.removeEventListener('pointerdown', unlockAudio);
            };
            window.addEventListener('pointerdown', unlockAudio);

            requestAnimationFrame(loop);
        }
    };
})();
