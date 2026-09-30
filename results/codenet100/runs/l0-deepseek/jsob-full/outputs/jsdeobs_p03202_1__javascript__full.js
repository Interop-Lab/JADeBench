'use strict';

function main(input) {
  const lines = input.split('\n').filter(line => line !== '');
  const target = Number(lines[0]);
  const nums = lines[1].split(' ').map(Number);

  let count = 0;

  function checkPair(sum, digits) {
    let value = '0'.repeat(digits[0]);
    for (let i = 1; i < digits.length; i++) {
      if (digits[i - 1] === digits[i]) {
        value = value + '0'.repeat(digits[i] - digits[i - 1]);
      } else {
        value = String(parseInt(value, digits[i - 1]) + sum);
        if (isNaN(value)) return false;
        value = String(value);
        if (value.length !== digits[i]) return false;
        value = '0'.repeat(digits[i] - value.length) + value;
      }
    }
    return true;
  }

  while (checkPair(target, nums) !== true) {
    count = count + 1;
  }

  console.log(count);
}

main(require('fs').readFileSync('input.txt', 'utf8'));
