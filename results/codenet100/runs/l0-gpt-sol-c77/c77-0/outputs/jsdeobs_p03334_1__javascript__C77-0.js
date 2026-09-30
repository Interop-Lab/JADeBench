function calculatePattern(value) {
    var blockSize = 1;

    while ((value & 3) === 0) {
        blockSize++;
        value >>>= 2;
    }

    return [blockSize, value & 1];
}

function matchesPattern(pattern, row, column) {
    row = Math.floor(row / pattern[0]);

    if (!pattern[1]) {
        return !(row & 1);
    }

    column = Math.floor(column / pattern[0]);
    return !((column + row) & 1);
}

function Main(input) {
    var values = input.split(' ').map(value => +value);
    var size = values[0];
    var firstPattern = calculatePattern(values[1]);
    var secondPattern = calculatePattern(values[2]);
    var positions = [];
    var count = 0;

    for (var row = 0; row < 2 * size; row++) {
        for (var column = 0; column < 2 * size; column++) {
            if (
                matchesPattern(firstPattern, row, column) &&
                matchesPattern(secondPattern, row, column)
            ) {
                positions[count++] = row + ' ' + column;
            }

            if (count === size * size) {
                console.log(positions.join('\n'));
                return;
            }
        }
    }
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
