const fs = require('fs');

const firstLine = fs.readFileSync('/dev/stdin', 'utf8').split('\n')[0];
let decoded = '';

for (let index = 0; index < firstLine.length; index += 2) {
  decoded += firstLine[index];
}

console.log(decoded);
