'use strict';

const ncr = (a, b, modulus) => {
  modulus = modulus || 1000000007;

  const high = Math.max(a, b);
  const low = Math.min(a, b);
  const count = Math.min(low, high - low);

  const numerators = new Array(count + 1);
  const denominators = new Array(count + 1);
  let result = 1;

  if (count > 0) {
    for (let i = 1; i <= count; i++) {
      numerators[i] = high - count + i;
      denominators[i] = i;
    }

    for (let i = 2; i <= count; i++) {
      const factor = denominators[i];
      const offset = factor > 1 ? -((high - count) % i) : 0;

      for (let j = i; j <= count; j += i) {
        numerators[j + offset] /= factor;
        denominators[j] /= factor;
      }
    }

    for (let i = 1; i <= count; i++) {
      if (numerators[i] > 1) {
        result = (result * numerators[i]) % modulus;
      }
    }
  }

  return result;
};

function main(input) {
  const values = input.trim().split(' ');
  const n = Number(values[0]);
  const target = Number(values[1]);
  let answer = 0;

  for (let i = Math.floor(n - 2); i >= 0; i--) {
    const remaining = n - 2 * i;

    if ((remaining - 2) * i === target) {
      answer = ncr(i + remaining, i);
    }
  }

  console.log(answer);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
