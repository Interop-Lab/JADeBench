'use strict';
const main = input => {
  input = input.trim().split('\n');
  const a = parseInt(input[0].split(' ')[0]);
  const b = parseInt(input[0].split(' ')[1]);
  console.log(b === 1 ? 0 : a - b);
};
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
