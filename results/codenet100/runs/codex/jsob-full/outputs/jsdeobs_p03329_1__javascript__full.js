const fs = require('fs');

const powersOfSix = [6, 5, 4, 3, 2, 1].map((exponent) =>
  Math.pow(6, exponent),
);
const powersOfNine = [5, 4, 3, 2, 1].map((exponent) =>
  Math.pow(9, exponent),
);

function countTerms(number) {
  if (number < 6) {
    return number;
  }

  if (number < 9) {
    return 1 + countTerms(number - 6);
  }

  const largestSixPower = powersOfSix.find((power) => power <= number);
  const largestNinePower = powersOfNine.find((power) => power <= number);

  return Math.min(
    countTerms(number - largestSixPower) + 1,
    countTerms(number - largestNinePower) + 1,
  );
}

function main(input) {
  const number = parseInt(input, 10);
  console.log(countTerms(number));
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
