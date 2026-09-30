const fs = require('fs');

const THREE_SEEN = 1 << 0;
const FIVE_SEEN = 1 << 1;
const SEVEN_SEEN = 1 << 2;
const ALL_DIGITS_SEEN = THREE_SEEN | FIVE_SEEN | SEVEN_SEEN;

function countNumbersUsingThreeFiveAndSeven(usedDigits, number, limit) {
  if (number > limit) {
    return 0;
  }

  let count = usedDigits === ALL_DIGITS_SEEN ? 1 : 0;

  count += countNumbersUsingThreeFiveAndSeven(
    usedDigits | THREE_SEEN,
    number * 10 + 3,
    limit,
  );
  count += countNumbersUsingThreeFiveAndSeven(
    usedDigits | FIVE_SEEN,
    number * 10 + 5,
    limit,
  );
  count += countNumbersUsingThreeFiveAndSeven(
    usedDigits | SEVEN_SEEN,
    number * 10 + 7,
    limit,
  );

  return count;
}

function main(input) {
  const limit = parseInt(input);
  console.log(countNumbersUsingThreeFiveAndSeven(0, 0, limit));
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
