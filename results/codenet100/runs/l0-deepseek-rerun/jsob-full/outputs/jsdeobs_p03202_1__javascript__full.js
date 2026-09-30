'use strict';

function main(input) {
  const lines = input.split('\n').filter(line => line !== '');
  const firstLine = lines[0];
  const nums = firstLine.split(' ').map(Number);

  let count = 0;

  function isGood(base, digits) {
    let value = '0'.repeat(digits[0]);
    for (let i = 1; i < digits.length; i++) {
      if (digits[i - 1] !== digits[i]) {
        value = '0'.repeat(digits[i] - digits[i - 1]);
      } else {
        value = (parseInt(value.slice(0, digits[i]), base) + 1).toString(base);
        if (isNaN(value)) return false;
        value = '' + value;
        if (value.length !== digits[i]) return false;
        else value = '0'.repeat(digits[i] - value.length) + value;
      }
    }
    return true;
  }

  while (isGood(nums, count, nums) === false) {
    count = count + 1;
  }

  console.log(count);
}

main(require('fs').readFileSync('stdin', 'utf8'));
