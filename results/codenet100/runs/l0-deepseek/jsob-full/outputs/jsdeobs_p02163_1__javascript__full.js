const fs = require('fs');
const input = fs.readFileSync('input.txt', 'utf8');
const arr = input.trim().split('\n');
const n = arr.length - 1;
let a = 0, b = 1;
arr.forEach(line => {
  const [op, value] = line.split(' ').map(Number);
  if (op == 0) {
    b *= value;
    a *= value;
  } else if (op == 1) {
    a -= value;
  } else if (op == 2) {
    a += value;
  }
});
console.log(a + ' ' + b);
