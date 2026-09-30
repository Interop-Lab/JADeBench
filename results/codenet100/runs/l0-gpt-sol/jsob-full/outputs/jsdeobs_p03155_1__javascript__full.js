'use strict';

const fs = require('fs');

function Main(input) {
  const numbers = input.split('\n').map(Number);
  console.log(
    (numbers[0] + 1) * numbers[1] +
    (numbers[0] - 1) * numbers[2]
  );
}

Main(fs.readFileSync('/dev/stdin', 'utf8').trim());
