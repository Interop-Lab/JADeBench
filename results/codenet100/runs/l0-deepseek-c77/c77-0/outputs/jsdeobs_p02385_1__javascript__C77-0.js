const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8');
const Arr = input.trim().split('\n');
const diceA = Arr[0].split(' ').map(Number);
const diceB = Arr[1].split(' ').map(Number);
const NSEW = 'NSEW'.split('');

function move(dir, dice) {
  const [a, b, c, d, e, f] = dice;
  let result = [];
  if (dir === 'N') result = [b, f, c, d, a, e];
  if (dir === 'S') result = [e, a, c, d, f, b];
  if (dir === 'E') result = [d, b, a, f, e, c];
  if (dir === 'W') result = [c, b, f, a, e, d];
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
