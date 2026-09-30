'use strict';
const main = input => {
  input = input.trim().split('\n');
  const firstLine = input[0].split('');
  console.log(firstLine.filter(c => c === '1').length);
};
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
