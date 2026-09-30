'use strict';

const fs = require('fs');

function isValidRadix(radix, widths) {
  let value = '0'.repeat(widths[0]);

  for (let index = 1; index < widths.length; index += 1) {
    const previousWidth = widths[index - 1];
    const width = widths[index];

    if (previousWidth < width) {
      value += '0'.repeat(width - previousWidth);
      continue;
    }

    const incremented = parseInt(value.substring(0, width), radix) + 1;
    if (Number.isNaN(incremented)) {
      return false;
    }

    value = String(incremented);
    if (value.length > width) {
      return false;
    }

    value = '0'.repeat(width - value.length) + value;
  }

  return true;
}

function findSmallestValidRadix(widths) {
  let radix = 1;
  while (!isValidRadix(radix, widths)) {
    radix += 1;
  }
  return radix;
}

function main(input) {
  const lines = input.split('\n').filter((line) => line !== '');
  const widths = lines[1].split(' ').map(Number);
  console.log(findSmallestValidRadix(widths));
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
