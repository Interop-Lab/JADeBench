const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');
const numbers = input.split(' ');

let sum = 0;
numbers.forEach((number) => {
  sum += Number(number);
});

const average = sum / numbers.length;
console.log(Math.ceil(average));
