// Postie Run - Enemy Sprites
PR.SpriteEnemies = {
    register: function() {

        // ANGRY DOG (16x12) - 2 run frames
        var dogPal = {
            'B': '#8B5A2B', 'b': '#6B3A1B', 'K': '#000000',
            'W': '#FFFFFF', 'E': '#FF0000', 'T': '#CC3333',
            'N': '#3A2010', 'G': '#888888'
        };

        PR.SpriteCache.create('dog_0', 16, 12, function(ctx) {
            PR.SpriteRenderer.fromPixelMap(ctx, [
                '....KKK.........',
                '...KBBBK..KK....',
                '..KBEEBKKBBK....',
                '..KBWWBBBBBK....',
                '...KBTKKBBBK....',
                '...KKBBBBBBK....',
                '....KBBBBBBK....',
                '....KBBBBBBK....',
                '...KB.KB..BK....',
                '...KB.KB..BK....',
                '..KBK.KBK.KBK...',
                '..KK...KK..KK...'
            ], dogPal);
        });

        PR.SpriteCache.create('dog_1', 16, 12, function(ctx) {
            PR.SpriteRenderer.fromPixelMap(ctx, [
                '....KKK.........',
                '...KBBBK..KK....',
                '..KBEEBKKBBK....',
                '..KBWWBBBBBK....',
                '...KBTKKBBBK....',
                '...KKBBBBBBK....',
                '....KBBBBBBK....',
                '....KBBBBBBK....',
                '....KB.KB.BK....',
                '...KBK.KBK.K....',
                '..KB....KB......',
                '..KK....KK......'
            ], dogPal);
        });

        // SWOOPING MAGPIE (16x12) - 2 flap + 1 swoop
        var magPal = {
            'B': '#1A1A1A', 'W': '#E8E8E8', 'K': '#000000',
            'Y': '#FFCC00', 'E': '#FF0000', 'G': '#666666'
        };

        PR.SpriteCache.create('magpie_0', 16, 12, function(ctx) {
            PR.SpriteRenderer.fromPixelMap(ctx, [
                '................',
                '..K..........K..',
                '.KBK........KBK.',
                'KBBK..KKKK..KBBK',
                'KWBK.KBBBBK.KBWK',
                '.KK.KBBBBBBK.KK.',
                '....KBWBBWBK....',
                '....KBYBBYBK....',
                '.....KBBBBK.....',
                '.....KBWWBK.....',
                '......KBBK......',
                '.......KK.......'
            ], magPal);
        });

        PR.SpriteCache.create('magpie_1', 16, 12, function(ctx) {
            PR.SpriteRenderer.fromPixelMap(ctx, [
                '................',
                '................',
                '....KKKKKKKK....',
                '...KBBBBBBBBK...',
                '..KWBBBBBBBBWK..',
                '.KBBKBBBBBBKBBK.',
                'KBBKKBWBBWBKKBBK',
                '.KK.KBYBBYBK.KK.',
                '.....KBBBBK.....',
                '.....KBWWBK.....',
                '......KBBK......',
                '.......KK.......'
            ], magPal);
        });

        PR.SpriteCache.create('magpie_swoop', 16, 16, function(ctx) {
            PR.SpriteRenderer.fromPixelMap(ctx, [
                '................',
                '..KK......KK....',
                '.KBBK....KBBK...',
                'KWBBK....KBBWK..',
                'KBBBKKKKKKKBBK..',
                '.KKBBBBBBBBKK...',
                '...KBBBBBBK.....',
                '...KBWBBWBK.....',
                '...KBYBBYBK.....',
                '....KBBBBK......',
                '....KBWWBK......',
                '.....KBBK.......',
                '.....KBBK.......',
                '......KBK.......',
                '......KBK.......',
                '.......K........'
            ], magPal);
        });

        // SEAGULL - recolored magpie
        var sgPal = {
            'B': '#E8E8E8', 'W': '#FFFFFF', 'K': '#000000',
            'Y': '#FFAA00', 'E': '#222222', 'G': '#CCCCCC'
        };
        PR.SpriteCache.create('seagull_0', 16, 12, function(ctx) {
            PR.SpriteRenderer.fromPixelMap(ctx, [
                '................',
                '..K..........K..',
                '.KBK........KBK.',
                'KBBK..KKKK..KBBK',
                'KWBK.KBBBBK.KBWK',
                '.KK.KBBBBBBK.KK.',
                '....KBEBBEEK....',
                '....KBYBBYBK....',
                '.....KBBBBK.....',
                '.....KBYYYK.....',
                '......KBBK......',
                '.......KK.......'
            ], sgPal);
        });
        PR.SpriteCache.create('seagull_1', 16, 12, function(ctx) {
            PR.SpriteRenderer.fromPixelMap(ctx, [
                '................',
                '................',
                '....KKKKKKKK....',
                '...KBBBBBBBBK...',
                '..KWBBBBBBBBWK..',
                '.KBBKBBBBBBKBBK.',
                'KBBKKBEBBEKKBBK.',
                '.KK.KBYBBYBK.KK.',
                '.....KBBBBK.....',
                '.....KBYYYK.....',
                '......KBBK......',
                '.......KK.......'
            ], sgPal);
        });

        // AMAZON VAN (48x28)
        PR.SpriteCache.create('van', 48, 28, function(ctx) {
            var c = ctx;
            // Body
            c.fillStyle = '#1A3A5C';
            c.fillRect(2, 4, 44, 18);
            // Outline
            c.fillStyle = '#000000';
            c.fillRect(1, 3, 46, 1);
            c.fillRect(1, 22, 46, 1);
            c.fillRect(1, 3, 1, 20);
            c.fillRect(46, 3, 1, 20);
            // Windshield
            c.fillStyle = '#AADDFF';
            c.fillRect(38, 6, 7, 8);
            // Amazon arrow
            c.fillStyle = '#FF9900';
            c.fillRect(8, 10, 12, 2);
            c.fillRect(18, 8, 2, 2);
            c.fillRect(16, 12, 2, 2);
            // Headlights
            c.fillStyle = '#FFFF88';
            c.fillRect(44, 8, 2, 3);
            c.fillRect(44, 15, 2, 3);
            // Wheels
            c.fillStyle = '#333333';
            PR.SpriteRenderer.circle(ctx, 12, 24, 3, '#333333');
            PR.SpriteRenderer.circle(ctx, 12, 24, 1, '#888888');
            PR.SpriteRenderer.circle(ctx, 36, 24, 3, '#333333');
            PR.SpriteRenderer.circle(ctx, 36, 24, 1, '#888888');
            // Bumper
            c.fillStyle = '#888888';
            c.fillRect(46, 14, 2, 5);
        });

        // ANGRY PERSON (14x24) - 2 frames
        var persPal = {
            'S': '#E0B090', 's': '#C89878', 'K': '#000000',
            'H': '#6B4226', 'T': '#3388DD', 't': '#2266AA',
            'P': '#445566', 'p': '#334455',
            'B': '#3A3A3A', 'W': '#FFFFFF', 'R': '#CC0000',
            'G': '#888888'
        };

        PR.SpriteCache.create('person_0', 16, 24, function(ctx) {
            PR.SpriteRenderer.fromPixelMap(ctx, [
                '....KHHHHK......',
                '...KHHHHHK......',
                '...KSSSSSK......',
                '...KSsSSsK......',
                '...KSSSSK.......',
                '....KSSK........',
                '...KTTTTK.......',
                '..KTTTTTTKK.....',
                '..KTTTTTTSKWRK..',
                '..KTTTTTTSKWRK..',
                '...KSTTSKK.KK...',
                '...KSTTSK.......',
                '...KPPPPK.......',
                '...KPPPPK.......',
                '...KPK.KPK......',
                '...KPK.KPK......',
                '..KBBK.KBBK.....',
                '..KKK..KKKK.....',
                '................',
                '................',
                '................',
                '................',
                '................',
                '................'
            ], persPal);
        });

        PR.SpriteCache.create('person_1', 16, 24, function(ctx) {
            PR.SpriteRenderer.fromPixelMap(ctx, [
                '....KHHHHK......',
                '...KHHHHHK......',
                '...KSSSSSK......',
                '...KSsSSsK......',
                '...KSSSSK.......',
                '....KSSK........',
                '...KTTTTK.......',
                '..KTTTTTTK.KK...',
                '..KTTTTTTKKWRK..',
                '..KTTTTTTSKWRK..',
                '...KSTTSKK..K...',
                '...KSTTSK.......',
                '...KPPPPK.......',
                '...KPPPPK.......',
                '...KPK.KPK......',
                '...KPK.KPK......',
                '..KBBK.KBBK.....',
                '..KKK..KKKK.....',
                '................',
                '................',
                '................',
                '................',
                '................',
                '................'
            ], persPal);
        });

        // WHEELIE BIN (10x16)
        PR.SpriteCache.create('bin', 12, 16, function(ctx) {
            var bp = {'G': '#2A7A2A', 'g': '#1A6A1A', 'K': '#000000',
                      'Y': '#D0C020', 'D': '#444444', 'W': '#AAAAAA'};
            PR.SpriteRenderer.fromPixelMap(ctx, [
                '..KKKKKKKK..',
                '.KDDDDDDDDK.',
                '.KDDDDDDDDK.',
                'KGGGGGGGGGGK',
                'KGGGGGGGGGGK',
                'KGGGGGGGGGGK',
                'KYYYYYYYYYYK',
                'KGGGGGGGGGGK',
                'KGGGGGGGGGGK',
                'KGGGGGGGGGGK',
                'KGGGGGGGGGGK',
                'KGGGGGGGGGGK',
                'KGGGGGGGGGGK',
                'KGGGGGGGGGGK',
                '.KWWWWWWWWK.',
                '..KKKKKKKK..'
            ], bp);
        });

        // SPRINKLER (12x8)
        PR.SpriteCache.create('sprinkler', 12, 8, function(ctx) {
            ctx.fillStyle = '#888888';
            ctx.fillRect(5, 4, 2, 4);
            ctx.fillStyle = '#AAAAAA';
            ctx.fillRect(3, 2, 6, 2);
            ctx.fillStyle = '#44AAFF';
            ctx.fillRect(1, 0, 2, 2);
            ctx.fillRect(9, 0, 2, 2);
            ctx.fillRect(0, 0, 1, 1);
            ctx.fillRect(11, 0, 1, 1);
        });

        // LAWN MOWER (20x14)
        PR.SpriteCache.create('mower', 20, 14, function(ctx) {
            var mp = {'R': '#CC2200', 'r': '#AA1800', 'K': '#000000',
                      'G': '#888888', 'g': '#666666', 'B': '#333333',
                      'W': '#CCCCCC'};
            PR.SpriteRenderer.fromPixelMap(ctx, [
                '..........KK........',
                '.........KGGK.......',
                '.........KGGK.......',
                '........KGGGK.......',
                '.......KGGGK.......',
                '......KGGGK........',
                '.....KGGGK.........',
                'KKKKKRRRRRRRRRRKKK..',
                'KRRRRRRRRRRRRRRRRK..',
                'KRRRRRRRRRRRRRRRRK..',
                'KRRRRRRRRRRRRRRRRK..',
                'KKKKKKKKKKKKKKKKKKK.',
                '.KBBBKKKKKKKKKBBBbK.',
                '..KKK.........KKK..'
            ], mp);
        });

        // CAT ON FENCE (12x14)
        var catPal = {
            'O': '#E08820', 'o': '#C06810', 'K': '#000000',
            'W': '#FFFFFF', 'P': '#FFAAAA', 'G': '#44CC44',
            'T': '#C8A870', 't': '#A88850'
        };

        PR.SpriteCache.create('cat_0', 12, 14, function(ctx) {
            PR.SpriteRenderer.fromPixelMap(ctx, [
                '.KK......KK.',
                'KOKK....KKOK',
                'KOOKK..KKOOK',
                'KOOOOOOOOOK.',
                'KOWOOKWOOOK.',
                'KOGOOKGOOOK.',
                '.KOOPPOOOK..',
                '..KOOOOOOK..',
                '..KOOOOOK...',
                '..KOOOOOK...',
                '..KOOOOOK...',
                '...KOOOOK...',
                '..KOK.KOK...',
                '..KKK.KKK...'
            ], catPal);
        });

        PR.SpriteCache.create('cat_1', 14, 14, function(ctx) {
            PR.SpriteRenderer.fromPixelMap(ctx, [
                '.KK......KK...',
                'KOKK....KKOK..',
                'KOOKK..KKOOK..',
                'KOOOOOOOOOK...',
                'KOWOOKWOOOK...',
                'KOGOOKGOOOK...',
                '.KOOPPOOOK....',
                '..KOOOOOOKK...',
                '..KOOOOOKOOK..',
                '..KOOOOOKOOK..',
                '..KOOOOOK.KK..',
                '...KOOOOK.....',
                '..KOK.KOK.....',
                '..KKK.KKK.....'
            ], catPal);
        });

        // GARDEN HOSE (8x8)
        PR.SpriteCache.create('hose', 8, 8, function(ctx) {
            ctx.fillStyle = '#22AA22';
            ctx.fillRect(0, 3, 6, 2);
            ctx.fillRect(0, 2, 2, 4);
            ctx.fillStyle = '#888888';
            ctx.fillRect(6, 2, 2, 3);
            ctx.fillStyle = '#44AAFF';
            ctx.fillRect(7, 0, 1, 2);
            ctx.fillRect(6, 0, 1, 1);
        });

        // EMU (20x24)
        var emuPal = {
            'B': '#6B5040', 'b': '#3A2A20', 'K': '#000000',
            'W': '#FFFFFF', 'G': '#888888', 'Y': '#FFCC00',
            'E': '#AA0000'
        };

        PR.SpriteCache.create('emu_0', 20, 24, function(ctx) {
            PR.SpriteRenderer.fromPixelMap(ctx, [
                '..........KK........',
                '.........KBBK.......',
                '........KBBBK.......',
                '........KWBWBK......',
                '........KBBBK.......',
                '.........KYBK.......',
                '..........KBK.......',
                '...........KBK.....',
                '..........KBBBK....',
                '.........KBBBBBK...',
                '........KBBBBBBK...',
                '.......KBBBBBBBK...',
                '......KBBBBBBBBK...',
                '.....KBBBBBBBBK....',
                '....KBBBBBBBK......',
                '....KBBBBBBK.......',
                '....KBBBBBK........',
                '.....KBBBK.........',
                '.....KB.KBK........',
                '....KB..KBK........',
                '....KB...KB........',
                '...KB....KB........',
                '..KYK...KYYK.......',
                '..KKK...KKKK.......'
            ], emuPal);
        });

        PR.SpriteCache.create('emu_1', 20, 24, function(ctx) {
            PR.SpriteRenderer.fromPixelMap(ctx, [
                '..........KK........',
                '.........KBBK.......',
                '........KBBBK.......',
                '........KWBWBK......',
                '........KBBBK.......',
                '.........KYBK.......',
                '..........KBK.......',
                '...........KBK.....',
                '..........KBBBK....',
                '.........KBBBBBK...',
                '........KBBBBBBK...',
                '.......KBBBBBBBK...',
                '......KBBBBBBBBK...',
                '.....KBBBBBBBBK....',
                '....KBBBBBBBK......',
                '....KBBBBBBK.......',
                '....KBBBBBK........',
                '.....KBBBK.........',
                '....KBK.KBK........',
                '...KBK...KBK.......',
                '..KB......KB.......',
                '..KYK....KYYK......',
                '..KKK....KKKK......',
                '....................'
            ], emuPal);
        });

        // DROP BEAR (14x14)
        var dbPal = {
            'B': '#6B6B6B', 'b': '#4A4A4A', 'K': '#000000',
            'W': '#FFFFFF', 'N': '#3A2A2A', 'E': '#FF0000',
            'P': '#FFAAAA', 'T': '#8B6B4B'
        };

        PR.SpriteCache.create('dropbear', 14, 14, function(ctx) {
            PR.SpriteRenderer.fromPixelMap(ctx, [
                '..KK......KK..',
                '.KBBK....KBBK.',
                '.KBBK....KBBK.',
                '..KBBBBBBBBK..',
                '.KBBBBBBBBBBK.',
                '.KBWEBBBWEBK..',
                '.KBEEBBBBEEK..',
                '..KBBPPPBBK...',
                '..KBBBNBBK....',
                '...KBBBBK.....',
                '..KBBBBBBK....',
                '.KBbK..KbBK...',
                '.KBK....KBK...',
                '.KTK....KTK...'
            ], dbPal);
        });

        // ROAD TRAIN (64x24) - huge multi-trailer truck
        PR.SpriteCache.create('roadtrain', 64, 24, function(ctx) {
            var c = ctx;
            // Trailer 2 (rear)
            c.fillStyle = '#4A4A5A';
            c.fillRect(0, 4, 20, 14);
            c.fillStyle = '#000000';
            c.fillRect(0, 3, 20, 1);
            c.fillRect(0, 18, 20, 1);
            // Trailer 1
            c.fillStyle = '#4A4A5A';
            c.fillRect(22, 4, 20, 14);
            c.fillStyle = '#000000';
            c.fillRect(22, 3, 20, 1);
            c.fillRect(22, 18, 20, 1);
            // Cab
            c.fillStyle = '#CC4400';
            c.fillRect(44, 2, 18, 16);
            c.fillStyle = '#000000';
            c.fillRect(44, 1, 18, 1);
            c.fillRect(44, 18, 18, 1);
            // Windshield
            c.fillStyle = '#AADDFF';
            c.fillRect(56, 4, 5, 8);
            // Bull bar
            c.fillStyle = '#CCCCCC';
            c.fillRect(62, 4, 2, 14);
            // Headlights
            c.fillStyle = '#FFFF88';
            c.fillRect(62, 6, 2, 2);
            c.fillRect(62, 14, 2, 2);
            // Wheels (6 pairs)
            for (var i = 0; i < 6; i++) {
                var wx = 4 + i * 10;
                if (i >= 2) wx += 4;
                if (i >= 4) wx += 4;
                PR.SpriteRenderer.circle(ctx, wx, 21, 2, '#333333');
                PR.SpriteRenderer.circle(ctx, wx, 21, 1, '#888888');
            }
        });

        // BOSS: GIANT ROTTWEILER (48x40) - 2 frames
        var rottPal = {
            'B': '#1A1A1A', 'b': '#0A0A0A', 'K': '#000000',
            'T': '#C08040', 't': '#A06030', 'W': '#FFFFFF',
            'E': '#FF0000', 'e': '#CC0000', 'G': '#888888',
            'S': '#CCCCCC', 'N': '#3A1A1A', 'C': '#666666'
        };

        PR.SpriteCache.create('rottweiler_0', 48, 40, function(ctx) {
            PR.SpriteRenderer.fromPixelMap(ctx, [
                '........KKK..........................KKK........',
                '.......KBBBK........................KBBBK.......',
                '......KBBBBBK......................KBBBBBK......',
                '.....KBBBBBBBKKKKKKKKKKKKKKKKKKKKKKBBBBBBBK.....',
                '....KBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBK....',
                '...KBBBBEBBBBBBBBBBBBBBBBBBBBBBBBBBBBBEBBBBK....',
                '...KBBBBWBBBBBBBBBBBBBBBBBBBBBBBBBBBBBWBBBBBK...',
                '...KBBBTTTBBBBBBBBBBBBBBBBBBBBBBBBBBTTTBBBBK....',
                '....KBBBTBBBBBBBBBBBBBBBBBBBBBBBBBBBTBBBBBK.....',
                '.....KBBNBBBBBBBBBBBBBBBBBBBBBBBBBBBNBBBBK......',
                '......KKBSSSBBBBBBBBBBBBBBBBBBBBBBBBBBKK.......',
                '.......KBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBK........',
                '.......KBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBK........',
                '.......KBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBK........',
                '......KBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBK........',
                '......KBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBK........',
                '......KBBBBBBBBBBBBKSSKKBBBBBBBBBBBBBBK........',
                '......KBBBBBBBBBBBBKSSKBBBBBBBBBBBBBBK.........',
                '.....KBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBK.........',
                '.....KBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBK..........',
                '.....KBBBBBBBBBBBBBBBBBBBBBBBBBBBBBK...........',
                '.....KBBBBBBBBBBBBBBBBBBBBBBBBBBBBK............',
                '....KBBTBBBBBBBBBBBBBBBBBBBBBBBTBK.............',
                '....KBBTBK....................KBTBK............',
                '...KBBTBK....................KBTBBK............',
                '...KBBBK.....................KBBBK.............',
                '..KBBBK......................KBBBK.............',
                '..KBBBK......................KBBK..............',
                '.KBBBK.......................KBBK..............',
                '.KBBBK.......................KBBK..............',
                '.KBBBK.......................KBBK..............',
                'KBBBBK.......................KBBK..............',
                'KGGGKK.......................KGGK..............',
                '................................................',
                '................................................',
                '................................................',
                '................................................',
                '................................................',
                '................................................',
                '................................................'
            ], rottPal);
        });

        PR.SpriteCache.create('rottweiler_1', 48, 40, function(ctx) {
            PR.SpriteRenderer.fromPixelMap(ctx, [
                '........KKK..........................KKK........',
                '.......KBBBK........................KBBBK.......',
                '......KBBBBBK......................KBBBBBK......',
                '.....KBBBBBBBKKKKKKKKKKKKKKKKKKKKKKBBBBBBBK.....',
                '....KBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBK....',
                '...KBBBBEBBBBBBBBBBBBBBBBBBBBBBBBBBBBBEBBBBK....',
                '...KBBBBWBBBBBBBBBBBBBBBBBBBBBBBBBBBBBWBBBBBK...',
                '...KBBBTTTBBBBBBBBBBBBBBBBBBBBBBBBBBTTTBBBBK....',
                '....KBBBTBBBBBBBBBBBBBBBBBBBBBBBBBBBTBBBBBK.....',
                '.....KBBNBBBBBBBBBBBBBBBBBBBBBBBBBBBNBBBBK......',
                '......KKBBSSBBBBBBBBBBBBBBBBBBBBBBBBBBKK.......',
                '.......KBWWWWBBBBBBBBBBBBBBBBBBBBBBBBK.........',
                '.......KBBWWWBBBBBBBBBBBBBBBBBBBBBBBK..........',
                '.......KBBBBBBBBBBBBBBBBBBBBBBBBBBBBK..........',
                '......KBBBBBBBBBBBBBBBBBBBBBBBBBBBBBK..........',
                '......KBBBBBBBBBBBBBBBBBBBBBBBBBBBBBK..........',
                '......KBBBBBBBBBBBBKSSKKBBBBBBBBBBBBK..........',
                '......KBBBBBBBBBBBBKSSKBBBBBBBBBBBBK...........',
                '.....KBBBBBBBBBBBBBBBBBBBBBBBBBBBBBK...........',
                '.....KBBBBBBBBBBBBBBBBBBBBBBBBBBBBK............',
                '.....KBBBBBBBBBBBBBBBBBBBBBBBBBBBK.............',
                '.....KBBBBBBBBBBBBBBBBBBBBBBBBBBK..............',
                '....KBBTBBBBBBBBBBBBBBBBBBBBBTBK...............',
                '....KBBTBK....................KBTBK............',
                '...KBBBBK....................KBTBBK............',
                '...KBBBK.....................KBBBBK............',
                '..KBBK.......................KBBBK.............',
                '.KBBK.........................KBBK............',
                '.KBBK.........................KBBK............',
                'KBBBK.........................KBBBK...........',
                'KGGGK.........................KGGGK...........',
                '................................................',
                '................................................',
                '................................................',
                '................................................',
                '................................................',
                '................................................',
                '................................................',
                '................................................',
                '................................................'
            ], rottPal);
        });

        // CHIHUAHUA (10x8)
        var chiPal = {
            'T': '#D8A860', 't': '#B88840', 'K': '#000000',
            'W': '#FFFFFF', 'E': '#442200', 'P': '#FFAAAA',
            'N': '#8B6B4B'
        };

        PR.SpriteCache.create('chihuahua_0', 10, 8, function(ctx) {
            PR.SpriteRenderer.fromPixelMap(ctx, [
                '.KK....KK.',
                'KTTK..KTTK',
                'KTTTTTTTK.',
                'KWEWWEWTK.',
                'KTTPPTTK..',
                '.KTTTTK...',
                '.KT.KTK...',
                '.KK.KKK...'
            ], chiPal);
        });

        PR.SpriteCache.create('chihuahua_1', 10, 8, function(ctx) {
            PR.SpriteRenderer.fromPixelMap(ctx, [
                '.KK....KK.',
                'KTTK..KTTK',
                'KTTTTTTTK.',
                'KWEWWEWTK.',
                'KTTPPTTK..',
                '.KTTTTK...',
                '..KTKKT...',
                '..KK.KK...'
            ], chiPal);
        });
    }
};
