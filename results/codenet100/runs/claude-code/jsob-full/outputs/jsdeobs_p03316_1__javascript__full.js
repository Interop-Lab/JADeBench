const fs = require('fs');

function main(input) {
  const digits = input.toString().split('');
  let digitSum = 0;

  for (let index = 0; index < digits.length; index++) {
    digitSum += parseInt(digits[index]);
  }

  if (parseInt(input) % digitSum == 0) {
    console.log('Yes');
  } else {
    console.log('No');
  }
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
