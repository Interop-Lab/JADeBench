const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');

const [[n, k], arr] = input.trim().split('\n').map(line => line.split(' ').map(Number));

let pos = [];
let neg = [];

for (let i = 0; i < n; i++) {
  if (arr[i] > 0) pos.push(arr[i]);
  if (arr[i] < 0) neg.push(arr[i]);
}

const MOD = BigInt(1000000007);
const mulMod = (a, b) => (BigInt(a) * BigInt(b) % MOD + MOD) % MOD;

neg.sort((a, b) => a - b);
pos.sort((a, b) => b - a);

if (pos.length === 0 && (k & 1)) {
  return '' + neg.slice(-k).reduce(mulMod, 1n);
}

let posIdx = 0;
let negIdx = 0;
let posPart = [];
let negPart = [];

for (let i = 0; i < k; i++) {
  if ((neg[negIdx] | 0) > -(pos[posIdx] | 0)) {
    posPart.push(neg[negIdx]);
    negIdx++;
  } else {
    negPart.push(pos[posIdx]);
    posIdx++;
  }
}

if (negPart.length & 1) {
  if ((neg[negIdx] | 0) > -(pos[posIdx] | 0)) {
    posPart.push(neg[negIdx]);
    negPart.pop();
  } else {
    negPart.push(pos[posIdx]);
    posPart.pop();
  }
}

return '' + mulMod(posPart.reduce(mulMod, 1n), negPart.reduce(mulMod, 1n));
