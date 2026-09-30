function calc(value) {
    let scale = 1;

    while ((value & 3) === 0) {
        scale++;
        value >>>= 2;
    }

    return [scale, value & 1];
}

function matches(pattern, row, column) {
    row = Math.floor(row / pattern[0]);

    if (!pattern[1]) {
        return !(row & 1);
    }

    column = Math.floor(column / pattern[0]);
    return !((column + row) & 1);
}

function Main(input) {
    const values = input.split(' ').map(value => +value);
    const size = values[0];
    const firstPattern = calc(values[1]);
    const secondPattern = calc(values[2]);
    const result = [];

    for (let row = 0; row < 2 * size; row++) {
        for (let column = 0; column < 2 * size; column++) {
            if (
                matches(firstPattern, row, column) &&
                matches(secondPattern, row, column)
            ) {
                result.push(row + ' ' + column);
            }

            if (result.length === size * size) {
                console.log(result.join('\n'));
                return;
            }
        }
    }
}

Main(require('fs').readFileSync('input.in', 'utf8'));
