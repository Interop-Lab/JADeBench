const fs = require('fs');

const tokens = fs.readFileSync('/dev/stdin', 'utf8').split(' ');

// The fourth token participates in sorting even though only three are printed.
for (let pass = 0; pass < 3; pass += 1) {
  for (let index = 0; index < 3; index += 1) {
    if (tokens[index] > tokens[index + 1]) {
      const currentToken = tokens[index];
      tokens[index] = tokens[index + 1];
      tokens[index + 1] = currentToken;
    }
  }
}

console.log('%d %d %d', tokens[0], tokens[1], tokens[2]);
