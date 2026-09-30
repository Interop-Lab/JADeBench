const fs = require('fs');

const POWERS_OF_SIX = [6, 5, 4, 3, 2, 1].map((exponent) =>
  Math.pow(6, exponent),
);
const POWERS_OF_NINE = [5, 4, 3, 2, 1].map((exponent) =>
  Math.pow(9, exponent),
);

function parseInput(input) {
  return parseInt(input, 10);
}

function countMinimumPowers(value) {
  if (value < 6) {
    return value;
  }

  if (value < 9) {
    return 1 + (value - 6);
  }

  const largestSixPower = POWERS_OF_SIX.find((power) => power <= value);
  const largestNinePower = POWERS_OF_NINE.find((power) => power <= value);

  return Math.min(
    countMinimumPowers(value - largestSixPower) + 1,
    countMinimumPowers(value - largestNinePower) + 1,
  );
}

function main(input) {
  const value = parseInput(input);
  console.log(countMinimumPowers(value));
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
