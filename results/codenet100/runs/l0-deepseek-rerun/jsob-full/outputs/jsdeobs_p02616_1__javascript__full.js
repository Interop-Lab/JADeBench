const fs = require('fs');

const input = fs.readFileSync('input.txt', 'utf8');

const [header, ...lines] = input.trim().split('\n').map(line => line.split(' ').map(Number));

const [n, k] = header;
const a = lines[0];

let left = [];
let right = [];

for (let i = 0; i < n; i++) {
  if (a[i] < 0) right.push(a[i]);
  if (a[i] > 0) left.push(a[i]);
}

const MOD = BigInt(1000000007);
const mulmod = (x, y) => (BigInt(x) * BigInt(y) % MOD + MOD) % MOD;

left.sort((x, y) => x - y);
right.sort((x, y) => y - x);

if (right.length === 0 && k % 2 === 1) {
  return '' + left.slice(-k).reduce(mulmod, 1n);
}

let li = 0;
let ri = 0;
let pos = [];
let neg = [];

for (let i = 0; i < k; i++) {
  if (Math.abs(right[ri]) > Math.abs(left[li])) {
    pos.push(right[ri]);
    ri++;
  } else {
    neg.push(left[li]);
    li++;
  }
}

if (neg.length % 2 === 1) {
  if (pos.length > 0 && neg.length > 0) {
    if (Math.abs(right[ri]) * Math.abs(left[li - 1]) > Math.abs(left[li]) * Math.abs(right[ri - 1])) {
      pos.push(right[ri]);
      neg.pop();
    } else {
      neg.push(left[li]);
      pos.pop();
    }
  }
}

return '' + mulmod(pos.reduce(mulmod, 1n), neg.reduce(mulmod, 1n));
