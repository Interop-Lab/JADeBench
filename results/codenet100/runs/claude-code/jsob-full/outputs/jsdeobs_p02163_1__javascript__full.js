const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');
lines.shift(); // Discard the operation count; all remaining lines are operations.

let additiveTerm = 0;
let multiplier = 1;

for (const line of lines) {
  const [operation, value] = line.split(' ').map(Number);

  if (operation === 1) {
    additiveTerm *= value;
    multiplier *= value;
  } else if (operation === 2) {
    additiveTerm -= value;
  } else if (operation === 3) {
    additiveTerm += value;
  }
}

console.log(`${additiveTerm} ${multiplier}`);
