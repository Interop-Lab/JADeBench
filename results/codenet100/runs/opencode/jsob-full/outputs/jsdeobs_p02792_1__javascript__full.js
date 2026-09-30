'use strict';

const fs = require('fs');

function main(input) {
  const lines = input.trim().split('\n');
  const upperBound = parseInt(lines[0]);

  const endpointCounts = [];
  for (let firstDigit = 0; firstDigit < 10; firstDigit++) {
    endpointCounts.push(new Array(10).fill(0));
  }

  for (let number = 0; number < upperBound; number++) {
    const digits = String(number);
    const firstDigit = parseInt(digits[0]);
    const lastDigit = parseInt(digits[digits.length - 1]);
    endpointCounts[firstDigit][lastDigit]++;
  }

  let matchingPairCount = 0;
  for (let firstDigit = 0; firstDigit < 10; firstDigit++) {
    for (let lastDigit = 0; lastDigit < 10; lastDigit++) {
      matchingPairCount +=
        endpointCounts[firstDigit][lastDigit] *
        endpointCounts[lastDigit][firstDigit];
    }
  }

  console.log(matchingPairCount);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
