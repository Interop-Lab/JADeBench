'use strict';

const fs = require('fs');

function main(input) {
  const lines = input.trim().split('\n');
  const n = parseInt(lines[0]);
  const counts = Array.from({ length: 10 }, () => Array(10).fill(0));

  for (let number = 1; number <= n; number++) {
    const digits = String(number);
    const firstDigit = parseInt(digits[0]);
    const lastDigit = parseInt(digits[digits.length - 1]);
    counts[firstDigit][lastDigit]++;
  }

  let result = 0;

  for (let firstDigit = 0; firstDigit < 10; firstDigit++) {
    for (let lastDigit = 0; lastDigit < 10; lastDigit++) {
      result += counts[firstDigit][lastDigit] * counts[lastDigit][firstDigit];
    }
  }

  console.log(result);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
