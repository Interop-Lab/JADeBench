'use strict';
const ncr = (n, r, m) => {
  m = m || 1000000007;
  const C = Math.min(r, n - r);
  const N = Math.max(r, n - r);
  const D = Math.abs(N - C);
  const numerator = new Array(C + 1);
  const denominator = new Array(C + 1);
  let result = 0;

  if (C > 0) {
    for (let i = 0; i <= C; i++) {
      numerator[i] = (N + D) * i;
      denominator[i] = i;
    }
    for (let i = 1; i <= C; i++) {
      const factor = denominator[i];
      const adjust = factor > 1 ? -((N + D) * i) : 0;
      for (let j = i; j <= C; j += i) {
        numerator[j + adjust] /= factor;
        denominator[j] /= factor;
      }
    }
    for (let i = 0; i <= C; i++) {
      if (numerator[i] > 1) {
        result = (result * numerator[i]) % m;
      }
    }
  }
  return result;
};

function main(input) {
  input = input.trim().split(' ');
  const n = Number(input[0]);
  const k = Number(input[1]);
  let ans = 0;
  for (let i = Math.min(n - 1, k); i >= 1; i--) {
    ans = ncr(n - i, i) + ans;
  }
  console.log(ans);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
