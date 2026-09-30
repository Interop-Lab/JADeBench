'use strict';
const Main = input => {
  const nums = input.trim().split(' ').map(x => parseInt(x, 10));
  let a = nums[0], b = nums[1];
  let gcd;
  if (a >= b) {
    while (b > 0) {
      let r = a % b;
      a = b;
      b = r;
    }
    gcd = a;
  } else {
    let r;
    while (a > 0) {
      r = b % a;
      b = a;
      a = r;
    }
    gcd = b;
  }
  const lcm = (nums[0] * nums[1]) / gcd;
  console.log(lcm);
};
Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
