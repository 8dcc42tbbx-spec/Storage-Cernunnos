// Trivia Trixie - Question Bank (200 questions across 21 kid-friendly topics)
// Format: { c: category, q: question text, o: [4 options], a: index of correct option }
var TT = TT || {};

TT.CATEGORIES = [
    "SpongeBob", "TMNT", "Zombies", "Descendants", "Simpsons",
    "Spirited Away", "Christmas", "Easter", "Grinch", "Dr. Seuss",
    "Cat in the Hat", "Elf", "Lollies", "Fairies", "Faraway Tree",
    "Ghostbusters", "Toys", "Toy Story", "Pixar", "Disney", "Pop Culture"
];

// Maps a category name to the base filename of its scene artwork (assets/scene_<key>.png)
TT.CATEGORY_SCENES = {
    "SpongeBob": "spongebob",
    "TMNT": "tmnt",
    "Zombies": "zombies",
    "Descendants": "descendants",
    "Simpsons": "simpsons",
    "Spirited Away": "spiritedaway",
    "Christmas": "christmas",
    "Easter": "easter",
    "Grinch": "grinch",
    "Dr. Seuss": "drseuss",
    "Cat in the Hat": "catinthehat",
    "Elf": "elf",
    "Lollies": "lollies",
    "Fairies": "fairies",
    "Faraway Tree": "farawaytree",
    "Ghostbusters": "ghostbusters",
    "Toys": "toys",
    "Toy Story": "toystory",
    "Pixar": "pixar",
    "Disney": "disney",
    "Pop Culture": "popculture"
};

