'use strict';

const fs = require('fs');

function main(input) {
  const lines = input.trim().split('\n');
  const firstLineCharacters = lines[0].split('');
  const oneCount = firstLineCharacters.filter(character => character === '1').length;

  console.log(oneCount);
}

const input = fs.readFileSync('/dev/stdin', 'utf8');
main(input);
