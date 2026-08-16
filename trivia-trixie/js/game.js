// Trivia Trixie the Fabulous Fairy - Game Logic
// Namespaced like TT.* so all modules share one global.
var TT = TT || {};

// ---------------------------------------------------------------
// Utils
// ---------------------------------------------------------------
TT.Utils = {
    shuffle: function (arr) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
        }
        return a;
    },
    pickN: function (arr, n) {
        return TT.Utils.shuffle(arr).slice(0, n);
    },
    randInt: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    randChoice: function (arr) {
        return arr[TT.Utils.randInt(0, arr.length - 1)];
    }
};

// ---------------------------------------------------------------
// Assets - probes for optional Gemini-generated art; falls back
// to CSS/emoji styling when a file hasn't been dropped in yet.
// ---------------------------------------------------------------
TT.Assets = {
    TRIXIE_MOODS: ["idle", "happy", "laugh", "sad", "sleepy", "cheer"],
    available: {},   // url -> true/false once resolved

    basePath: "assets/",

    trixieUrl: function (mood) { return this.basePath + "trixie_" + mood + ".png"; },
    logoUrl: function () { return this.basePath + "title_logo.png"; },
    backdropUrl: function () { return this.basePath + "stage_backdrop.png"; },
    endingUrl: function (tier) { return this.basePath + "ending_" + tier + ".png"; },
    sceneUrl: function (category) {
        var key = TT.CATEGORY_SCENES[category] || "popculture";
        return this.basePath + "scene_" + key + ".png";
    },

    // Tests whether an <img> URL actually loads; calls back with (ok:boolean)
    probe: function (url, cb) {
        if (this.available.hasOwnProperty(url)) { cb(this.available[url]); return; }
        var img = new Image();
        var self = this;
        img.onload = function () { self.available[url] = true; cb(true); };
        img.onerror = function () { self.available[url] = false; cb(false); };
        img.src = url;
    },

    // Applies real art (or leaves the CSS fallback) to a .trixie-wrap element
    applyTrixie: function (wrapEl, mood) {
        wrapEl.setAttribute("data-mood", mood);
        var url = this.trixieUrl(mood);
        this.probe(url, function (ok) {
            var imgEl = wrapEl.querySelector(".trixie-img");
            if (ok) {
                imgEl.src = url;
                wrapEl.classList.add("has-art");
            } else {
                wrapEl.classList.remove("has-art");
            }
        });
    },

    applyLogo: function (logoEl) {
        var url = this.logoUrl();
        this.probe(url, function (ok) {
            if (ok) {
                logoEl.querySelector(".title-logo-img").src = url;
                logoEl.classList.add("has-art");
            } else {
                logoEl.classList.remove("has-art");
            }
        });
    },

    // Builds a CSS background-image value with a gradient fallback layer,
    // so a missing PNG simply reveals the gradient underneath (no broken icon).
    sceneCss: function (imgUrl, gradientCss) {
        return "url('" + imgUrl + "'), " + gradientCss;
    }
};

// ---------------------------------------------------------------
// Audio lives in js/audio.js (2-operator FM chiptune engine), loaded
// before this file so TT.Audio is already defined by the time we get here.
// ---------------------------------------------------------------

