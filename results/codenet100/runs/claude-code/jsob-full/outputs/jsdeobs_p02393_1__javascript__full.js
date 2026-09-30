const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8').split(' ');

for (let pass = 0; pass < 3; pass += 1) {
  for (let index = 0; index < 3; index += 1) {
    if (input[index] > input[index + 1]) {
      const current = input[index];
      input[index] = input[index + 1];
      input[index + 1] = current;
    }
  }
}

console.log('%d %d %d', input[0], input[1], input[2]);
