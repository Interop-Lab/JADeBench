const fs = require('fs');

function isDivisibleByDigitSum(input) {
  const digits = input.toString().split('');
  let digitSum = 0;

  for (const digit of digits) {
    digitSum += parseInt(digit);
  }

  return parseInt(input) % digitSum === 0;
}

const input = fs.readFileSync('/dev/stdin', 'utf8');
console.log(isDivisibleByDigitSum(input) ? 'Yes' : 'No');
