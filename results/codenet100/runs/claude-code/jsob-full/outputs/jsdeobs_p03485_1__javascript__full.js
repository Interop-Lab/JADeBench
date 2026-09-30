const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');
const numbers = input.split(' ');

let sum = 0;
numbers.forEach(function addNumber(number) {
  sum += Number(number);
});

console.log(Math.ceil(sum / numbers.length));
