const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');
lines.shift();

let offset = 0;
let multiplier = 1;

for (const line of lines) {
  const [operation, value] = line.split(' ').map(Number);

  if (operation === 1) {
    offset *= value;
    multiplier *= value;
  } else if (operation === 2) {
    offset -= value;
  } else if (operation === 3) {
    offset += value;
  }
}

console.log(offset + ' ' + multiplier);
