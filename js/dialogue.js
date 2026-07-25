// Polyphemus' between-riddle taunts. Which pool is used depends on how the
// room did on the previous riddle, so he plays as an opponent reacting to you
// rather than a narrator counting rounds.
//
// Keep lines under ~110 characters: the riddle-intro panel wraps at roughly
// 49 characters and has room for three lines.
var CY = CY || {};

CY.TAUNTS = {
    // Before riddle 1.
    opening: [
        'SEVEN RIDDLES STAND BETWEEN YOU AND THE OPEN SEA. LET US SEE WHAT YOU KNOW, LITTLE KING.',
        'MY BOULDER IS HEAVY AND MY PATIENCE IS THIN. ANSWER WELL, ITHACAN.',
        'OTHERS HAVE SAT WHERE YOU SIT. THEY WERE DELICIOUS. BEGIN.'
    ],
    // The room got the last one right -- he is grudging and unimpressed.
    correct: [
        'LUCK. AND LUCK IS A THING THAT RUNS OUT, MORTAL.',
        'HMPH. EVEN A BLIND GOAT FINDS AN OLIVE NOW AND THEN.',
        'ONE STONE ROLLS ASIDE. DO NOT SMILE YET.',
        'SO THE ITHACAN HAS SEEN A PICTURE OR TWO. IMPRESSIVE. BARELY.',
        'YOU KNOW THE TALE. BUT DO YOU KNOW THE TELLING OF IT?',
        'CORRECT. MY FATHER WARNED ME YOU WERE A CLEVER ONE.'
    ],
    // The room got it wrong -- he is delighted.
    wrong: [
        'WRONG! I CAN ALREADY TASTE THE POTATOES.',
        'HA! POSEIDON HIMSELF LAUGHS AT YOU FROM THE DEEP.',
        'WRONG. THE BOULDER DOES NOT BUDGE. NOR DO I.',
        'MY SHEEP KNOW MORE OF THIS FILM THAN YOU DO. AND THEY HAVE NOT SEEN IT.',
        'ANOTHER STONE SETTLES INTO PLACE. GOOD. VERY GOOD.',
        'AND THIS IS THE MAN WHO TOPPLED TROY? HOW THE MIGHTY BORE ME.'
    ],
    // Nobody answered in time.
    none: [
        'SILENCE? THE SEA IS SILENT TOO. IT DROWNS MEN ALL THE SAME.',
        'NOTHING? THEN NOTHING IS WHAT YOU HAVE EARNED.',
        'SPEECHLESS. HOW VERY WISE OF YOU, KING OF ITHACA.'
    ]
};

// Picks a line without repeating the one used last time for that pool, so a
// short pool still feels varied across a seven-riddle game.
(function () {
    var lastPick = {};
    CY.pickTaunt = function (pool) {
        var lines = CY.TAUNTS[pool] || CY.TAUNTS.correct;
        if (lines.length === 1) return lines[0];
        var i, prev = lastPick[pool];
        do { i = Math.floor(Math.random() * lines.length); } while (i === prev);
        lastPick[pool] = i;
        return lines[i];
    };
})();
