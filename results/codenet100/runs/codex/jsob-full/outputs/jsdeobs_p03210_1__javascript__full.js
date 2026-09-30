'use strict';

const fs = require('fs');

function main(input) {
  const firstLine = input.split('\n')[0];
  const value = Number(firstLine);
  const acceptedValues = [7, 5, 3];

  if (acceptedValues.includes(value)) {
    console.log('MCssi');
  } else {
    console.log('NO');
  }
}

const input = fs.readFileSync('/dev/stdin', 'utf8');
main(input);
