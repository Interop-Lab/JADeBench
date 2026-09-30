const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');
const value = Number(input);

console.log((value - 30) / 2);
