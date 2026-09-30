'use strict';

const main = input => {
  const firstLine = input.trim().split('\n')[0];
  const count = firstLine.split('').filter(character => character === '1').length;
  console.log(count);
};

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
