const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');
const numericInput = Number(input);

console.log((numericInput - 30) / 2);
