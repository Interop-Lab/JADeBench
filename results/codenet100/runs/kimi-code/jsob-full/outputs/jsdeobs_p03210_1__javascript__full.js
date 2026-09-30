'use strict';

const fs = require('fs');

function Main(input) {
  const firstLine = input.split('\n')[0];
  const isAccepted = firstLine == 7 || firstLine == 5 || firstLine == 3;

  console.log(isAccepted ? 'YES' : 'NO');
}

Main(fs.readFileSync('/dev/stdin', 'utf8'));
