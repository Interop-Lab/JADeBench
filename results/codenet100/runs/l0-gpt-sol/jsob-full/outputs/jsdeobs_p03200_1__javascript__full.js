'use strict';

function main(input) {
  const lines = input.split('\n').filter(line => line !== '');
  const firstLine = lines[0];

  const result = firstLine
    .split('')
    .map((character, index) => character === 'W' ? index : -1)
    .filter(index => index !== -1)
    .reduce((total, position, index) => total + position - index, 0);

  console.log(result);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
