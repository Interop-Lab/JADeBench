const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8');
const a = input - 0;
console.log((a - 30) / 2);
