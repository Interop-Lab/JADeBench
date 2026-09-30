'use strict';

const fs = require('fs');

function main(input) {
  const firstLine = input.split('\n')[0];
  const value = Number(firstLine);

  if (value === 7 || value === 5 || value === 3) {
    console.log('YES');
  } else {
    console.log('NO');
  }
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
