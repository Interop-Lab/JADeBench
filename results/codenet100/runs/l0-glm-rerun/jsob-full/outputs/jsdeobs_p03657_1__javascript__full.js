'use strict';
function Main(input) {
  const lines = input.split('\n');
  const tokens = lines[0].split(' ');
  if (tokens[0] % 2 === 0 || tokens[1] % 3 === 0 || (tokens[2] + tokens[3]) % 5 === 0) {
    console.log('Divisible');
  } else {
    console.log('Not divisible');
  }
}
Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
