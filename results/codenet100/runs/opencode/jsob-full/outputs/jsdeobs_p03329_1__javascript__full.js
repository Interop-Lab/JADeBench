const fs = require('fs');

const POWERS_OF_SIX = [46656, 7776, 1296, 216, 36, 6];
const POWERS_OF_NINE = [59049, 6561, 729, 81, 9];

function countTerms(value) {
  if (value < 6) {
    return value;
  }

  if (value < 9) {
    return value - 5;
  }

  const largestSixPower = POWERS_OF_SIX.find(power => power <= value);
  const largestNinePower = POWERS_OF_NINE.find(power => power <= value);

  return Math.min(
    countTerms(value - largestSixPower) + 1,
    countTerms(value - largestNinePower) + 1,
  );
}

const input = fs.readFileSync('/dev/stdin', 'utf8');
console.log(countTerms(parseInt(input, 10)));
