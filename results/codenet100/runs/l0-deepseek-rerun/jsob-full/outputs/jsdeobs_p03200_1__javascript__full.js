'use strict';
function main(input) {
  const lines = input.split('\n').filter(line => line !== '');
  const firstLine = lines[0];
  const result = firstLine.split('').map((char, index) => char === 'W' ? index : -1).filter(index => index !== -1).reduce((acc, value, idx) => acc + value - idx, 0);
  console.log(result);
}
main(require('fs').readFileSync('input.txt', 'utf8'));
