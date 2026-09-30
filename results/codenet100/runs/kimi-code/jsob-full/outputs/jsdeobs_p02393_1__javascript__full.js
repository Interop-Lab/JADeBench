const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8').split(' ');

for (let pass = 0; pass < 3; pass++) {
  for (let index = 0; index < 3; index++) {
    if (input[index] > input[index + 1]) {
      [input[index], input[index + 1]] = [input[index + 1], input[index]];
    }
  }
}

console.log('%d %d %d', input[0], input[1], input[2]);
