function move(direction, dice) {
    const [top, north, east, west, south, bottom] = dice;

    switch (direction) {
        case 'N':
            return [north, bottom, east, west, top, south];
        case 'S':
            return [south, top, east, west, bottom, north];
        case 'E':
            return [west, north, top, bottom, south, east];
        case 'W':
            return [east, north, bottom, top, south, west];
        default:
            return [];
    }
}

const input = require('fs').readFileSync('/dev/stdin', 'utf8');
const lines = input.trim().split('\n');

let diceA = lines[0].split(' ').map(Number);
const diceB = lines[1].split(' ').map(Number);
const directions = 'NSEW'.split('');

let matches;
for (let i = 0; i < 100; i++) {
    const direction = directions[Math.floor(Math.random() * 4)];
    diceA = move(direction, diceA);
    matches = diceA.every((value, index) => value == diceB[index]);

    if (matches) {
        break;
    }
}

console.log(matches ? 'Yes' : 'No');
