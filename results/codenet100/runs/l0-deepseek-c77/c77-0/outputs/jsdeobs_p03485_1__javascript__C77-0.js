const input = require('fs').readFileSync('/dev/stdin', 'utf8');
const numbers = input.split(' ');
let sum = 0;
numbers.forEach(function (num) {
  sum += Number(num);
});
console.log(Math.ceil(sum / numbers.length));
