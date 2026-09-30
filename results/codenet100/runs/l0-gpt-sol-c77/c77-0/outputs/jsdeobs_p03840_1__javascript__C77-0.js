'use strict';

const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');
const values = input.split(/ |\n/).slice(0, 7).map(Number);

function main() {
    const first = values[0];
    const base = values[1];
    const fourth = values[3];
    const fifth = values[4];

    let result =
        base +
        (((first / 2) | 0) +
            ((fourth / 2) | 0) +
            ((fifth / 2) | 0)) *
            2;

    const oddCount = first % 2 + fourth % 2 + fifth % 2;

    switch (oddCount) {
        case 3:
            result += 3;
            break;
        case 2:
            if (first * fourth * fifth) {
                result += 1;
            }
            break;
    }

    return result;
}

const output = main();
if (output !== undefined) {
    console.log(output);
}
