var config = {
    input: '/dev/stdin',
    newline: '\n'
};

var lines = require('fs')
    .readFileSync(config.input, 'ascii')
    .split(config.newline);

var dimensions = lines[0].split(' ').map(Number);
var H = dimensions[0];
var W = dimensions[1];

var field = lines.slice(1, 1 + H);

var patternDimensions = lines[1 + H].split(' ').map(Number);
var R = patternDimensions[0];
var C = patternDimensions[1];

var pattern = lines.slice(2 + H, 2 + H + R);

var matches = new Array(H);

for (var fieldRow = 0; fieldRow < H; fieldRow++) {
    matches[fieldRow] = new Array(R);

    for (var patternRow = 0; patternRow < R; patternRow++) {
        matches[fieldRow][patternRow] = {};

        var column = field[fieldRow].indexOf(pattern[patternRow]);
        while (column !== -1) {
            matches[fieldRow][patternRow][column] = true;
            column = field[fieldRow].indexOf(pattern[patternRow], column + 1);
        }
    }
}

for (var row = 0; row <= H - R; row++) {
    for (var column = 0; column <= W - C; column++) {
        var found = true;

        for (var offset = 0; offset < R; offset++) {
            if (!matches[row + offset][offset].hasOwnProperty(column)) {
                found = false;
                break;
            }
        }

        if (found) {
            console.log('%d %d', row, column);
        }
    }
}
