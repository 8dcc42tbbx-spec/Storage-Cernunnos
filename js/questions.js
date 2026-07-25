// Trivia data: Christopher Nolan's "The Odyssey" (2026)
// Every answer below is fact-checked against real reporting on the film
// (cast, production, box office, and reviews) as of July 2026.
//
// Correct answers are deliberately spread across the letters (C,B,D,A,D,B,C)
// so a competitive room can't coast by noticing a positional pattern.
// Numeric option sets stay in a natural order (ascending/descending) --
// scrambling those to hit a letter would read as a mistake.
var CY = CY || {};

CY.QUESTIONS = [
    {
        scene: 'q1_zeuslaw',
        question: 'WHAT ANCIENT GREEK CONCEPT DOES NOLAN DRAMATIZE AS "ZEUS\' LAW"?',
        options: [
            'HUBRIS -- DANGEROUS PRIDE',
            'OSTRACISM -- BANISHMENT BY VOTE',
            'XENIA -- SACRED HOSPITALITY TO STRANGERS',
            "THE ORACLE'S PROPHECY"
        ],
        correct: 2,
        fact: '"ZEUS\' LAW" IS NOLAN\'S NAME FOR XENIA -- ANY STRANGER AT YOUR DOOR MIGHT SECRETLY BE A GOD.'
    },
    {
        scene: 'q2_telemachus',
        question: 'WHICH ACTOR PLAYS TELEMACHUS, ODYSSEUS\' SON?',
        options: ['TIMOTHEE CHALAMET', 'TOM HOLLAND', 'AUSTIN BUTLER', 'JACOB ELORDI'],
        correct: 1,
        fact: 'TOM HOLLAND PLAYS TELEMACHUS, WHO WAITS IN ITHACA WITH PENELOPE.'
    },
    {
        scene: 'q3_giants',
        question: 'HOW DID NOLAN MAKE THE LAESTRYGONIAN GIANTS LOOK GIGANTIC?',
        options: [
            'DIGITAL DE-AGING AND VFX SCALING',
            'GREEN-SCREEN COMPOSITES ONLY',
            'TINY MODEL SETS WITH TOY FIGURES',
            'FORCED PERSPECTIVE WITH REAL STUNT DOUBLES'
        ],
        correct: 3,
        fact: 'NOLAN PAIRED 7-FOOT STUNT PERFORMERS WITH SUB-5-FOOT DOUBLES -- THE LORD OF THE RINGS TRICK.'
    },
    {
        scene: 'q4_imax',
        question: 'WHAT HISTORIC FIRST DOES "THE ODYSSEY" CLAIM?',
        options: [
            'FIRST FEATURE SHOT ENTIRELY WITH IMAX CAMERAS',
            'FIRST FEATURE SHOT ENTIRELY UNDERWATER',
            'FIRST FEATURE WITH NO HUMAN ACTORS',
            'FIRST FEATURE SHOT IN ONE CONTINUOUS TAKE'
        ],
        correct: 0,
        fact: 'IT IS THE FIRST FEATURE FILM SHOT ENTIRELY WITH IMAX FILM CAMERAS.'
    },
    {
        scene: 'q5_trojanhorse',
        question: 'HOW DID NOLAN ACTUALLY FILM THE TROJAN HORSE INTERIOR?',
        options: [
            'BUILT A TINY MODEL AND SHOT IT MACRO',
            'SHOT IT ON A GREEN-SCREEN VOLUME STAGE',
            "CGI'D THE WHOLE INTERIOR IN POST",
            'CRAMMED IN WITH THE CAST AND AN IMAX CAMERA'
        ],
        correct: 3,
        fact: 'NOLAN CRAMMED INSIDE THE REAL 35-FOOT HORSE WITH THE CAST AND AN IMAX CAMERA.'
    },
    {
        scene: 'q6_animatronic',
        question: 'FOR THE CYCLOPS\' CAVE, NOLAN BUILT A HUGE ANIMATRONIC CREATURE. HOW TALL WAS IT?',
        options: ['100 FEET', '60 FEET', '30 FEET', '15 FEET'],
        correct: 1,
        fact: 'THE PRACTICAL CYCLOPS ANIMATRONIC STOOD ROUGHLY 60 FEET TALL.'
    },
    {
        scene: 'q7_ancient',
        question: 'ABOUT HOW OLD IS HOMER\'S ORIGINAL "ODYSSEY" POEM?',
        options: ['ABOUT 500 YEARS OLD', 'NEARLY 1,000 YEARS OLD', 'NEARLY 3,000 YEARS OLD', 'OVER 5,000 YEARS OLD'],
        correct: 2,
        fact: 'HOMER\'S "ODYSSEY" DATES TO ROUGHLY THE 8TH CENTURY BCE -- NEARLY 3,000 YEARS OLD.'
    }
];
