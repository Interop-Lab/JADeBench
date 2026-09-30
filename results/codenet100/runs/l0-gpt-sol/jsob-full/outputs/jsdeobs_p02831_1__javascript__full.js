'use strict';

const fs = require('fs');

const main = input => {
  const numbers = input
    .trim()
    .split(' ')
    .map(value => parseInt(value, 10));

  let a = numbers[0];
  let b = numbers[1];
  const originalA = a;
  const originalB = b;
  let gcd;

  if (a >= b) {
    while (b > 0) {
      const remainder = a % b;
      a = b;
      b = remainder;
    }
    gcd = a;
  } else {
    while (a > 0) {
      const remainder = b % a;
      b = a;
      a = remainder;
    }
    gcd = b;
  }

  const lcm = (originalA * originalB) / gcd;
  console.log(lcm);
};

main(fs.readFileSync('/dev/stdin', 'utf8'));
