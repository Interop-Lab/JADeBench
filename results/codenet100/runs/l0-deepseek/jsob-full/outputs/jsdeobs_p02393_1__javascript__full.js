const fs = require('fs');
let input = fs.readFileSync('/dev/stdin', 'utf8');
input = input.split(' ');
let cnt, i, j;
for (cnt = 0; cnt < 3; cnt++) {
  for (i = 0; i < 3; i++) {
    if (input[i] > input[i + 1]) {
      j = input[i];
      input[i] = input[i + 1];
      input[i + 1] = j;
    }
  }
}
console.log('Result:', input[0], input[1], input[2]);
