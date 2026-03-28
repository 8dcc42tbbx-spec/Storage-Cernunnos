// Postie Run - Utility Functions
PR.Utils = {
    // Random integer between min and max (inclusive)
    randInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Random float between min and max
    randFloat: function(min, max) {
        return Math.random() * (max - min) + min;
    },

    // Random element from array
    randChoice: function(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    },

    // Clamp value between min and max
    clamp: function(val, min, max) {
        return val < min ? min : val > max ? max : val;
    },

    // Linear interpolation
    lerp: function(a, b, t) {
        return a + (b - a) * t;
    },

    // Distance between two points
    dist: function(x1, y1, x2, y2) {
        var dx = x2 - x1, dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },

    // AABB overlap test
    aabb: function(a, b) {
        return a.x < b.x + b.w &&
               a.x + a.w > b.x &&
               a.y < b.y + b.h &&
               a.y + a.h > b.y;
    },

    // AABB overlap with result
    aabbResult: function(a, b) {
        if (!this.aabb(a, b)) return null;
        var overlapX = Math.min(a.x + a.w - b.x, b.x + b.w - a.x);
        var overlapY = Math.min(a.y + a.h - b.y, b.y + b.h - a.y);
        return { overlapX: overlapX, overlapY: overlapY };
    },

    // Angle between two points
    angle: function(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    },

    // Sign of number (-1, 0, 1)
    sign: function(n) {
        return n > 0 ? 1 : n < 0 ? -1 : 0;
    },

    // Ease out quad
    easeOut: function(t) {
        return t * (2 - t);
    },

    // Ease in out
    easeInOut: function(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    },

    // Simple pixel font rendering (built-in bitmap font)
    // Each character is 4x6 pixels
    _fontData: null,

    initFont: function() {
        this._fontData = {};
        var chars = {
            'A': ['0110','1001','1111','1001','1001','0000'],
            'B': ['1110','1001','1110','1001','1110','0000'],
            'C': ['0111','1000','1000','1000','0111','0000'],
            'D': ['1110','1001','1001','1001','1110','0000'],
            'E': ['1111','1000','1110','1000','1111','0000'],
            'F': ['1111','1000','1110','1000','1000','0000'],
            'G': ['0111','1000','1011','1001','0111','0000'],
            'H': ['1001','1001','1111','1001','1001','0000'],
            'I': ['1110','0100','0100','0100','1110','0000'],
            'J': ['0011','0001','0001','1001','0110','0000'],
            'K': ['1001','1010','1100','1010','1001','0000'],
            'L': ['1000','1000','1000','1000','1111','0000'],
            'M': ['1001','1111','1111','1001','1001','0000'],
            'N': ['1001','1101','1111','1011','1001','0000'],
            'O': ['0110','1001','1001','1001','0110','0000'],
            'P': ['1110','1001','1110','1000','1000','0000'],
            'Q': ['0110','1001','1001','1011','0111','0000'],
            'R': ['1110','1001','1110','1010','1001','0000'],
            'S': ['0111','1000','0110','0001','1110','0000'],
            'T': ['1111','0100','0100','0100','0100','0000'],
            'U': ['1001','1001','1001','1001','0110','0000'],
            'V': ['1001','1001','1001','0110','0100','0000'],
            'W': ['1001','1001','1111','1111','1001','0000'],
            'X': ['1001','0110','0110','0110','1001','0000'],
            'Y': ['1001','0110','0100','0100','0100','0000'],
            'Z': ['1111','0010','0100','1000','1111','0000'],
            '0': ['0110','1011','1101','1001','0110','0000'],
            '1': ['0100','1100','0100','0100','1110','0000'],
            '2': ['0110','1001','0010','0100','1111','0000'],
            '3': ['1110','0001','0110','0001','1110','0000'],
            '4': ['1001','1001','1111','0001','0001','0000'],
            '5': ['1111','1000','1110','0001','1110','0000'],
            '6': ['0110','1000','1110','1001','0110','0000'],
            '7': ['1111','0001','0010','0100','0100','0000'],
            '8': ['0110','1001','0110','1001','0110','0000'],
            '9': ['0110','1001','0111','0001','0110','0000'],
            ' ': ['0000','0000','0000','0000','0000','0000'],
            ':': ['0000','0100','0000','0100','0000','0000'],
            '!': ['0100','0100','0100','0000','0100','0000'],
            '-': ['0000','0000','1111','0000','0000','0000'],
            '.': ['0000','0000','0000','0000','0100','0000'],
            ',': ['0000','0000','0000','0100','1000','0000'],
            '\'':['0100','1000','0000','0000','0000','0000'],
            '/': ['0001','0010','0100','1000','0000','0000'],
            '?': ['0110','0001','0010','0000','0010','0000'],
            '#': ['0101','1111','0101','1111','0101','0000']
        };
        for (var c in chars) {
            this._fontData[c] = chars[c];
        }
    },

    drawText: function(ctx, text, x, y, color, scale) {
        if (!this._fontData) this.initFont();
        scale = scale || 1;
        color = color || '#FFFFFF';
        var origX = x;
        text = text.toUpperCase();
        for (var i = 0; i < text.length; i++) {
            var ch = text[i];
            var data = this._fontData[ch];
            if (data) {
                ctx.fillStyle = color;
                for (var row = 0; row < 6; row++) {
                    for (var col = 0; col < data[row].length; col++) {
                        if (data[row][col] === '1') {
                            ctx.fillRect(x + col * scale, y + row * scale, scale, scale);
                        }
                    }
                }
            }
            x += (5 * scale);
        }
        return x - origX; // return width
    },

    // Draw text with shadow
    drawTextShadow: function(ctx, text, x, y, color, shadowColor, scale) {
        this.drawText(ctx, text, x + scale, y + scale, shadowColor || '#000000', scale);
        return this.drawText(ctx, text, x, y, color, scale);
    },

    // Center text
    drawTextCentered: function(ctx, text, y, color, scale) {
        scale = scale || 1;
        var width = text.length * 5 * scale;
        var x = Math.floor((PR.CONST.CANVAS_W - width) / 2);
        return this.drawTextShadow(ctx, text, x, y, color, '#000000', scale);
    }
};
