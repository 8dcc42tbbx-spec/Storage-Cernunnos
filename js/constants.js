// Trivia Trixie - Game Constants
var TT = TT || {};

TT.CONST = {
    QUESTIONS_PER_GAME: 10,
    PASS_THRESHOLD: 7,     // correct answers needed to win a wish
    PERFECT_SCORE: 10,

    FEEDBACK_DELAY_MS: 1900,  // auto-advance delay after answering

    STATE_TITLE: "title",
    STATE_QUESTION: "question",
    STATE_FEEDBACK: "feedback",
    STATE_RESULTS: "results"
};

// Fun flavor text for a granted wish - shown randomly on a winning result
TT.WISHES = [
    "Trixie waves her wand... you wished for a puppy that never stops wagging its tail! 🐶✨",
    "POOF! You wished for an endless waterslide made of rainbows! 🌈",
    "Trixie grants your wish: a treehouse castle in the clouds! 🏰",
    "Your wish comes true: chocolate rain for one whole day! 🍫🌧️",
    "You wished for wings so you can fly and play with the fairies! 🧚",
    "Trixie's wand sparkles... you wished for your very own pet dragon! 🐉",
    "POOF! Your wish: a candy shop that never, ever runs out of lollies! 🍬",
    "You wished to talk to animals for a whole day! 🐾",
    "Trixie grants it: your very own magic carpet ride! 🪄",
    "Your wish: an endless summer of ice cream for breakfast! 🍦",
    "POOF! You wished for a trampoline that bounces you to the stars! ⭐",
    "Trixie grants your wish: your own secret garden full of talking flowers! 🌸"
];

// Encouraging messages shown on a non-winning result (kept gentle, never harsh)
TT.TRY_AGAIN_MESSAGES = [
    "So close! Even fairies need a little practice with their magic.",
    "Almost had it! Trixie believes your wish is just one game away.",
    "Great effort! Spin the wand again and give it another go.",
    "Not quite enough sparkle this time — try again for your wish!",
    "So close! A true wish-winner never gives up the first try."
];
