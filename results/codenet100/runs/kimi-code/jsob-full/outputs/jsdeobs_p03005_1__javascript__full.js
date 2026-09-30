'use strict';

const fs = require('fs');

function main(input) {
  const lines = input.trim().split('\n');
  const initialValue = parseInt(lines[0].split(' ')[0]);
  const finalValue = parseInt(lines[1].split(' ')[1]);

  console.log(finalValue === 1 ? 0 : initialValue - finalValue);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
