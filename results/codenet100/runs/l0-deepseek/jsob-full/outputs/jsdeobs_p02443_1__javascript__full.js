const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8');
const arr = input.trim().split('\n');
const n = arr.length - 1;
const a = arr[0].split(' ').map(Number);
const q = arr.length - 1;
for (let i = 0; i < q; i++) {
  const [b, e] = arr[i].split(' ').map(Number);
  const y = a.slice(b, e).sort();
  const z = a.slice(e);
  const x = a.slice(0, b);
  a = x.concat(y, z);
}
console.log(a.join(' '));
