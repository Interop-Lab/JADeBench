function main(input) {
  const digitCount = input.toString().length;
  let remainingNumber = parseInt(input, 10);
  let placeValue = Math.pow(10, digitCount - 1);
  const digits = [];

  for (let index = 0; index < digitCount; index += 1) {
    digits.push(Math.floor(remainingNumber / placeValue));
    remainingNumber %= placeValue;
    placeValue /= 10;
  }

  let digitSum = digits.reduce((sum, digit) => sum + digit);
  if (digitSum === 1) {
    digitSum = 10;
  }

  console.log(digitSum);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
