const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8');
const [p, m, c] = input.trim().split(' ').map(Number);
console.log(p + m + c);
