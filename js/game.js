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
    var lastTime = 0;

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

    function reveal() {
        state = 'REVEAL';
        timerRunning = false;
        CY.Audio.confirm();
    }

    function judge(gotItRight) {
        if (gotItRight) {
            escapeScore++;
            CY.Audio.correct();
        } else {
            CY.Audio.wrong();
        }
        riddleIndex++;
        if (riddleIndex >= CY.QUESTIONS.length) {
            goto('ENDING');
            if (escapeScore >= 6) CY.Audio.fanfare();
            else if (escapeScore >= 3) CY.Audio.confirm();
            else CY.Audio.sad();
        } else {
            goto('RIDDLE_INTRO');
        }
    }

    function restart() {
        riddleIndex = 0;
        escapeScore = 0;
        goto('TITLE');
    }

    // action is 'ADVANCE' | 'UP' | 'DOWN' -- shared by the keyboard handler
    // and the on-screen touch buttons so both drive identical logic.
    function dispatch(action) {
        CY.Audio.unlock();
        var advance = action === 'ADVANCE';

        switch (state) {
            case 'TITLE':
                if (advance) { CY.Audio.select(); goto('CRAWL'); }
                break;
            case 'CRAWL':
                if (advance) {
                    CY.Audio.select();
                    if (pageIndex < CRAWL.length - 1) pageIndex++;
                    else { CY.Audio.roar(); goto('CYCLOPS_INTRO'); }
                }
                break;
            case 'CYCLOPS_INTRO':
                if (advance) {
                    CY.Audio.select();
                    if (pageIndex < CYCLOPS_INTRO.length - 1) pageIndex++;
                    else goto('RIDDLE_INTRO');
                }
                break;
            case 'RIDDLE_INTRO':
                if (advance) { CY.Audio.select(); state = 'QUESTION'; startTimer(); }
                break;
            case 'QUESTION':
                if (advance) reveal();
                break;
            case 'REVEAL':
                if (action === 'UP') judge(true);
                else if (action === 'DOWN') judge(false);
                break;
            case 'ENDING':
                if (advance) restart();
                break;
        }
    }

    function handleKey(e) {
        var k = e.key;
        var action = (k === ' ' || k === 'Enter') ? 'ADVANCE'
            : k === 'ArrowUp' ? 'UP'
            : k === 'ArrowDown' ? 'DOWN'
            : null;
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
            if (sec <= 5 && sec > 0) CY.Audio.tickUrgent();
            else if (sec > 5) CY.Audio.tick();
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
            CY.Art.drawTorch(ctx, 20, 60, t);
            CY.Art.drawTorch(ctx, CY.WIDTH - 20, 60, t);
            CY.UI.drawDialogue(ctx, 20, 150, CY.WIDTH - 40, 74, CRAWL[pageIndex], 1);
            CY.UI.drawBlinkPrompt(ctx, 'PRESS SPACE', CY.WIDTH / 2, 232, t, 1, C.parchment);
            CY.UI.drawCentered(ctx, (pageIndex + 1) + '/' + CRAWL.length, CY.WIDTH - 30, 158, 1, C.caveHi);
            return;
        }

        if (state === 'CYCLOPS_INTRO') {
            drawCaveBg(t);
            var mood = pageIndex === CYCLOPS_INTRO.length - 1 ? 'laugh' : 'idle';
            if (!CY.Images.draw(ctx, 'cyclops_' + mood, 90, 10, 140, 110)) {
                CY.Art.drawCyclops(ctx, CY.WIDTH / 2, 20, 1.6, mood, t);
            }
            CY.UI.drawDialogue(ctx, 20, 150, CY.WIDTH - 40, 74, CYCLOPS_INTRO[pageIndex], 1);
            CY.UI.drawBlinkPrompt(ctx, 'PRESS SPACE', CY.WIDTH / 2, 232, t, 1, C.parchment);
            return;
        }

        if (state === 'RIDDLE_INTRO') {
            drawCaveBg(t);
            if (!CY.Images.draw(ctx, 'cyclops_idle', 90, 30, 140, 110)) {
                CY.Art.drawCyclops(ctx, CY.WIDTH / 2, 40, 1.6, 'idle', t);
            }
            CY.UI.drawCentered(ctx, 'RIDDLE ' + (riddleIndex + 1) + ' OF ' + CY.QUESTIONS.length, CY.WIDTH / 2, 190, 2, C.gold);
            CY.UI.drawBlinkPrompt(ctx, 'PRESS SPACE', CY.WIDTH / 2, 218, t, 1, C.white);
            return;
        }

        if (state === 'QUESTION' || state === 'REVEAL') {
            updateTimerAudio();
            var cur = q();
            var isRevealed = state === 'REVEAL';
            CY.UI.drawHUD(ctx, riddleIndex + 1, CY.QUESTIONS.length, escapeScore,
                isRevealed ? 'UP = RIGHT   DOWN = WRONG' : 'SPACE = REVEAL');

            drawArtPanel(t, 'scene_' + cur.scene, function () {
                drawCaveBg(t);
                CY.Art.drawSceneIcon(ctx, CY.WIDTH / 2, 74, cur.scene, t);
            });

            var frac = isRevealed ? 0 : (timeLeftSeconds() / CY.TIMER_SECONDS);
            CY.UI.drawTimerBar(ctx, 4, 133, CY.WIDTH - 8, 5, frac);

            CY.UI.drawPanel(ctx, 4, 139, CY.WIDTH - 8, 99);

            if (isRevealed) {
                CY.drawTextBlock(ctx, cur.fact, 12, 147, 1, C.ink, CY.WIDTH - 24, 3);
            } else {
                CY.drawTextBlock(ctx, cur.question, 12, 147, 1, C.ink, CY.WIDTH - 24, 3);
            }
            CY.UI.drawOptions(ctx, 12, 183, CY.WIDTH - 24, cur.options, cur.correct, isRevealed);

            if (state === 'QUESTION' && timeLeftSeconds() <= 0) {
                CY.UI.drawBlinkPrompt(ctx, "TIME'S UP! PRESS SPACE", CY.WIDTH / 2, 236, t, 1, C.red);
            }
            return;
        }

        if (state === 'ENDING') {
            var tier = escapeScore >= 6 ? 'great' : (escapeScore >= 3 ? 'narrow' : 'caught');
            var drawFn = { great: CY.Art.drawEndingGreat, narrow: CY.Art.drawEndingNarrow, caught: CY.Art.drawEndingCaught }[tier];
            if (!CY.Images.draw(ctx, 'ending_' + tier, 0, 0, CY.WIDTH, CY.HEIGHT)) {
                drawFn(ctx, t);
            }
            CY.UI.drawCentered(ctx, 'FINAL SCORE: ' + escapeScore + ' / ' + CY.QUESTIONS.length, CY.WIDTH / 2, 222, 1, C.parchment);
            CY.UI.drawBlinkPrompt(ctx, 'PRESS SPACE TO PLAY AGAIN', CY.WIDTH / 2, 232, t, 1, C.white);
            return;
        }
    }

    function loop(t) {
        ctx.imageSmoothingEnabled = false;
        draw(t);
        requestAnimationFrame(loop);
    }

    return {
        // For on-screen touch controls: CY.Game.action('ADVANCE' | 'UP' | 'DOWN')
        action: function (a) { dispatch(a); },
        init: function (canvasEl) {
            canvas = canvasEl;
            ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            window.addEventListener('keydown', handleKey);
            requestAnimationFrame(loop);
        }
    };
})();
