const fs = require('fs');

function solve(source) {
  const tokens = source.replace(/\n/g, ' ').split(' ');
  const first = parseInt(tokens[0], 10);
  const second = parseInt(tokens[1], 10);
  return ((first * second) / (first + second)).toFixed(2);
}

const source = fs.readFileSync('/dev/stdin', 'utf8');
console.log(`${solve(source)}\n`);
