const fs = require('fs');

const inputText = fs.readFileSync('/dev/stdin', 'utf8');
const inputNumber = Number(inputText);
const result = (inputNumber - 30) / 2;

console.log(result);
