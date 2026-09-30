const input = require('fs').readFileSync('stdin', 'utf8');
const numbers = input.split(' ');
let sum = 0;
numbers.forEach(function(num) {
    sum += Number(num);
});
console.log(Math.floor(sum / numbers.length));
