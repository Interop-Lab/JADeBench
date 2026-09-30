'use strict';

const fs = require('fs');

function countMatchingEndpointPairs(input) {
  const lines = input.trim().split('\n');
  const upperBound = parseInt(lines[0]);
  const endpointCounts = Array.from({ length: 10 }, () => Array(10).fill(0));

  for (let number = 1; number <= upperBound; number++) {
    const digits = String(number);
    const firstDigit = parseInt(digits[0]);
    const lastDigit = parseInt(digits[digits.length - 1]);
    endpointCounts[firstDigit][lastDigit]++;
  }

  let pairCount = 0;
  for (let firstDigit = 0; firstDigit < 10; firstDigit++) {
    for (let lastDigit = 0; lastDigit < 10; lastDigit++) {
      pairCount += endpointCounts[firstDigit][lastDigit]
        * endpointCounts[lastDigit][firstDigit];
    }
  }

  console.log(pairCount);
}

const input = fs.readFileSync('/dev/stdin', 'utf8');
countMatchingEndpointPairs(input);
