'use strict';
const main = input => {
  input = input.trim().split('\n');
  const a = parseInt(input[0].split(' ')[0]);
  const b = parseInt(input[1].split(' ')[0]);
  console.log(b - a > 0 ? 1 : a - b);
};
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
