const fs = require('fs');

const pattern = fs.readFileSync('/dev/stdin', 'utf8').trim().split(' ').map(Number);
let matchCount = 0;

for (let first = 1; first <= 9; first++) {
  for (let second = 1; second <= 9; second++) {
    for (let third = 1; third <= 9; third++) {
      for (let fourth = 1; fourth <= 8; fourth++) {
        for (let fifth = 1; fifth <= 9; fifth++) {
          for (let sixth = 1; sixth <= 9; sixth++) {
            const derivedNumber =
              first + third + sixth + (second + fifth) * 10 + fourth * 100;
            const derivedDigits = String(derivedNumber).split('').map(Number);

            if (derivedDigits.length !== 3) continue;

            const sequence = [first, second, third, fourth, fifth, sixth, ...derivedDigits];
            const matchesPattern = sequence.every(
              (digit, index) => pattern[index] === -1 || pattern[index] === digit
            );
            const containsEveryDigit = sequence.every((_, index) =>
              sequence.includes(index + 1)
            );

            if (matchesPattern && containsEveryDigit) matchCount++;
          }
        }
      }
    }
  }
}

console.log(matchCount);