// ---------------------------------------------------------------
// UI - DOM rendering helpers
// ---------------------------------------------------------------
TT.UI = {
    el: {},

    init: function () {
        var ids = [
            "scene-bg", "sparkle-field", "topbar", "progress-track", "score-num",
            "content", "screen-title", "screen-question", "screen-results",
            "title-logo", "btn-start", "btn-mute",
            "category-label", "trixie-question", "question-counter", "question-text",
            "answers-grid", "feedback-caption",
            "trixie-results", "results-heading", "results-score", "results-message", "btn-again"
        ];
        var self = this;
        ids.forEach(function (id) { self.el[camel(id)] = document.getElementById(id); });
        function camel(id) { return id.replace(/-([a-z])/g, function (m, c) { return c.toUpperCase(); }); }

        this._buildCategoryGradients();
        this.spawnAmbientSparkles();
    },

    _buildCategoryGradients: function () {
        this.categoryGradient = {};
        var cats = TT.CATEGORIES;
        for (var i = 0; i < cats.length; i++) {
            var hue = Math.round((360 / cats.length) * i);
            var hue2 = (hue + 42) % 360;
            this.categoryGradient[cats[i]] =
                "linear-gradient(160deg, hsl(" + hue + ",70%,52%), hsl(" + hue2 + ",70%,30%))";
        }
    },

    showScreen: function (name) {
        this.el.screenTitle.classList.toggle("hidden", name !== "title");
        this.el.screenQuestion.classList.toggle("hidden", name !== "question");
        this.el.screenResults.classList.toggle("hidden", name !== "results");
        this.el.topbar.classList.toggle("hidden", name !== "question");
    },

    setScene: function (imgUrl, gradientCss) {
        var bg = this.el.sceneBg;
        bg.classList.add("fading");
        setTimeout(function () {
            bg.style.backgroundImage = TT.Assets.sceneCss(imgUrl, gradientCss);
            bg.classList.remove("fading");
        }, 180);
    },

    spawnAmbientSparkles: function () {
        var field = this.el.sparkleField;
        field.innerHTML = "";
        var glyphs = ["✨", "⭐", "💫", "🌟"];
        var n = 16;
        for (var i = 0; i < n; i++) {
            var s = document.createElement("div");
            s.className = "sparkle";
            s.textContent = TT.Utils.randChoice(glyphs);
            s.style.left = TT.Utils.randInt(2, 96) + "%";
            s.style.fontSize = (0.7 + Math.random() * 1.1) + "em";
            s.style.animationDuration = (5 + Math.random() * 6) + "s";
            s.style.animationDelay = (Math.random() * 8) + "s";
            field.appendChild(s);
        }
    },

    burstSparkles: function (originEl, count) {
        var rect = originEl.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var glyphs = ["✨", "⭐", "💫"];
        for (var i = 0; i < (count || 14); i++) {
            var s = document.createElement("div");
            s.className = "burst-sparkle";
            s.textContent = TT.Utils.randChoice(glyphs);
            var angle = Math.random() * Math.PI * 2;
            var dist = 60 + Math.random() * 120;
            s.style.setProperty("--dx", Math.cos(angle) * dist + "px");
            s.style.setProperty("--dy", Math.sin(angle) * dist + "px");
            s.style.left = cx + "px";
            s.style.top = cy + "px";
            s.style.fontSize = (0.9 + Math.random() * 0.9) + "em";
            document.body.appendChild(s);
            (function (node) { setTimeout(function () { node.remove(); }, 950); })(s);
        }
    },

    renderProgress: function (results, currentIndex, total) {
        var track = this.el.progressTrack;
        track.innerHTML = "";
        for (var i = 0; i < total; i++) {
            var dot = document.createElement("div");
            dot.className = "progress-dot";
            if (i < results.length) {
                dot.classList.add(results[i] ? "correct" : "wrong");
                dot.textContent = results[i] ? "✓" : "✕";
            } else if (i === currentIndex) {
                dot.classList.add("current");
            }
            track.appendChild(dot);
        }
    },

    letters: ["A", "B", "C", "D"]
};

