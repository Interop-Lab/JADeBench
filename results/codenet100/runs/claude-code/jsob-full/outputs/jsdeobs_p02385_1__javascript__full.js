const fs = require('fs');

function rollDie(direction, faces) {
  const [top, south, east, west, north, bottom] = faces;

  switch (direction) {
    case 'N':
      return [south, bottom, east, west, top, north];
    case 'S':
      return [north, top, east, west, bottom, south];
    case 'E':
      return [west, south, top, bottom, north, east];
    case 'W':
      return [east, south, bottom, top, north, west];
    default:
      return [];
  }
}

const input = fs.readFileSync('/dev/stdin', 'utf8');
const lines = input.trim().split('\n');
let currentFaces = lines[0].split(' ').map(Number);
const targetFaces = lines[1].split(' ').map(Number);
const directions = 'NSEW'.split('');
let matched;

for (let attempt = 0; attempt < 100; attempt++) {
  const direction = directions[Math.floor(Math.random() * 4)];
  currentFaces = rollDie(direction, currentFaces);
  matched = currentFaces.every((face, index) => face == targetFaces[index]);
  if (matched) break;
}

console.log(matched ? 'Yes' : 'No');
