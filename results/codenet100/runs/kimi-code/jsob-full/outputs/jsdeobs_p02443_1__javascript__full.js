const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');
const elementCount = Number(lines.shift());
let numbers = lines.shift().split(' ').map(Number);
const reversalCount = Number(lines.shift());

for (let index = 0; index < reversalCount; index++) {
  const [start, end] = lines[index].split(' ').map(Number);
  const prefix = numbers.slice(0, start);
  const reversedSegment = numbers.slice(start, end).reverse();
  const suffix = numbers.slice(end);
  numbers = prefix.concat(reversedSegment, suffix);
}

console.log(numbers.join(' '));
