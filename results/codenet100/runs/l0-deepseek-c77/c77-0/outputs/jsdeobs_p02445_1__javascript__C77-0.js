const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8');
const arr = input.trim().split('\n');
const n = arr.length - 0;
const a = arr[0].split(' ').map(Number);
const q = arr[1] - 0;
for (let i = 0; i < q; i++) {
  const [b, e, t] = arr[i + 2].split(' ').map(Number);
  const k = e - b;
  for (let j = 0; j < k; j++) {
    [a[b + j], a[t + j]] = [a[t + j], a[b + j]];
  }
}
console.log(a.join(' '));
