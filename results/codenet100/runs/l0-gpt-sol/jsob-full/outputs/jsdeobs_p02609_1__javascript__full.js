const input = require('fs').readFileSync('/dev/stdin', 'utf8');

const lines = input.split('\n');
const length = lines[0] - 0;
const binary = lines[1];
const value = parseInt(binary, 2);

function popcount(number) {
    let count = 0;

    do {
        if (number & 1) {
            count++;
        }
        number >>>= 1;
    } while (number);

    return count;
}

function reductionSteps(number) {
    if (number === 0) {
        return 0;
    }

    let steps = 1;
    while (number %= popcount(number)) {
        steps++;
    }

    return steps;
}

const ones = popcount(value);
const increasedPopcount = ones + 1;
const decreasedPopcount = ones - 1;

for (let index = 0; index < length; index++) {
    const bit = Math.pow(2, length - index - 1);
    const flippedValue = value ^ bit;

    if (flippedValue === 0) {
        console.log(0);
    } else {
        const newPopcount =
            binary[index] !== '1' ? increasedPopcount : decreasedPopcount;
        console.log(reductionSteps(flippedValue % newPopcount) + 1);
    }
}
