const fs = require('fs');

function rollDie(direction, faces) {
  const [top, front, right, left, back, bottom] = faces;

  switch (direction) {
    case 'N':
      return [front, bottom, right, left, top, back];
    case 'S':
      return [back, top, right, left, bottom, front];
    case 'E':
      return [left, front, top, bottom, back, right];
    case 'W':
      return [right, front, bottom, top, back, left];
    default:
      return [];
  }
}

const input = fs.readFileSync('/dev/stdin', 'utf8');
const lines = input.trim().split('\n');
let diceA = lines[0].split(' ').map(Number);
const diceB = lines[1].split(' ').map(Number);
const directions = 'NSEW'.split('');
let matches = false;

for (let roll = 0; roll < 100; roll++) {
  const direction = directions[Math.floor(Math.random() * 4)];
  diceA = rollDie(direction, diceA);
  matches = diceA.every((face, index) => face == diceB[index]);

  if (matches) {
    break;
  }
}

console.log(matches ? 'Yes' : 'No');
