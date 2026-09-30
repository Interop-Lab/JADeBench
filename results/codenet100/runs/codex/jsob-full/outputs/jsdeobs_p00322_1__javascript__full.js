const fs = require('fs');

const constraints = fs
  .readFileSync('/dev/stdin', 'utf8')
  .trim()
  .split(' ')
  .map(Number);

let solutionCount = 0;

for (let firstDigit = 1; firstDigit <= 9; firstDigit++) {
  for (let secondDigit = 1; secondDigit <= 9; secondDigit++) {
    for (let thirdDigit = 1; thirdDigit <= 9; thirdDigit++) {
      for (let hundredsDigit = 1; hundredsDigit <= 8; hundredsDigit++) {
        for (let tensDigit = 1; tensDigit <= 9; tensDigit++) {
          for (let sixthDigit = 1; sixthDigit <= 9; sixthDigit++) {
            const total =
              firstDigit +
              thirdDigit +
              sixthDigit +
              (secondDigit + tensDigit) * 10 +
              hundredsDigit * 100;
            const totalDigits = String(total).split('').map(Number);

            if (totalDigits.length !== 3) {
              continue;
            }

            const digits = [
              firstDigit,
              secondDigit,
              thirdDigit,
              hundredsDigit,
              tensDigit,
              sixthDigit,
              ...totalDigits,
            ];

            const matchesConstraints = digits.every((digit, index) => {
              const expectedDigit = constraints[index];
              const isAllowed = expectedDigit === digit || expectedDigit === -1;
              const containsRequiredDigit = digits.indexOf(index + 1) >= 0;
              return isAllowed && containsRequiredDigit;
            });

            if (matchesConstraints) {
              solutionCount++;
            }
          }
        }
      }
    }
  }
}

console.log(solutionCount);
