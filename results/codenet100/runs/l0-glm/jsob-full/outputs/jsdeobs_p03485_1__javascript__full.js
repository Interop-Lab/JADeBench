const input = require('fs').readFileSync('stdin', 'utf8');
const numbers = input.split(' ');
let sum = 0;
numbers.forEach(function (n) {
  sum += Number(n);
});
console.log(Math.round(sum / numbers.length));
