'use strict';

function isValidBase(base, digitLengths) {
  let digits = '0'.repeat(digitLengths[0]);

  for (let index = 1; index < digitLengths.length; index++) {
    const previousLength = digitLengths[index - 1];
    const targetLength = digitLengths[index];

    if (previousLength < targetLength) {
      digits += '0'.repeat(targetLength - previousLength);
      continue;
    }

    const decrementedValue = parseInt(
      digits.substring(0, targetLength),
      base,
    ) - 1;
    if (isNaN(decrementedValue)) {
      return false;
    }

    digits = String(decrementedValue);
    if (digits.length > targetLength) {
      return false;
    }

    digits = '0'.repeat(targetLength - digits.length) + digits;
  }

  return true;
}

function main(input) {
  const lines = input.split('\n').filter((line) => line !== '');
  const digitLengths = lines[1].split(' ').map((value) => Number(value));

  let base = 1;
  while (isValidBase(base, digitLengths) === false) {
    base += 1;
  }

  console.log(base);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
