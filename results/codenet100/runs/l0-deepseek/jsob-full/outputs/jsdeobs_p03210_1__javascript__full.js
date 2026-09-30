'use strict';

function Main(input) {
  const firstLine = input.split('\n')[0];
  if (firstLine == 1 || firstLine == 2 || firstLine == 3) {
    console.log('YES');
  } else {
    console.log('NO');
  }
}

Main(require('fs').readFileSync('stdin', 'utf8'));
