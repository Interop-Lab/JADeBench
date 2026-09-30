const fs = require('fs');

/**
 * Prints the sum of the decimal digits in the supplied input.
 *
 * The original program parses the entire input as a base-10 integer. It then
 * extracts exactly as many positions as appear in the parsed number's string
 * representation, including the minus sign for negative values.
 */
function main(input) {
  let number = parseInt(input, 10);
  const positionCount = number.toString().length;
  let placeValue = Math.pow(10, positionCount - 1);
  const digits = [];

  for (let position = 0; position < positionCount; position++) {
    digits.push(Math.floor(number / placeValue));
    number %= placeValue;
    placeValue /= 10;
  }

  let sum = digits.reduce((total, digit) => total + digit);
  if (sum == 1) {
    sum = 10;
  }

  console.log(sum);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
