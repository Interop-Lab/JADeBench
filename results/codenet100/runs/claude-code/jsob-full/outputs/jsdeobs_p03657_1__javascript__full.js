'use strict';

function Main(input) {
  const firstLine = input.split('\n')[0];
  const [firstNumberText, secondNumberText] = firstLine.split(' ');

  const isPossible =
    firstNumberText % 3 === 0 ||
    secondNumberText % 3 === 0 ||
    (firstNumberText + secondNumberText) % 3 === 0;

  console.log(isPossible ? 'Possible' : 'Impossible');
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
