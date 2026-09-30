'use strict';

function Main(input) {
  const lines = input.split('\n');
  const values = lines[0].split(' ');

  if (
    values[0] % 3 === 0 ||
    values[1] % 3 === 0 ||
    (values[0] + values[1]) % 3 === 0
  ) {
    console.log('Possible');
  } else {
    console.log('Impossible');
  }
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
