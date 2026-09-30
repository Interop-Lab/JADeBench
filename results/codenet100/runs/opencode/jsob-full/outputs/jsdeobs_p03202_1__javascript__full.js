'use strict';

const fs = require('fs');

function canRepresentSequence(radix, widths) {
  let digits = '0'.repeat(widths[0]);

  for (let index = 0; index < widths.length; index += 1) {
    const width = widths[index];
    const previousWidth = widths[index - 1];

    if (previousWidth < width) {
      digits += '0'.repeat(width - previousWidth);
      continue;
    }

    const incremented = parseInt(digits.substring(0, width), radix) + 1;
    if (isNaN(incremented)) {
      return false;
    }

    digits = String(incremented);
    if (digits.length > width) {
      return false;
    }

    digits = '0'.repeat(width - digits.length) + digits;
  }

  return true;
}

function main(input) {
  const lines = input.split('\n').filter((line) => line !== '');
  const widths = lines[1].split(' ').map((value) => Number(value));

  let radix = 1;
  while (!canRepresentSequence(radix, widths)) {
    radix += 1;
  }

  console.log(radix);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
