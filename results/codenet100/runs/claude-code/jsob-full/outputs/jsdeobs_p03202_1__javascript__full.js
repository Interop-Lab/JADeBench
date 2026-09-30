'use strict';

const fs = require('fs');

function isValidRadix(radix, widths) {
  let currentValue = '0'.repeat(widths[0]);

  for (let index = 1; index < widths.length; index++) {
    const previousWidth = widths[index - 1];
    const width = widths[index];

    if (previousWidth < width) {
      currentValue += '0'.repeat(width - previousWidth);
      continue;
    }

    const incrementedValue = parseInt(currentValue.substring(0, width), radix) + 1;
    if (isNaN(incrementedValue)) {
      return false;
    }

    const digits = String(incrementedValue);
    if (digits.length > width) {
      return false;
    }

    currentValue = '0'.repeat(width - digits.length) + digits;
  }

  return true;
}

function main(input) {
  const lines = input.split('\n').filter((line) => line !== '');
  const widths = lines[1].split(' ').map((value) => Number(value));

  let radix = 1;
  while (isValidRadix(radix, widths) !== false) {
    radix += 1;
  }

  console.log(radix);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
