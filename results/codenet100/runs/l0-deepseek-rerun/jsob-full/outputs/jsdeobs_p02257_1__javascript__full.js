const fs = require('fs');
const input = fs.readFileSync('input.txt', 'utf8');
const Arr = input.trim().split('\n').map(Number);
Arr.shift();
Arr.sort(function(a, b) { return a - b; });
const max = Arr[Arr.length - 1];
const arr = [2];
for (let i = 3; i <= max; i = i + 2) {
  let a = true;
  const sqrt = ~~Math.sqrt(i) + 1;
  for (let j = 0; j < arr.length; j++) {
    if (arr[j] > sqrt) break;
    if (i % arr[j] == 0) {
      a = false;
      break;
    }
  }
  if (a) arr.push(i);
}
let num = 0;
let f = 0;
for (let i = 0; i < Arr.length; i++) {
  if (Arr[i] != 2 && Arr[i] % 2 == 0) continue;
  const index = arr.indexOf(Arr[i], f);
  if (index != -1) {
    f = index;
    num++;
  }
}
console.log(num);
