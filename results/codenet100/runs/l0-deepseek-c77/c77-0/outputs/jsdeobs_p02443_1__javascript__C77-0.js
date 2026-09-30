const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8');
const arr = input.trim().split('\n');
const n = arr.shift() - 0;
const a = arr.shift().split(' ').map(Number);
const q = arr.shift() - 0;
let s = '';
for (let i = 0; i < q; i++) {
  const [b, e] = arr[i].split(' ').map(Number);
  const x = a.slice(0, b);
  const y = a.slice(b, e).reverse();
  const z = a.slice(e);
  a = x.concat(y, z);
}
console.log(a.join(' '));
