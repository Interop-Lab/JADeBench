'use strict';

const fs = require('fs');

function main(input) {
  const firstLine = input.trim().split('\n')[0];
  const oneCount = firstLine.split('').filter((character) => character === '1').length;

  console.log(oneCount);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
