const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');
const [first, second, third] = input.trim().split(' ').map(Number);

console.log(first + second + third);
