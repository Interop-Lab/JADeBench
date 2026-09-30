const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');
const numbers = input.split(' ');

let sum = 0;
for (const number of numbers) {
  sum += Number(number);
}

console.log(Math.floor(sum / numbers.length));
