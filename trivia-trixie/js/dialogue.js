// Trivia Trixie - all of her spoken lines, kept separate from game logic so
// her personality is easy to tweak on its own. Shown in a speech bubble with
// a typewriter reveal + talk-blip sound (see TT.UI.say in game.js).
var TT = TT || {};

TT.DIALOGUE = {
    // Shown once when the title screen appears.
    titleGreetings: [
        "Welcome, welcome! I'm Trivia Trixie, your fabulous host!",
        "Ready to sparkle your way to a wish? Let's begin!",
        "Oh, a new contestant! I do love a fresh face.",
        "Dust off your brain, darling -- the magic's about to start!",
        "Ten questions stand between you and a wish. Think you've got it?",
        "Wands up! Let's see what kind of trivia champion you are!",
        "I've been waiting all day for someone fabulous like you!",
        "Answer seven of my ten questions right, and I'll grant you any wish you like!",
        "Get seven correct, and poof -- your wish is mine to grant!"
    ],

    // A little banter when a question from this category comes up.
    categoryBanter: {
        SpongeBob: [
            "Ooh, under the sea we go! I hope you know your Krabby Patties!",
            "Bikini Bottom bubbles are floating my way -- get ready, sponge fans!"
        ],
        TMNT: [
            "Cowabunga! Time to test your ninja knowledge!",
            "Heroes in a half shell, coming right up -- don't drop your guard!"
        ],
        Zombies: [
            "Braaains... I mean, brainy trivia, coming your way!",
            "Seabrook spirit! Let's see how much you know about zombies and werewolves!"
        ],
        Descendants: [
            "Villain kids or royal heroes -- which side do you know best?",
            "Auradon Prep is in session! Sharpen your wand, or your wits!"
        ],
        Simpsons: [
            "D'oh! I mean... let's see what you know about Springfield!",
            "Grab a donut, this one's about America's favorite yellow family!"
        ],
        "Spirited Away": [
            "Off to the spirit world we drift... don't forget your name!",
            "A little Ghibli magic for this one -- dreamy, isn't it?"
        ],
        Christmas: [
            "Jingle bells, jingle bells -- let's see your Christmas cheer!",
            "Ho ho ho! This one's wrapped up with holiday magic!"
        ],
        Easter: [
            "Hop to it! This one's egg-cellent!",
            "Spring is in the air, and so are the eggs -- good luck!"
        ],
        Grinch: [
            "Careful, this one might steal your Christmas spirit... just kidding!",
            "Mount Crumpit calling! Let's see what you know about a certain green grump."
        ],
        "Dr. Seuss": [
            "Time for something wonderfully wacky and rhyme-y!",
            "Oh, the places this question will go!"
        ],
        "Cat in the Hat": [
            "It's a rainy day kind of question -- mind the mess!",
            "Thing One, Thing Two, and you -- let's see what you know!"
        ],
        Elf: [
            "The best way to spread Christmas cheer is answering loud for all to hear!",
            "Syrup on spaghetti optional. Knowledge required!"
        ],
        Lollies: [
            "Ooh, this one's sweet! Don't let it melt your brain!",
            "Sugar, spice, and trivia delight -- here we go!"
        ],
        Fairies: [
            "One of my favorite topics, obviously! Let's talk fairy business.",
            "Sprinkle some fairy dust and get thinking!"
        ],
        "Faraway Tree": [
            "Up, up the Faraway Tree we climb -- mind the Angry Pixie!",
            "A magical land awaits at the top... and so does this question!"
        ],
        Ghostbusters: [
            "Who ya gonna call for this one? Just you and your brain!",
            "No ghosts here -- just a spooky-good question!"
        ],
        Toys: [
            "Playtime pop quiz! Let's see what you know.",
            "Every toy box has a story -- do you know this one?"
        ],
        "Toy Story": [
            "To infinity, and this question!",
            "Andy's toys are watching -- make them proud!"
        ],
        Pixar: [
            "Grab your imagination, this one's pure Pixar magic!",
            "Get ready for a story with a whole lot of heart!"
        ],
        Disney: [
            "A little pixie dust for this one -- pure Disney magic!",
            "Once upon a time... there was a trivia question!"
        ],
        "Pop Culture": [
            "This one's fresh from the world of everything fun and now!",
            "Pop quiz -- literally! Let's see what you know!"
        ]
    },
    // Used if a category is somehow missing from the list above.
    categoryBanterFallback: [
        "Ooh, a good one! Let's see what you've got.",
        "Here comes a sparkly little question for you!"
    ],

    // General reaction when the answer is correct (not on a special streak).
    correctGeneral: [
        "Ta-da! You got it!",
        "Sparkly and smart -- I like it!",
        "Ooh, correct! You're on a roll!",
        "Yes! My wand is tingling with excitement!",
        "Perfect! You must have a little magic of your own.",
        "That's right! Give yourself a sparkle!",
        "Wonderful! Keep that brain shining!",
        "Correctamundo, as they say!"
    ],
    // Special lines at consecutive-correct milestones -- checked in order,
    // the highest matching streak wins.
    correctStreak: {
        3: [
            "Three in a row?! Be careful, you might actually win this wish!",
            "A three-streak! I'm impressed already!"
        ],
        5: [
            "FIVE correct in a row?! Be still my wings!",
            "Five straight! You're absolutely glowing right now!"
        ],
        7: [
            "SEVEN in a row -- that's wish-winning material!",
            "Seven straight correct -- I might just cry sparkles!"
        ],
        10: [
            "TEN OUT OF TEN?! Impossible! Magical! Amazing!",
            "A perfect ten-streak -- you might be part fairy yourself!"
        ]
    },

    // General reaction when the answer is wrong -- always gentle, never
    // harsh. The correct answer text gets appended after these in code.
    wrongGeneral: [
        "Ooh, so close!",
        "Not quite, but don't worry a bit!",
        "Almost! Even fairies get a few wrong.",
        "A little sparkle short this time!",
        "Not this one, sweetie -- onward!",
        "Hmm, not quite -- but I still believe in you!",
        "So close I could taste the magic! Just not quite.",
        "Missed it by a whisker -- try the next one!"
    ]
};

// Picks a line without repeating the one used last time for that pool (keyed
// by a caller-supplied string), so a short pool still feels varied.
(function () {
    var lastPick = {};
    TT.pickLine = function (lines, key) {
        if (!lines || !lines.length) return "";
        if (lines.length === 1) return lines[0];
        var i, prev = lastPick[key];
        do { i = Math.floor(Math.random() * lines.length); } while (i === prev);
        lastPick[key] = i;
        return lines[i];
    };
})();
