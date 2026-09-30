const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8');
const arr = input.trim().split('\n');
const n = arr.length - 1;
let a = 0, b = 1;
arr.forEach(line => {
  const [op, val] = line.split(' ').map(Number);
  if (op == 0) {
    b *= val;
    a *= val;
  } else if (op == 1) {
    a -= val;
  } else if (op == 2) {
    a += val;
  }
});
console.log(a + ' ' + b);
