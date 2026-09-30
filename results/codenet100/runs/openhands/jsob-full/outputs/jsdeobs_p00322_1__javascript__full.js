const fs = require('fs');

const inputPattern = fs
  .readFileSync('/dev/stdin', 'utf8')
  .trim()
  .split(' ')
  .map(Number);

let solutionCount = 0;

for (let oneDigitNumber = 1; oneDigitNumber <= 9; oneDigitNumber++) {
  for (let twoDigitTens = 1; twoDigitTens <= 9; twoDigitTens++) {
    for (let twoDigitOnes = 1; twoDigitOnes <= 9; twoDigitOnes++) {
      for (let threeDigitHundreds = 1; threeDigitHundreds <= 8; threeDigitHundreds++) {
        for (let threeDigitTens = 1; threeDigitTens <= 9; threeDigitTens++) {
          for (let threeDigitOnes = 1; threeDigitOnes <= 9; threeDigitOnes++) {
            const twoDigitNumber = twoDigitTens * 10 + twoDigitOnes;
            const threeDigitNumber =
              threeDigitHundreds * 100 + threeDigitTens * 10 + threeDigitOnes;
            const sumDigits = String(
              oneDigitNumber + twoDigitNumber + threeDigitNumber,
            )
              .split('')
              .map(Number);

            if (sumDigits.length !== 3) continue;

            const digits = [
              oneDigitNumber,
              twoDigitTens,
              twoDigitOnes,
              threeDigitHundreds,
              threeDigitTens,
              threeDigitOnes,
              ...sumDigits,
            ];

            const usesEveryDigit = digits.every((_, index) =>
              digits.includes(index + 1),
            );
            const matchesPattern = digits.every(
              (digit, index) =>
                inputPattern[index] === digit || inputPattern[index] === -1,
            );

            if (usesEveryDigit && matchesPattern) solutionCount++;
          }
        }
      }
    }
  }
}

console.log(solutionCount);
