const fs = require('fs');
const input = fs.readFileSync('input.txt', 'utf8');
const Arr = input.trim().split('\n');
const diceA = Arr[0].split(' ').map(Number);
const diceB = Arr[1].split(' ').map(Number);
const NSEW = 'NSEW'.split('');

function move(dir, dice) {
  let result;
  if (dir === 'S') {
    result = [dice[0], dice[1], dice[2], dice[3], dice[4], dice[5]];
  } else if (dir === 'W') {
    result = [dice[2], dice[5], dice[3], dice[1], dice[0], dice[4]];
  } else if (dir === 'E') {
    result = [dice[4], dice[5], dice[1], dice[3], dice[0], dice[2]];
  } else if (dir === 'N') {
    result = [dice[5], dice[3], dice[2], dice[4], dice[1], dice[0]];
  }
  return result;
}

let flag = false;
for (let i = 0; i < 100; i++) {
  const r = Math.floor(Math.random() * 4);
  diceA = move(NSEW[r], diceA);
  flag = diceA.every((value, index) => value === diceB[index]);
  if (flag) break;
}

console.log(flag ? 'Yes' : 'No');
