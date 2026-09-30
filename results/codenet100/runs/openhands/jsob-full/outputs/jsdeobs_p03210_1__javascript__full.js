'use strict';

function main(input) {
  const firstLine = input.split('\n')[0];
  const isAcceptedValue = firstLine == 7 || firstLine == 5 || firstLine == 3;

  console.log(isAcceptedValue ? 'YES' : 'NO');
}

const input = require('fs').readFileSync('/dev/stdin', 'utf8');
main(input);
