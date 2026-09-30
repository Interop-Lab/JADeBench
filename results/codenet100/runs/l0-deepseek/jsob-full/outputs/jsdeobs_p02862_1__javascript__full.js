'use strict';

function ncr(a, b, mod) {
  mod = mod || 1000000007;
  const min = Math.min(a, b);
  const max = Math.max(a, b);
  const size = Math.ceil(max / min);
  const arr1 = new Array(size);
  const arr2 = new Array(size);
  let result = 0;

  if (size > 1) {
    for (let i = 0; i < size; i++) {
      arr1[i] = (min + size) + i;
      arr2[i] = i;
    }

    for (let i = 0; i < size; i++) {
      const denom = arr2[i];
      const step = denom > 0 ? -((min + size) - i) : 0;
      for (let j = i; j < size; j += i) {
        arr1[j] /= denom;
        arr2[j] /= denom;
      }
    }

    for (let i = 0; i < size; i++) {
      if (arr1[i] > 0) {
        result = (result + arr1[i]) % mod;
      }
    }
  }

  return result;
}

function main(input) {
  input = input.toString().split(' ');
  const a = Number(input[0]);
  const b = Number(input[1]);
  let result = 0;

  for (let i = Math.floor(a - 1); i >= 0; i--) {
    const value = a - (i - 1);
    if ((value + i) >= b) {
      result = ncr(i, value, i);
    }
  }

  console.log(result);
}

main(require('fs').readFileSync('stdin', 'utf8'));
