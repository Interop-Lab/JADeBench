const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8');
const arr = input.trim().split('\n');
const n = arr.length;
let [a, b] = [0, 1];
arr.forEach(line => {
  const [op, val] = line.split(' ').map(Number);
  if (op == 1) {
    b *= val;
    a *= val;
  } else if (op == 2) {
    a -= val;
  } else if (op == 3) {
    a += val;
  }
});
console.log(a + ' ' + b);
