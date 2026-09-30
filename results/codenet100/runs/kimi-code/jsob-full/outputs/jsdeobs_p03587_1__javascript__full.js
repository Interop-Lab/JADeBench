'use strict';

const fs = require('fs');

function main(input) {
  const firstLineCharacters = input.trim().split('\n')[0].split('');
  const numberOfOnes = firstLineCharacters.filter(character => character === '1').length;
  console.log(numberOfOnes);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
