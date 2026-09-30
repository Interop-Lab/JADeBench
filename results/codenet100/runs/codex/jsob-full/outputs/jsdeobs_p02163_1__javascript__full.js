const fs = require('fs');

const operations = fs
  .readFileSync('/dev/stdin', 'utf8')
  .trim()
  .split('\n');

operations.shift();

let additiveTerm = 0;
let multiplier = 1;

operations.forEach((operation) => {
  const [type, value] = operation.split(' ').map(Number);

  if (type === 1) {
    additiveTerm *= value;
    multiplier *= value;
  } else if (type === 2) {
    additiveTerm -= value;
  } else if (type === 3) {
    additiveTerm += value;
  }
});

console.log(`${additiveTerm} ${multiplier}`);
