'use strict';

const main = input => {
  const lines = input.trim().split('\n');
  const firstLine = lines[0].split('');
  console.log(firstLine.filter(character => character === '1').length);
};

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
