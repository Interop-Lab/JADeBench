'use strict';
const Main = input => {
  const nums = input.trim().split(' ').map(n => parseInt(n, 10));
  let a = nums[0], b = nums[1];
  let x = 0, y = 1, prevA = a, prevB = b;
  if (a >= b) {
    while (b > 0) {
      let r = a % b;
      a = b;
      b = r;
    }
    y = a;
  } else {
    while (a > 0) {
      let r = b % a;
      b = a;
      a = r;
    }
    y = b;
  }
  let result = (prevA * prevB) / y;
  console.log(result);
};
Main(require('fs')['readFileSync']('/dev/stdin', 'utf8'));
