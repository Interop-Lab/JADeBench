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

let matchesTarget;
for (let moveCount = 0; moveCount < 100; moveCount += 1) {
  const directionIndex = Math.floor(Math.random() * directions.length);
  currentFaces = rollDie(directions[directionIndex], currentFaces);
  matchesTarget = currentFaces.every(
    (face, index) => face === targetFaces[index],
  );

  if (matchesTarget) break;
}

console.log(matchesTarget ? 'Yes' : 'No');
