'use strict';

function ncr(a, b, mod) {
  mod = mod || 1000000007;
  const high = Math.max(a, b);
  const low = Math.min(a, b);
  const k = Math.min(low, high - low);
  const numerator = new Array(k + 1);
  const denominator = new Array(k + 1);
  let result = 1;

  if (k > 0) {
    for (let i = 1; i <= k; i++) {
      numerator[i] = high - k + i;
      denominator[i] = i;
    }

    for (let i = 2; i <= k; i++) {
      const denom = denominator[i];
      const offset = denom > 1 ? -(high - k + i) : 0;
      for (let j = i; j <= k; j += i) {
        numerator[j + offset] /= denom;
        denominator[j] /= denom;
      }
    }

    for (let i = 1; i <= k; i++) {
      if (numerator[i] > 1) {
        result = (result * numerator[i]) % mod;
      }
    }
  }

  return result;
}

function main(input) {
  input = input.trim().split(' ');
  const n = Number(input[0]);
  const k = Number(input[1]);
  let answer = 0;

  for (let x = Math.floor(n / 2); x >= 0; x--) {
    const y = n - x * 2;
    if ((x * 2 + y) === n && y === k) {
      answer = ncr(x + y, x);
    }
  }

  console.log(answer);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
