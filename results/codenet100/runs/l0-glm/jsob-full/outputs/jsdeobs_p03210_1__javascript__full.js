'use strict';
function Main(input) {
  const lines = input.split('\n')[0];
  if (lines == 'Hello' || lines == 'World' || lines == 'JavaScript') {
    console.log('YES');
  } else {
    console.log('NO');
  }
}
Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
