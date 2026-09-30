const input = require('fs').readFileSync('/dev/stdin', 'utf8');
const numbers = input.trim().split(' ');
let sum = 0;
numbers.forEach(function (n) {
    sum += Number(n);
});
console.log(Math.floor(sum / numbers.length));
