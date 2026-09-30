const fs = require('fs');

const expectedDigits = fs
  .readFileSync('/dev/stdin', 'utf8')
  .trim()
  .split(' ')
  .map(Number);

let matchingCount = 0;

for (let firstUnitsDigit = 1; firstUnitsDigit <= 9; firstUnitsDigit++) {
  for (let firstTensDigit = 1; firstTensDigit <= 9; firstTensDigit++) {
    for (let secondUnitsDigit = 1; secondUnitsDigit <= 9; secondUnitsDigit++) {
      for (let firstHundredsDigit = 1; firstHundredsDigit <= 8; firstHundredsDigit++) {
        for (let secondTensDigit = 1; secondTensDigit <= 9; secondTensDigit++) {
          for (let thirdUnitsDigit = 1; thirdUnitsDigit <= 9; thirdUnitsDigit++) {
            const firstNumber =
              firstHundredsDigit * 100 + firstTensDigit * 10 + firstUnitsDigit;
            const secondNumber = secondTensDigit * 10 + secondUnitsDigit;
            const sum = firstNumber + secondNumber + thirdUnitsDigit;
            const sumDigits = String(sum).split('').map(Number);

            if (sumDigits.length !== 3) continue;

            const digits = [
              firstUnitsDigit,
              firstTensDigit,
              secondUnitsDigit,
              firstHundredsDigit,
              secondTensDigit,
              thirdUnitsDigit,
              ...sumDigits,
            ];

            const usesEachDigitOnce =
              new Set(digits).size === 9 &&
              digits.every((digit) => digit >= 1 && digit <= 9);
            const matchesPattern = digits.every(
              (digit, index) =>
                expectedDigits[index] === -1 || expectedDigits[index] === digit,
            );

            if (usesEachDigitOnce && matchesPattern) matchingCount++;
          }
        }
      }
    }
  }
}

console.log(matchingCount);