TT.QUESTIONS = [
    // --- SpongeBob (13) ---
    { c: "SpongeBob", q: "Where does SpongeBob SquarePants live?", o: ["A pineapple under the sea", "A sandcastle on the beach", "A rock in the desert", "A treehouse in the jungle"], a: 0 },
    { c: "SpongeBob", q: "What is the name of SpongeBob's pet snail?", o: ["Gary", "Patrick", "Squidward", "Sandy"], a: 0 },
    { c: "SpongeBob", q: "What is SpongeBob's job at the Krusty Krab?", o: ["Cashier", "Fry cook", "Manager", "Dishwasher"], a: 1 },
    { c: "SpongeBob", q: "Who is SpongeBob's best friend, a pink starfish?", o: ["Patrick Star", "Squidward", "Plankton", "Larry"], a: 0 },
    { c: "SpongeBob", q: "Which grumpy octopus lives next door to SpongeBob?", o: ["Squidward Tentacles", "Mr. Krabs", "Plankton", "Patrick"], a: 0 },
    { c: "SpongeBob", q: "Who owns the Krusty Krab restaurant?", o: ["Mr. Krabs", "Plankton", "Squidward", "SpongeBob"], a: 0 },
    { c: "SpongeBob", q: "What is the name of the town where SpongeBob lives?", o: ["Bikini Bottom", "Coral City", "Shell Harbor", "Ocean View"], a: 0 },
    { c: "SpongeBob", q: "Who is the tiny evil villain who owns the Chum Bucket?", o: ["Plankton", "Squidward", "Mr. Krabs", "Patrick"], a: 0 },
    { c: "SpongeBob", q: "What does SpongeBob attend to learn how to drive a boat?", o: ["Boating School", "Cooking Class", "Swim Club", "Fry Cook Academy"], a: 0 },
    { c: "SpongeBob", q: "What kind of animal is Sandy Cheeks?", o: ["A squirrel", "A crab", "A dolphin", "A jellyfish"], a: 0 },
    { c: "SpongeBob", q: "What game do SpongeBob and Patrick love to play with special nets?", o: ["Jellyfishing", "Fishball", "Bubble Tag", "Krab Catch"], a: 0 },
    { c: "SpongeBob", q: "What shape are SpongeBob's pants?", o: ["Square", "Round", "Triangle", "Star-shaped"], a: 0 },
    { c: "SpongeBob", q: "What is the secret recipe that makes Krabby Patties so delicious?", o: ["The Krabby Patty formula", "Plankton's secret sauce", "Squidward's spice mix", "Sandy's peanut butter"], a: 0 },

    // --- TMNT (10) ---
    { c: "TMNT", q: "How many Teenage Mutant Ninja Turtles are there?", o: ["Four", "Three", "Five", "Six"], a: 0 },
    { c: "TMNT", q: "Who is the wise rat who trains the turtles in ninjutsu?", o: ["Splinter", "Shredder", "Casey Jones", "April"], a: 0 },
    { c: "TMNT", q: "Which turtle wears a red mask and fights with sais?", o: ["Raphael", "Leonardo", "Michelangelo", "Donatello"], a: 0 },
    { c: "TMNT", q: "Which turtle wears a blue mask and leads the team?", o: ["Leonardo", "Raphael", "Michelangelo", "Donatello"], a: 0 },
    { c: "TMNT", q: "Which turtle wears an orange mask and loves pizza and jokes?", o: ["Michelangelo", "Leonardo", "Raphael", "Donatello"], a: 0 },
    { c: "TMNT", q: "Which turtle wears a purple mask and is the team's inventor?", o: ["Donatello", "Michelangelo", "Raphael", "Leonardo"], a: 0 },
    { c: "TMNT", q: "What is the Ninja Turtles' favorite food?", o: ["Pizza", "Tacos", "Burgers", "Spaghetti"], a: 0 },
    { c: "TMNT", q: "Where do the Ninja Turtles make their home?", o: ["In the sewers of New York City", "On a farm", "In a treehouse", "On a spaceship"], a: 0 },
    { c: "TMNT", q: "What is the name of the turtles' human reporter friend?", o: ["April O'Neil", "Karai", "Irma", "Vernon"], a: 0 },
    { c: "TMNT", q: "Who is the masked villain leader who is the turtles' arch-enemy?", o: ["Shredder", "Bebop", "Rocksteady", "Krang"], a: 0 },

    // --- Zombies (Disney) (9) ---
    { c: "Zombies", q: "What kind of creature is Zed, the main character of ZOMBIES?", o: ["A zombie", "A werewolf", "A vampire", "A ghost"], a: 0 },
    { c: "Zombies", q: "What is the name of the high school in the movie ZOMBIES?", o: ["Seabrook High", "Zombietown High", "Central High", "Mighty Shrimp Academy"], a: 0 },
    { c: "Zombies", q: "What is the name of the cheerleader who becomes friends with Zed?", o: ["Addison", "Bree", "Eliza", "Bonzo"], a: 0 },
    { c: "Zombies", q: "Besides zombies and humans, what other group lives in Seabrook?", o: ["Werewolves", "Vampires", "Mermaids", "Fairies"], a: 0 },
    { c: "Zombies", q: "What sport does Zed dream of playing at his new school?", o: ["Football", "Basketball", "Soccer", "Baseball"], a: 0 },
    { c: "Zombies", q: "What color hair does Addison hide under a wig?", o: ["White", "Green", "Blue", "Purple"], a: 0 },
    { c: "Zombies", q: "What is the name of the town where ZOMBIES takes place?", o: ["Seabrook", "Bikini Bottom", "Whoville", "Auradon"], a: 0 },
    { c: "Zombies", q: "What do zombies wear on their wrists to control their zombie urges in ZOMBIES?", o: ["Z-Bands", "Ankle bracelets", "Glow rings", "Magic bracelets"], a: 0 },
    { c: "Zombies", q: "What kind of Disney movie is ZOMBIES, mixing monsters with music?", o: ["A musical", "A silent film", "A documentary", "A puppet show"], a: 0 },

    // --- Descendants (9) ---
    { c: "Descendants", q: "Who is the daughter of Maleficent in Descendants?", o: ["Mal", "Evie", "Uma", "Jane"], a: 0 },
    { c: "Descendants", q: "Where do the villain kids live before coming to Auradon?", o: ["The Isle of the Lost", "Neverland", "Whoville", "Wonderland"], a: 0 },
    { c: "Descendants", q: "What is the name of the kingdom where the Disney heroes live?", o: ["Auradon", "Arendelle", "Agrabah", "Auroraland"], a: 0 },
    { c: "Descendants", q: "Who is the daughter of the Evil Queen in Descendants?", o: ["Evie", "Mal", "Jane", "Uma"], a: 0 },
    { c: "Descendants", q: "Whose son is Carlos, who is afraid of dogs at first?", o: ["Cruella De Vil", "Jafar", "Ursula", "Gaston"], a: 0 },
    { c: "Descendants", q: "Whose son is Jay, a talented thief and athlete?", o: ["Jafar", "Cruella De Vil", "Hades", "Captain Hook"], a: 0 },
    { c: "Descendants", q: "Who is the prince that Mal falls in love with?", o: ["Ben", "Chad", "Doug", "Harry"], a: 0 },
    { c: "Descendants", q: "Whose daughter is Uma, the pirate captain?", o: ["Ursula", "Maleficent", "Cruella De Vil", "Jafar"], a: 0 },
    { c: "Descendants", q: "What magical item does Mal need to steal in the first Descendants movie?", o: ["The Fairy Godmother's wand", "A magic mirror", "A glass slipper", "A poisoned apple"], a: 0 },

    // --- Simpsons (12) ---
    { c: "Simpsons", q: "What is the name of the town where the Simpsons live?", o: ["Springfield", "Shelbyville", "Ogdenville", "Capital City"], a: 0 },
    { c: "Simpsons", q: "What does Bart Simpson love to ride around town?", o: ["A skateboard", "A bicycle", "A scooter", "A unicycle"], a: 0 },
    { c: "Simpsons", q: "What is Homer Simpson's favorite snack?", o: ["Donuts", "Cookies", "Pretzels", "Chips"], a: 0 },
    { c: "Simpsons", q: "What color is the Simpson family's skin in the cartoon?", o: ["Yellow", "Blue", "Green", "Pink"], a: 0 },
    { c: "Simpsons", q: "What is the name of the Simpsons' pet dog?", o: ["Santa's Little Helper", "Rex", "Buddy", "Scruffy"], a: 0 },
    { c: "Simpsons", q: "Who is the baby of the Simpson family?", o: ["Maggie", "Lisa", "Bart", "Patty"], a: 0 },
    { c: "Simpsons", q: "What instrument does Lisa Simpson love to play?", o: ["Saxophone", "Piano", "Guitar", "Drums"], a: 0 },
    { c: "Simpsons", q: "Where does Homer Simpson work?", o: ["The nuclear power plant", "A donut shop", "A school", "A hospital"], a: 0 },
    { c: "Simpsons", q: "Who is Bart's best friend with orange hair and glasses?", o: ["Milhouse", "Nelson", "Ralph", "Martin"], a: 0 },
    { c: "Simpsons", q: "What is the name of the Simpsons' cat?", o: ["Snowball", "Whiskers", "Tom", "Felix"], a: 0 },
    { c: "Simpsons", q: "What is Homer's job title at the power plant?", o: ["Safety inspector", "Engineer", "Manager", "Scientist"], a: 0 },
    { c: "Simpsons", q: "What clown does Bart love to watch on TV?", o: ["Krusty the Clown", "Bonzo", "Ronald", "Chuckles"], a: 0 },

    // --- Spirited Away (8) ---
    { c: "Spirited Away", q: "What is the name of the girl who is the main character of Spirited Away?", o: ["Chihiro", "Kiki", "Ponyo", "Mei"], a: 0 },
    { c: "Spirited Away", q: "What happens to Chihiro's parents after they eat mysterious food?", o: ["They turn into pigs", "They fall asleep", "They disappear", "They turn into statues"], a: 0 },
    { c: "Spirited Away", q: "What kind of building is the magical place Chihiro must work in?", o: ["A bathhouse for spirits", "A castle", "A train station", "A school"], a: 0 },
    { c: "Spirited Away", q: "Who runs the bathhouse and has a giant head and tiny body?", o: ["Yubaba", "Zeniba", "Haku", "No-Face"], a: 0 },
    { c: "Spirited Away", q: "What is the name of the boy who helps Chihiro and can turn into a dragon?", o: ["Haku", "Boh", "Kamaji", "Lin"], a: 0 },
    { c: "Spirited Away", q: "What must Chihiro remember in order to leave the spirit world?", o: ["Her true name", "A magic spell", "Her parents' names", "A secret password"], a: 0 },
    { c: "Spirited Away", q: "What are the little black, dust-like creatures that carry coal in the bathhouse?", o: ["Soot sprites", "Fireflies", "Ghosts", "Fairies"], a: 0 },
    { c: "Spirited Away", q: "What famous animation studio made Spirited Away?", o: ["Studio Ghibli", "Pixar", "Disney", "DreamWorks"], a: 0 },

    // --- Christmas (14) ---
    { c: "Christmas", q: "What color is Santa Claus's suit?", o: ["Red", "Blue", "Green", "Purple"], a: 0 },
    { c: "Christmas", q: "Where does Santa Claus live?", o: ["The North Pole", "The South Pole", "A castle", "An island"], a: 0 },
    { c: "Christmas", q: "What do children traditionally leave out for Santa on Christmas Eve?", o: ["Cookies and milk", "Sandwiches and juice", "Cake and tea", "Fruit and water"], a: 0 },
    { c: "Christmas", q: "What is the name of Santa's most famous red-nosed reindeer?", o: ["Rudolph", "Dasher", "Comet", "Blitzen"], a: 0 },
    { c: "Christmas", q: "What do people traditionally decorate with lights and ornaments at Christmas?", o: ["A Christmas tree", "A garden", "A car", "A cake"], a: 0 },
    { c: "Christmas", q: "What do people call Santa's little helpers who make toys?", o: ["Elves", "Fairies", "Gnomes", "Pixies"], a: 0 },
    { c: "Christmas", q: "What do people hang by the fireplace hoping Santa will fill with gifts?", o: ["Stockings", "Bags", "Baskets", "Boxes"], a: 0 },
    { c: "Christmas", q: "On what date is Christmas celebrated?", o: ["December 25th", "December 31st", "January 1st", "December 1st"], a: 0 },
    { c: "Christmas", q: "What plant do people traditionally kiss under at Christmas?", o: ["Mistletoe", "Holly", "Ivy", "Poinsettia"], a: 0 },
    { c: "Christmas", q: "How many reindeer, not counting Rudolph, traditionally pull Santa's sleigh?", o: ["Eight", "Six", "Ten", "Four"], a: 0 },
    { c: "Christmas", q: "What jingly Christmas song begins with \"Dashing through the snow\"?", o: ["Jingle Bells", "Silent Night", "Deck the Halls", "Frosty the Snowman"], a: 0 },
    { c: "Christmas", q: "What do people often build outside using snow in winter?", o: ["A snowman", "A sandcastle", "A tent", "A fort"], a: 0 },
    { c: "Christmas", q: "What striped sweet treat is often hung on Christmas trees?", o: ["A candy cane", "A lollipop", "A gummy bear", "A chocolate coin"], a: 0 },
    { c: "Christmas", q: "What does Santa Claus famously say to greet people?", o: ["Ho ho ho", "Fa la la", "Tada", "Abracadabra"], a: 0 },

    // --- Easter (10) ---
    { c: "Easter", q: "What animal is famous for delivering Easter eggs?", o: ["The Easter Bunny", "A chick", "A lamb", "A duck"], a: 0 },
    { c: "Easter", q: "What fun activity do kids do to find hidden decorated eggs?", o: ["An Easter egg hunt", "A treasure map", "A scavenger race", "A puzzle hunt"], a: 0 },
    { c: "Easter", q: "What sweet chocolate treat is often shaped like a bunny at Easter?", o: ["A chocolate bunny", "A chocolate Santa", "A chocolate pumpkin", "A chocolate heart"], a: 0 },
    { c: "Easter", q: "What small colorful candy often comes shaped like a tiny egg?", o: ["A jellybean", "A gumdrop", "A lollipop", "A marshmallow"], a: 0 },
    { c: "Easter", q: "What container do kids use to collect their Easter treats?", o: ["An Easter basket", "A backpack", "A jar", "A stocking"], a: 0 },
    { c: "Easter", q: "What season does Easter usually happen in the Northern Hemisphere?", o: ["Spring", "Winter", "Summer", "Autumn"], a: 0 },
    { c: "Easter", q: "What fluffy baby animal is often associated with Easter?", o: ["A baby chick", "A puppy", "A kitten", "A calf"], a: 0 },
    { c: "Easter", q: "What flower is often associated with Easter?", o: ["Lily", "Rose", "Tulip", "Daisy"], a: 0 },
    { c: "Easter", q: "What do people often decorate at Easter time using paint and dye?", o: ["Eggs", "Pumpkins", "Trees", "Cookies"], a: 0 },
    { c: "Easter", q: "What fuzzy-tailed animal hops around and is a symbol of Easter?", o: ["A rabbit", "A fox", "A deer", "A squirrel"], a: 0 },

    // --- Grinch (8) ---
    { c: "Grinch", q: "What color is the Grinch?", o: ["Green", "Blue", "Red", "Purple"], a: 0 },
    { c: "Grinch", q: "Where does the Grinch live?", o: ["On a mountain above Whoville", "In a cave by the sea", "Under a bridge", "In a big city"], a: 0 },
    { c: "Grinch", q: "What does the Grinch try to steal from the Whos?", o: ["Christmas", "Their pets", "Their gold", "Their food"], a: 0 },
    { c: "Grinch", q: "What is the name of the Grinch's loyal dog?", o: ["Max", "Rex", "Fido", "Buddy"], a: 0 },
    { c: "Grinch", q: "What cheerful town does the Grinch live near?", o: ["Whoville", "Springfield", "Bikini Bottom", "Seabrook"], a: 0 },
    { c: "Grinch", q: "What happens to the Grinch's heart at the end of the story?", o: ["It grows three sizes", "It turns to stone", "It shrinks away", "It freezes"], a: 0 },
    { c: "Grinch", q: "What costume does the Grinch wear to trick the Whos?", o: ["Santa Claus", "A snowman", "A reindeer", "An elf"], a: 0 },
    { c: "Grinch", q: "What is the title of the classic story about the Grinch stealing a holiday?", o: ["How the Grinch Stole Christmas!", "The Grinch's Big Day", "A Grinchy Winter", "Whoville Wonders"], a: 0 },

    // --- Dr. Seuss (9) ---
    { c: "Dr. Seuss", q: "Who wrote the classic book Green Eggs and Ham?", o: ["Dr. Seuss", "Roald Dahl", "Enid Blyton", "Beatrix Potter"], a: 0 },
    { c: "Dr. Seuss", q: "In Green Eggs and Ham, what strange food does the character refuse to try at first?", o: ["Green eggs and ham", "Blue pancakes", "Purple soup", "Pink spaghetti"], a: 0 },
    { c: "Dr. Seuss", q: "What Dr. Seuss book starts with the line \"One fish two fish\"?", o: ["One Fish Two Fish Red Fish Blue Fish", "Fox in Socks", "The Cat in the Hat", "Horton Hears a Who"], a: 0 },
    { c: "Dr. Seuss", q: "What tiny world does the elephant Horton protect in a Dr. Seuss book?", o: ["A speck of dust", "A flower", "A pond", "An egg"], a: 0 },
    { c: "Dr. Seuss", q: "What Dr. Seuss book is about protecting trees and nature?", o: ["The Lorax", "The Grinch", "Horton Hears a Who", "Fox in Socks"], a: 0 },
    { c: "Dr. Seuss", q: "Who famously says \"I speak for the trees\" in a Dr. Seuss book?", o: ["The Lorax", "Horton", "The Grinch", "The Cat in the Hat"], a: 0 },
    { c: "Dr. Seuss", q: "What Dr. Seuss book cheers kids on as they head out into the world?", o: ["Oh, the Places You'll Go!", "Green Eggs and Ham", "The Lorax", "Horton Hatches the Egg"], a: 0 },
    { c: "Dr. Seuss", q: "What silly Dr. Seuss book is famous for its tongue-twisting rhymes about a fox?", o: ["Fox in Socks", "The Cat in the Hat", "Horton Hears a Who", "The Lorax"], a: 0 },
    { c: "Dr. Seuss", q: "What was the real name of the author known as \"Dr. Seuss\"?", o: ["Theodor Geisel", "Roald Dahl", "Enid Blyton", "Maurice Sendak"], a: 0 },

    // --- Cat in the Hat (7) ---
    { c: "Cat in the Hat", q: "What does the Cat in the Hat wear on top of his head?", o: ["A tall red and white striped hat", "A green cap", "A crown", "A wizard hat"], a: 0 },
    { c: "Cat in the Hat", q: "What are the names of the two mischievous creatures the Cat lets out of a big box?", o: ["Thing One and Thing Two", "Tweedle Dee and Tweedle Dum", "Huey and Dewey", "Bert and Ernie"], a: 0 },
    { c: "Cat in the Hat", q: "What pet watches the children and worries about the mess the Cat makes?", o: ["The Fish", "The Dog", "The Cat's friend", "The Bird"], a: 0 },
    { c: "Cat in the Hat", q: "What does the Cat use to clean up the huge mess at the end of the story?", o: ["A special cleaning machine", "A magic broom", "A vacuum", "A mop"], a: 0 },
    { c: "Cat in the Hat", q: "What is the weather like outside while the story takes place?", o: ["Rainy", "Sunny", "Snowy", "Windy"], a: 0 },
    { c: "Cat in the Hat", q: "Who is home alone with her brother when the Cat visits?", o: ["Sally", "Lucy", "Jane", "Alice"], a: 0 },
    { c: "Cat in the Hat", q: "What does the Cat balance on one hand while standing on a ball?", o: ["A cake, a rake, and a fish", "A stack of books only", "A pile of toys", "A tower of blocks"], a: 0 },

    // --- Elf (8) ---
    { c: "Elf", q: "What is the name of the human raised as an elf in the movie Elf?", o: ["Buddy", "Walter", "Michael", "Charlie"], a: 0 },
    { c: "Elf", q: "Where was Buddy raised, believing he was an elf?", o: ["The North Pole", "New York City", "A small village", "A toy factory"], a: 0 },
    { c: "Elf", q: "According to Buddy, what are the four main food groups?", o: ["Candy, candy canes, candy corn, and syrup", "Fruits, vegetables, meat, and grains", "Cookies, cake, pie, and milk", "Bread, cheese, ham, and juice"], a: 0 },
    { c: "Elf", q: "What city does Buddy travel to in order to find his real father?", o: ["New York City", "Los Angeles", "Chicago", "Boston"], a: 0 },
    { c: "Elf", q: "What does Buddy famously pour all over his spaghetti?", o: ["Maple syrup", "Ketchup", "Chocolate sauce", "Honey"], a: 0 },
    { c: "Elf", q: "What is the name of Buddy's real father in the movie?", o: ["Walter Hobbs", "James Hobbs", "Michael Hobbs", "Robert Hobbs"], a: 0 },
    { c: "Elf", q: "What does Buddy shout excitedly when he sees Santa Claus?", o: ["'SANTA! I know him!'", "'Santa is real!'", "'It's Christmas!'", "'Ho ho ho!'"], a: 0 },
    { c: "Elf", q: "What does Buddy help save at the end of the movie, using Christmas spirit?", o: ["Santa's sleigh", "Santa's workshop", "The North Pole", "Christmas Eve"], a: 0 },

    // --- Lollies (8) ---
    { c: "Lollies", q: "What is another word for candy or sweets, often used in Australia and New Zealand?", o: ["Lollies", "Snacks", "Treats", "Munchies"], a: 0 },
    { c: "Lollies", q: "What long, chewy, colorful candy is shaped like a wiggly worm?", o: ["A gummy worm", "A licorice stick", "A candy cane", "A jawbreaker"], a: 0 },
    { c: "Lollies", q: "What hard candy on a stick do you lick until it disappears?", o: ["A lollipop", "A gumball", "A mint", "A caramel"], a: 0 },
    { c: "Lollies", q: "What small, colorful, chewy candy comes in a big bag with lots of flavors?", o: ["Jellybeans", "Marshmallows", "Toffees", "Chocolates"], a: 0 },
    { c: "Lollies", q: "What sweet treat has a caramel and nougat center covered in chocolate?", o: ["A chocolate bar", "A jellybean", "A lollipop", "A gumdrop"], a: 0 },
    { c: "Lollies", q: "What red and white striped candy is shaped like a walking stick?", o: ["A candy cane", "A peppermint", "A licorice twist", "A lollipop"], a: 0 },
    { c: "Lollies", q: "What kind of candy fizzes and pops on your tongue?", o: ["Popping candy", "Chewing gum", "Hard candy", "Marshmallows"], a: 0 },
    { c: "Lollies", q: "What stretchy, sticky candy do you chew for a long time but never swallow?", o: ["Chewing gum", "Toffee", "Fudge", "Caramel"], a: 0 },

    // --- Fairies (8) ---
    { c: "Fairies", q: "What is the name of the fairy in Peter Pan who is a little jealous of Wendy?", o: ["Tinker Bell", "Silky", "Periwinkle", "Rosetta"], a: 0 },
    { c: "Fairies", q: "What do fairies in stories often sprinkle to make magic happen?", o: ["Fairy dust", "Glitter glue", "Star sand", "Moon powder"], a: 0 },
    { c: "Fairies", q: "What magical winged creature grants wishes and casts spells with a wand?", o: ["A fairy", "A goblin", "A troll", "A dragon"], a: 0 },
    { c: "Fairies", q: "What fairy visits children at night when they lose a tooth?", o: ["The Tooth Fairy", "The Sandman", "The Sleep Fairy", "The Star Fairy"], a: 0 },
    { c: "Fairies", q: "Who is the magical fairy that helps Cinderella get ready for the ball?", o: ["The Fairy Godmother", "The Tooth Fairy", "Tinker Bell", "The Snow Queen"], a: 0 },
    { c: "Fairies", q: "What object do fairies typically use to cast their spells?", o: ["A magic wand", "A broomstick", "A crystal ball", "A magic mirror"], a: 0 },
    { c: "Fairies", q: "What tiny sparkly stuff do fairies leave behind when they fly by?", o: ["Fairy dust", "Rainbow dust", "Sparkle trail", "Moonlight"], a: 0 },
    { c: "Fairies", q: "In stories, what do fairies often use as a tiny umbrella or hat?", o: ["A flower petal", "A leaf boat", "A snail shell", "A pebble"], a: 0 },

    // --- Faraway Tree (8) ---
    { c: "Faraway Tree", q: "What is the name of the enormous magical tree in Enid Blyton's famous story?", o: ["The Faraway Tree", "The Wishing Tree", "The Whispering Tree", "The Enchanted Oak"], a: 0 },
    { c: "Faraway Tree", q: "What appears at the top of the Faraway Tree, changing every so often?", o: ["A different magical land", "A castle", "A rainbow bridge", "A treasure chest"], a: 0 },
    { c: "Faraway Tree", q: "What is the name of the grumpy pixie who lives partway up the tree?", o: ["The Angry Pixie", "The Grumpy Gnome", "The Cross Elf", "The Sour Sprite"], a: 0 },
    { c: "Faraway Tree", q: "What is the name of the friendly round-faced man who lives in the tree?", o: ["Moonface", "Saucepan Man", "Silky", "Watzisname"], a: 0 },
    { c: "Faraway Tree", q: "Who pours soapy water down the tree, soaking anyone below?", o: ["Dame Washalot", "The Angry Pixie", "Moonface", "Mister Watzisname"], a: 0 },
    { c: "Faraway Tree", q: "What does Moonface use to slide all the way down inside the tree?", o: ["A curly slide", "A rope ladder", "A magic elevator", "A giant leaf"], a: 0 },
    { c: "Faraway Tree", q: "What is the name of the forest where the Faraway Tree grows?", o: ["The Enchanted Wood", "Whispering Woods", "The Magic Grove", "Fernly Forest"], a: 0 },
    { c: "Faraway Tree", q: "Who wrote The Magic Faraway Tree?", o: ["Enid Blyton", "Roald Dahl", "Dr. Seuss", "Beatrix Potter"], a: 0 },

    // --- Ghostbusters (8) ---
    { c: "Ghostbusters", q: "What special equipment do the Ghostbusters wear on their backs to catch ghosts?", o: ["Proton packs", "Jetpacks", "Vacuum packs", "Rocket boosters"], a: 0 },
    { c: "Ghostbusters", q: "What is the famous phrase people say when they need the Ghostbusters?", o: ["'Who ya gonna call?'", "'Help is on the way!'", "'Ghosts beware!'", "'Call the squad!'"], a: 0 },
    { c: "Ghostbusters", q: "What is the name of the friendly green ghost the Ghostbusters often chase?", o: ["Slimer", "Boo", "Gooey", "Spook"], a: 0 },
    { c: "Ghostbusters", q: "What giant mascot comes to life and stomps through the city in the first movie?", o: ["The Stay Puft Marshmallow Man", "The Gingerbread Giant", "The Balloon Man", "The Snowman"], a: 0 },
    { c: "Ghostbusters", q: "What symbol represents the Ghostbusters team, with a ghost and a red line through it?", o: ["The no-ghost logo", "A skull and crossbones", "A lightning bolt", "A star"], a: 0 },
    { c: "Ghostbusters", q: "What special car do the Ghostbusters drive around town?", o: ["Ecto-1", "The Ghostmobile", "The Spook Wagon", "The Phantom Car"], a: 0 },
    { c: "Ghostbusters", q: "What device do the Ghostbusters use to trap a ghost once they catch it?", o: ["A ghost trap", "A ghost cage", "A spirit jar", "A soul box"], a: 0 },
    { c: "Ghostbusters", q: "What is the main job of the Ghostbusters?", o: ["Catching and removing ghosts", "Fighting monsters", "Building robots", "Exploring space"], a: 0 },

    // --- Toys (8) ---
    { c: "Toys", q: "What toy spins on a point and can balance while twirling around?", o: ["A top", "A yo-yo", "A marble", "A ball"], a: 0 },
    { c: "Toys", q: "What toy flies in the sky and is controlled with a long string?", o: ["A kite", "A balloon", "A frisbee", "A paper plane"], a: 0 },
    { c: "Toys", q: "What building toy is made of small colorful interlocking plastic bricks?", o: ["LEGO bricks", "Wooden blocks", "Puzzle pieces", "Magnetic tiles"], a: 0 },
    { c: "Toys", q: "What soft, cuddly stuffed toy is a classic bedtime companion for kids?", o: ["A teddy bear", "A rag doll", "A pillow pet", "A plush dinosaur"], a: 0 },
    { c: "Toys", q: "What round toy do you bounce, throw, and kick in lots of different games?", o: ["A ball", "A hoop", "A frisbee", "A balloon"], a: 0 },
    { c: "Toys", q: "What two-wheeled toy do kids push along with their feet before riding a bike?", o: ["A balance bike", "A tricycle", "A scooter", "A skateboard"], a: 0 },
    { c: "Toys", q: "What toy has a crank you turn until it suddenly pops open with a surprise?", o: ["A jack-in-the-box", "A music box", "A treasure chest", "A puppet"], a: 0 },
    { c: "Toys", q: "What string toy loops around your finger and you flip up and down?", o: ["A yo-yo", "A spinning top", "A paddle ball", "A slinky"], a: 0 },

    // --- Toy Story (10) ---
    { c: "Toy Story", q: "Who is the cowboy toy that belongs to Andy in Toy Story?", o: ["Woody", "Buzz Lightyear", "Rex", "Mr. Potato Head"], a: 0 },
    { c: "Toy Story", q: "Who is the space ranger action figure who becomes Andy's toy?", o: ["Buzz Lightyear", "Woody", "Slinky Dog", "Hamm"], a: 0 },
    { c: "Toy Story", q: "What is Buzz Lightyear's famous catchphrase?", o: ["'To infinity and beyond!'", "'Reach for the sky!'", "'You've got a friend in me!'", "'Blast off!'"], a: 0 },
    { c: "Toy Story", q: "What is the name of the neighbor kid who breaks toys apart?", o: ["Sid", "Al", "Chunk", "Buster"], a: 0 },
    { c: "Toy Story", q: "What toy is a stretchy dog with a spring for a body?", o: ["Slinky Dog", "Rex", "Bullseye", "Wheezy"], a: 0 },
    { c: "Toy Story", q: "What is the name of the yodeling cowgirl toy who joins Andy's group?", o: ["Jessie", "Bo Peep", "Barbie", "Dolly"], a: 0 },
    { c: "Toy Story", q: "Who is the grumpy potato-shaped toy with parts that can be rearranged?", o: ["Mr. Potato Head", "Hamm", "Rex", "Lenny"], a: 0 },
    { c: "Toy Story", q: "What daycare center do the toys end up at in Toy Story 3?", o: ["Sunnyside Daycare", "Happy Hills Daycare", "Rainbow Daycare", "Little Tykes Daycare"], a: 0 },
    { c: "Toy Story", q: "What homemade toy made from a spork and craft supplies appears in Toy Story 4?", o: ["Forky", "Ducky", "Bunny", "Combat Carl"], a: 0 },
    { c: "Toy Story", q: "What is the name of the boy who first owns Woody and Buzz?", o: ["Andy", "Sid", "Al", "Bonnie"], a: 0 },

    // --- Pixar (10) ---
    { c: "Pixar", q: "In Finding Nemo, what kind of fish is Nemo?", o: ["A clownfish", "A goldfish", "A shark", "A seahorse"], a: 0 },
    { c: "Pixar", q: "What is the name of Nemo's forgetful blue fish friend?", o: ["Dory", "Marlin", "Bruce", "Gill"], a: 0 },
    { c: "Pixar", q: "What does Carl use to make his house fly in the movie Up?", o: ["Balloons", "A rocket", "A giant fan", "A magic carpet"], a: 0 },
    { c: "Pixar", q: "What is the name of the robot who cleans up Earth in WALL-E?", o: ["WALL-E", "EVE", "R2-D2", "Baymax"], a: 0 },
    { c: "Pixar", q: "In Inside Out, what is the name of the cheerful yellow emotion inside Riley's head?", o: ["Joy", "Sadness", "Anger", "Fear"], a: 0 },
    { c: "Pixar", q: "What is the name of the rat who dreams of becoming a chef in Ratatouille?", o: ["Remy", "Linguini", "Emile", "Skinner"], a: 0 },
    { c: "Pixar", q: "What Pixar movie is about a family who secretly has superpowers?", o: ["The Incredibles", "Big Hero 6", "Cars", "Brave"], a: 0 },
    { c: "Pixar", q: "In Coco, what special family celebration is the story built around?", o: ["Día de los Muertos (Day of the Dead)", "Christmas", "A birthday party", "A wedding"], a: 0 },
    { c: "Pixar", q: "What Pixar movie takes place mostly in the world of talking race cars?", o: ["Cars", "Turbo", "Wreck-It Ralph", "Speed Racer"], a: 0 },
    { c: "Pixar", q: "What is the name of the big purple-blue furry monster in Monsters, Inc.?", o: ["Sulley", "Mike", "Randall", "Roz"], a: 0 },

    // --- Disney (15) ---
    { c: "Disney", q: "What is the name of the ice queen who can freeze anything she touches in Frozen?", o: ["Elsa", "Anna", "Rapunzel", "Belle"], a: 0 },
    { c: "Disney", q: "What is the name of Elsa's sister in Frozen?", o: ["Anna", "Moana", "Merida", "Tiana"], a: 0 },
    { c: "Disney", q: "What is the name of the friendly snowman who loves warm hugs in Frozen?", o: ["Olaf", "Sven", "Kristoff", "Marshmallow"], a: 0 },
    { c: "Disney", q: "What Disney princess sails the ocean to save her island?", o: ["Moana", "Ariel", "Pocahontas", "Jasmine"], a: 0 },
    { c: "Disney", q: "What is the name of the lion cub who becomes king in The Lion King?", o: ["Simba", "Mufasa", "Timon", "Nala"], a: 0 },
    { c: "Disney", q: "What does Aladdin fly on with Princess Jasmine?", o: ["A magic carpet", "A flying elephant", "A dragon", "A giant bird"], a: 0 },
    { c: "Disney", q: "What is the name of the mermaid princess who wishes to live on land?", o: ["Ariel", "Elsa", "Moana", "Tiana"], a: 0 },
    { c: "Disney", q: "What Disney princess falls into a deep sleep for 100 years?", o: ["Sleeping Beauty (Aurora)", "Snow White", "Cinderella", "Belle"], a: 0 },
    { c: "Disney", q: "What Disney princess has extremely long, magical golden hair?", o: ["Rapunzel", "Elsa", "Anna", "Merida"], a: 0 },
    { c: "Disney", q: "What Disney movie is about a girl with magical powers who lives in a colorful house in Colombia?", o: ["Encanto", "Coco", "Moana", "Luca"], a: 0 },
    { c: "Disney", q: "Who falls in love with a prince who was cursed to become a beast?", o: ["Belle", "Snow White", "Cinderella", "Jasmine"], a: 0 },
    { c: "Disney", q: "What Disney princess loses a glass slipper at a royal ball?", o: ["Cinderella", "Snow White", "Aurora", "Belle"], a: 0 },
    { c: "Disney", q: "What magical character grants three wishes in Aladdin?", o: ["The Genie", "The Sultan", "Jafar", "Abu"], a: 0 },
    { c: "Disney", q: "What Disney movie follows a warrior girl who joins the army disguised as a man?", o: ["Mulan", "Pocahontas", "Brave", "Moana"], a: 0 },
    { c: "Disney", q: "What Disney character is a flying baby elephant with giant ears?", o: ["Dumbo", "Baloo", "Simba", "Bambi"], a: 0 },

    // --- Pop Culture (8) ---
    { c: "Pop Culture", q: "What building and survival video game lets you create anything out of blocks?", o: ["Minecraft", "Roblox", "Fortnite", "Pokémon"], a: 0 },
    { c: "Pop Culture", q: "What loveable Australian cartoon dog is the star of her own hit TV show?", o: ["Bluey", "Peppa", "Chase", "Clifford"], a: 0 },
    { c: "Pop Culture", q: "What team of rescue puppies use cool vehicles to save the day in a popular show?", o: ["PAW Patrol", "Wonder Pets", "Octonauts", "Rescue Rangers"], a: 0 },
    { c: "Pop Culture", q: "What pocket monsters do trainers catch, train, and battle in a famous game and show?", o: ["Pokémon", "Digimon", "Yo-kai", "Monster Hunters"], a: 0 },
    { c: "Pop Culture", q: "What is the name of the yellow electric mouse who is the most famous Pokémon?", o: ["Pikachu", "Charmander", "Squirtle", "Bulbasaur"], a: 0 },
    { c: "Pop Culture", q: "What movie franchise features small plastic minifigures who build things from bricks?", o: ["The LEGO Movie", "Toy Story", "Wreck-It Ralph", "Ralph Breaks the Internet"], a: 0 },
    { c: "Pop Culture", q: "What famous mouse is the official mascot of the Disney company?", o: ["Mickey Mouse", "Jerry", "Stuart Little", "Speedy Gonzales"], a: 0 },
    { c: "Pop Culture", q: "What do you call a story told using moving pictures shown in a cinema?", o: ["A movie", "A comic", "A podcast", "A postcard"], a: 0 }
];
