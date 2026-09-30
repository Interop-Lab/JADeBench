const fs = require('fs');

const powersOfSix = [46656, 7776, 1296, 216, 36, 6];
const powersOfNine = [59049, 6561, 729, 81, 9];

function count(value) {
  if (value < 6) {
    return value;
  }

  if (value < 9) {
    return 1 + (value - 6);
  }

  const largestPowerOfSix = powersOfSix.find(power => power <= value);
  const largestPowerOfNine = powersOfNine.find(power => power <= value);

  return Math.min(
    count(value - largestPowerOfSix) + 1,
    count(value - largestPowerOfNine) + 1
  );
}

function main(input) {
  const value = parseInt(input, 10);
  console.log(count(value));
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
