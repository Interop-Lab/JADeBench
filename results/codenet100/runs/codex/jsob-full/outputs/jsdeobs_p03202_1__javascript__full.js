'use strict';

const fs = require('fs');

function isValidRadix(radix, digitWidths) {
  let value = '0'.repeat(digitWidths[0]);

  for (let index = 1; index < digitWidths.length; index += 1) {
    const previousWidth = digitWidths[index - 1];
    const currentWidth = digitWidths[index];

    if (previousWidth < currentWidth) {
      value += '0'.repeat(currentWidth - previousWidth);
      continue;
    }

    value = parseInt(value.substring(0, currentWidth), radix) + 1;
    if (isNaN(value)) {
      return false;
    }

    value = '' + value;
    if (value.length > currentWidth) {
      return false;
    }

    value = '0'.repeat(currentWidth - value.length) + value;
  }

  return true;
}

function main(input) {
  const lines = input.split('\n').filter((line) => line !== '');
  const digitWidths = lines[1].split(' ').map((width) => Number(width));

  let radix = 1;
  while (!isValidRadix(radix, digitWidths)) {
    radix += 1;
  }

  console.log(radix);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
