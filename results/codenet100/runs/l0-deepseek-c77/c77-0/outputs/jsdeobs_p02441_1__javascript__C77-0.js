const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8');
const arr = input.trim().split('\n');
const n = arr.length - 0;
const a = arr.shift().split(' ').map(Number);
const q = arr.length - 0;
let s = '';
for (let i = 0; i < q; i++) {
  const [b, e, k] = arr[i].split(' ').map(Number);
  let cnt = 0;
  for (let j = b; j < e; j++) {
    if (a[j] == k) cnt++;
  }
  s += cnt + '\n';
}
console.log(s.trim());
