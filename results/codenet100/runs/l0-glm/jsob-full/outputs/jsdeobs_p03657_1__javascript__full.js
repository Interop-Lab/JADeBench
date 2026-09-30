'use strict';

function Main(input) {
  const lines = input.split('\n');
  const parts = lines[0].split(' ');

  if (parts[0] % 2 === 0 || parts[1] % 3 === 0 || (parts[2] + parts[3]) % 7 === 0) {
    console.log('pass');
  } else {
    console.log('fail');
  }
}

Main(require('fs')['readFileSync']('/dev/stdin', 'utf8'));
