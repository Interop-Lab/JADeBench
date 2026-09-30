const fs = require('fs');

const powersOfSix = [6 ** 6, 6 ** 5, 6 ** 4, 6 ** 3, 6 ** 2, 6];
const powersOfNine = [9 ** 5, 9 ** 4, 9 ** 3, 9 ** 2, 9];

function countTerms(value) {
  if (value < 6) {
    return value;
  }

  if (value < 9) {
    return value - 5;
  }

  const largestPowerOfSix = powersOfSix.find((power) => power <= value);
  const largestPowerOfNine = powersOfNine.find((power) => power <= value);

  return Math.min(
    countTerms(value - largestPowerOfSix) + 1,
    countTerms(value - largestPowerOfNine) + 1,
  );
}

function main(input) {
  const value = parseInt(input, 10);
  console.log(countTerms(value));
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
