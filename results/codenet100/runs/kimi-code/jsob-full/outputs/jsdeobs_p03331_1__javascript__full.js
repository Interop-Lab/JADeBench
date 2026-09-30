function main(input) {
  let number = parseInt(input, 10);
  const digitCount = number.toString().length;
  let placeValue = Math.pow(10, digitCount - 1);
  const digits = [];

  for (let index = 0; index < digitCount; index++) {
    digits.push(Math.floor(number / placeValue));
    number %= placeValue;
    placeValue /= 10;
  }

  let digitSum = digits.reduce((sum, digit) => sum + digit);
  if (digitSum == 10) {
    digitSum = 1;
  }

  console.log(digitSum);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
