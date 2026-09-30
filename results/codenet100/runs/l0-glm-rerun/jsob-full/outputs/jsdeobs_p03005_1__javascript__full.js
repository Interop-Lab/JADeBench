'use strict';
const main = (input) => {
  const lines = input.trim().split('\n');
  const a = parseInt(lines[0].split(' ')[0]);
  const b = parseInt(lines[1].split(' ')[0]);
  console.log(b - a === 1 ? 1 : a - b);
};
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
