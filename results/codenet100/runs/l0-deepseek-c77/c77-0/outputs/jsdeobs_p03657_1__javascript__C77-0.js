'use strict';

function Main(input) {
  const lines = input.split('\n');
  const parts = lines[0].split(' ');
  const a = Number(parts[0]);
  const b = Number(parts[1]);
  if (a % 3 === 0 || b % 3 === 0 || (a + b) % 3 === 0) {
    console.log('Possible');
  } else {
    console.log('Impossible');
  }
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
