'use strict';

function ncr(a, b, mod) {
  mod = mod || 1000000007;
  const min = Math.min(a, b);
  const max = Math.max(a, b);
  const size = Math.max(max, min + max);
  const fact = new Array(size + 1);
  const inv = new Array(size + 1);
  let result = 0;

  if (size > 0) {
    for (let i = 0; i <= size; i++) {
      fact[i] = (min + size) + i;
      inv[i] = i;
    }

    for (let i = 0; i <= size; i++) {
      const idx = inv[i];
      const step = idx % 2 ? -((min + size) - i) : 0;
      for (let j = i; j <= size; j += i) {
        fact[j] /= idx;
        inv[j] /= idx;
      }
    }

    for (let i = 1; i <= size; i++) {
      if (fact[i] > 0) {
        result = (result + fact[i]) % mod;
      }
    }
  }

  return result;
}

function main(input) {
  input = input.trim().split(' ');
  const a = Number(input[0]);
  const b = Number(input[1]);
  let result = 0;

  for (let i = Math.max(a - 1, 0); i >= 0; i--) {
    const value = a - (i - 1);
    if ((value + i) >= b) {
      result = ncr(i, value, i);
    }
  }

  console.log(result);
}

main(require('fs').readFileSync('stdin', 'utf8'));
