const fs = require('fs');

const ROLL_PERMUTATIONS = {
  N: [1, 5, 2, 3, 0, 4],
  S: [4, 0, 2, 3, 5, 1],
  E: [3, 1, 0, 5, 4, 2],
  W: [2, 1, 5, 0, 4, 3],
};

function rollDie(direction, faces) {
  const permutation = ROLL_PERMUTATIONS[direction];
  if (!permutation) {
    return [];
  }

  return permutation.map((faceIndex) => faces[faceIndex]);
}

const input = fs.readFileSync('/dev/stdin', 'utf8');
const lines = input.trim().split('\n');
let currentFaces = lines[0].split(' ').map(Number);
const targetFaces = lines[1].split(' ').map(Number);
const directions = 'NSEW';

let diceMatch = false;

for (let attempt = 0; attempt < 100; attempt++) {
  const directionIndex = Math.floor(Math.random() * directions.length);
  currentFaces = rollDie(directions[directionIndex], currentFaces);
  diceMatch = currentFaces.every(
    (faceValue, faceIndex) => faceValue === targetFaces[faceIndex],
  );

  if (diceMatch) {
    break;
  }
}

console.log(diceMatch ? 'Yes' : 'No');
