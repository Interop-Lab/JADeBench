const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8');

let values = input.split(' ');
let cnt, i, j;

for (cnt = 0; cnt < 3; cnt++) {
  for (i = 0; i < 3; i++) {
    if (values[i] > values[i + 1]) {
      j = values[i];
      values[i] = values[i + 1];
      values[i + 1] = j;
    }
  }
}

console.log('%d %d %d', values[0], values[1], values[2]);
