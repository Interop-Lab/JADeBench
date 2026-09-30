const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');
const result = (input - 30) / 2;

console.log(result);