// ---------------------------------------------------------------
// Game state machine
// ---------------------------------------------------------------
TT.Game = {
    set: [],          // 10 chosen questions (each with shuffled choices)
    index: 0,
    results: [],       // booleans, correct/wrong per answered question
    answered: false,

    init: function () {
        TT.UI.init();
        TT.Assets.applyTrixie(TT.UI.el.screenTitle.querySelector(".trixie-wrap"), "sleepy");
        TT.Assets.applyLogo(TT.UI.el.titleLogo);
        TT.UI.setScene(TT.Assets.backdropUrl(), "linear-gradient(160deg, #3a1465, #1c0a38)");
        TT.UI.showScreen("title");

        var self = this;
        TT.UI.el.btnStart.addEventListener("click", function () { self.startGame(); });
        TT.UI.el.btnAgain.addEventListener("click", function () { self.startGame(); });
        if (TT.UI.el.btnMute) {
            TT.UI.el.btnMute.addEventListener("click", function () { self._toggleMute(); });
        }

        document.addEventListener("keydown", function (e) { self._onKey(e); });

        // Browsers block audio until a real user gesture. Queue the title
        // theme now; TT.Audio starts it the moment the first tap/click lands.
        TT.Audio.playMusic("title");
        var unlockAudio = function () {
            TT.Audio.unlock();
            window.removeEventListener("pointerdown", unlockAudio);
        };
        window.addEventListener("pointerdown", unlockAudio);
    },

    _toggleMute: function () {
        var muted = TT.Audio.toggleMute();
        if (TT.UI.el.btnMute) TT.UI.el.btnMute.textContent = muted ? "🔇" : "🔊";
    },

    startGame: function () {
        TT.Audio.unlock();
        TT.Audio.click();

        var chosen = TT.Utils.pickN(TT.QUESTIONS, TT.CONST.QUESTIONS_PER_GAME);
        this.set = chosen.map(function (q) {
            var order = TT.Utils.shuffle([0, 1, 2, 3]);
            var choices = order.map(function (i) { return q.o[i]; });
            var answerIndex = order.indexOf(q.a);
            return { c: q.c, q: q.q, choices: choices, answerIndex: answerIndex };
        });
        this.index = 0;
        this.results = [];
        this.answered = false;

        TT.UI.showScreen("question");
        this._loadQuestion();
    },

    _loadQuestion: function () {
        var item = this.set[this.index];
        this.answered = false;

        TT.UI.el.categoryLabel.textContent = item.c;
        TT.UI.el.questionCounter.textContent =
            "Question " + (this.index + 1) + " of " + TT.CONST.QUESTIONS_PER_GAME;
        TT.UI.el.questionText.textContent = item.q;
        TT.UI.el.feedbackCaption.textContent = "";

        TT.Assets.applyTrixie(TT.UI.el.trixieQuestion, "idle");
        TT.UI.setScene(TT.Assets.sceneUrl(item.c), TT.UI.categoryGradient[item.c]);
        TT.UI.renderProgress(this.results, this.index, TT.CONST.QUESTIONS_PER_GAME);
        TT.UI.el.scoreNum.textContent = this.results.filter(Boolean).length;
        TT.Audio.playMusic("question");

        var grid = TT.UI.el.answersGrid;
        grid.innerHTML = "";
        var self = this;
        item.choices.forEach(function (choiceText, i) {
            var btn = document.createElement("button");
            btn.className = "answer-btn";
            btn.innerHTML = '<span class="opt-letter">' + TT.UI.letters[i] + '</span><span>' + escapeHtml(choiceText) + '</span>';
            btn.addEventListener("click", function () { self._selectAnswer(i, btn); });
            grid.appendChild(btn);
        });

        function escapeHtml(str) {
            var d = document.createElement("div");
            d.textContent = str;
            return d.innerHTML;
        }
    },

    _selectAnswer: function (choiceIndex, btnEl) {
        if (this.answered) return;
        this.answered = true;
        TT.Audio.stopMusic(); // drop the question bed so the verdict sting lands clean

        var item = this.set[this.index];
        var correct = choiceIndex === item.answerIndex;
        this.results.push(correct);

        var buttons = TT.UI.el.answersGrid.querySelectorAll(".answer-btn");
        buttons.forEach(function (b, i) {
            b.disabled = true;
            if (i === item.answerIndex) b.classList.add("correct");
            if (i === choiceIndex && !correct) b.classList.add("wrong");
            if (i !== choiceIndex && i !== item.answerIndex) b.classList.add("dim");
        });

        TT.UI.renderProgress(this.results, this.index, TT.CONST.QUESTIONS_PER_GAME);
        TT.UI.el.scoreNum.textContent = this.results.filter(Boolean).length;

        if (correct) {
            TT.Audio.correct();
            TT.Assets.applyTrixie(TT.UI.el.trixieQuestion, Math.random() < 0.5 ? "happy" : "laugh");
            TT.UI.el.feedbackCaption.textContent = "Correct! ✨";
            TT.UI.burstSparkles(btnEl, 12);
        } else {
            TT.Audio.wrong();
            TT.Assets.applyTrixie(TT.UI.el.trixieQuestion, "sad");
            TT.UI.el.feedbackCaption.textContent = "Not quite! The answer was “" + item.choices[item.answerIndex] + "”";
        }

        var self = this;
        this._advanceTimer = setTimeout(function () { self._nextQuestion(); }, TT.CONST.FEEDBACK_DELAY_MS);
    },

    _nextQuestion: function () {
        clearTimeout(this._advanceTimer);
        this.index++;
        if (this.index >= TT.CONST.QUESTIONS_PER_GAME) {
            this._finish();
        } else {
            this._loadQuestion();
        }
    },

    _finish: function () {
        var correctCount = this.results.filter(Boolean).length;
        var perfect = correctCount >= TT.CONST.PERFECT_SCORE;
        var win = correctCount >= TT.CONST.PASS_THRESHOLD;

        TT.UI.showScreen("results");
        TT.UI.el.resultsScore.textContent = "You got " + correctCount + " out of " + TT.CONST.QUESTIONS_PER_GAME + " correct.";

        var tier, mood, heading, message;
        if (perfect) {
            tier = "perfect"; mood = "cheer";
            heading = "PERFECT SCORE! ✨";
            message = TT.Utils.randChoice(TT.WISHES) + " Trixie says you're a true Trivia Champion!";
        } else if (win) {
            tier = "win"; mood = "laugh";
            heading = "You Win a Wish! 🌟";
            message = TT.Utils.randChoice(TT.WISHES);
        } else {
            tier = "lose"; mood = "sad";
            heading = "So Close!";
            message = TT.Utils.randChoice(TT.TRY_AGAIN_MESSAGES);
        }

        TT.UI.el.resultsHeading.textContent = heading;
        TT.UI.el.resultsMessage.textContent = message;
        TT.Assets.applyTrixie(TT.UI.el.trixieResults, mood);
        TT.UI.setScene(TT.Assets.endingUrl(tier), tier === "lose"
            ? "linear-gradient(160deg, #4a3a6a, #241338)"
            : "linear-gradient(160deg, #ff5da2, #5b2a86)");

        if (win) {
            TT.Audio.win();
            TT.UI.burstSparkles(TT.UI.el.trixieResults, 22);
        } else {
            TT.Audio.tryAgain();
        }
    },

    _onKey: function (e) {
        var screenQuestionVisible = !TT.UI.el.screenQuestion.classList.contains("hidden");
        var screenTitleVisible = !TT.UI.el.screenTitle.classList.contains("hidden");
        var screenResultsVisible = !TT.UI.el.screenResults.classList.contains("hidden");

        if (screenTitleVisible && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            this.startGame();
            return;
        }
        if (screenResultsVisible && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            this.startGame();
            return;
        }
        if (screenQuestionVisible) {
            if (!this.answered && /^[1-4]$/.test(e.key)) {
                var idx = parseInt(e.key, 10) - 1;
                var buttons = TT.UI.el.answersGrid.querySelectorAll(".answer-btn");
                if (buttons[idx]) buttons[idx].click();
            } else if (this.answered && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                this._nextQuestion();
            }
        }
    }
};

window.addEventListener("load", function () { TT.Game.init(); });
