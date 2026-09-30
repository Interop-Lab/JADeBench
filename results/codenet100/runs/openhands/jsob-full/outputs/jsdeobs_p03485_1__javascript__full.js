const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');
const numberStrings = input.split(' ');
let sum = 0;

numberStrings.forEach((numberString) => {
  sum += Number(numberString);
});

const average = sum / numberStrings.length;
console.log(Math.ceil(average));
