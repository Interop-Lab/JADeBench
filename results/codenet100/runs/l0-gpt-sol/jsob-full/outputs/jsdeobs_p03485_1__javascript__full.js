const input = require('fs').readFileSync('/dev/stdin', 'utf8');
const numbers = input.split(' ');

let sum = 0;

numbers.forEach(function (number) {
  sum += Number(number);
});

console.log(Math.floor(sum / numbers.length));
