'use strict';

const Main = (input) => {
  const numbers = input.trim().split(/\s+/).map((token) => parseInt(token, 10));
  let a = numbers[0];
  let b = numbers[1];
  let remainder = 0;
  let gcd = a;
  const originalA = a;
  const originalB = b;

  if (a >= b) {
    while (b > 0) {
      const temp = a % b;
      a = b;
      b = temp;
    }
    gcd = a;
  } else {
    while (a > 0) {
      remainder = b % a;
      b = a;
      a = remainder;
    }
    gcd = b;
  }

  const lcm = (originalA * originalB) / gcd;
  console.log(lcm);
};

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
