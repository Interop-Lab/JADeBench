'use strict';

const fs = require('fs');

function main(input) {
  const [firstLine] = input.trim().split('\n');
  const characters = firstLine.split('');
  const oneCount = characters.filter((character) => character === '1').length;

  console.log(oneCount);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
