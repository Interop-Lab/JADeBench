const fs = require('fs');

function move(direction, dice) {
  const [face0, face1, face2, face3, face4, face5] = dice;

  switch (direction) {
    case 'N':
      return [face1, face5, face2, face3, face0, face4];
    case 'S':
      return [face4, face0, face2, face3, face5, face1];
    case 'E':
      return [face3, face1, face0, face5, face4, face2];
    case 'W':
      return [face2, face1, face5, face0, face4, face3];
    default:
      return [];
  }
}

const input = fs.readFileSync('/dev/stdin', 'utf8');
const lines = input.trim().split('\n');
let diceA = lines[0].split(' ').map(Number);
const diceB = lines[1].split(' ').map(Number);
const directions = 'NSEW'.split('');

let flag;

for (let i = 0; i < 100; i++) {
  const randomDirection = directions[Math.floor(Math.random() * 4)];
  diceA = move(randomDirection, diceA);
  flag = diceA.every((value, index) => value == diceB[index]);

  if (flag) {
    break;
  }
}

console.log(flag ? 'Yes' : 'No');
