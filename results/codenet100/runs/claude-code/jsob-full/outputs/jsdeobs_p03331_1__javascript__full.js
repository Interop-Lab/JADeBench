const fs = require('fs');

function main(input) {
  let number = parseInt(input, 10);
  const digitCount = number.toString().length;
  let placeValue = Math.pow(10, digitCount - 1);
  const values = [];

  for (let index = 0; index < digitCount; index++) {
    values.push(Math.floor(number / placeValue));
    number %= placeValue;
    placeValue /= 10;
  }

  let total = values.reduce((sum, value) => sum + value);
  if (total == 1) {
    total = 10;
  }

  console.log(total);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
