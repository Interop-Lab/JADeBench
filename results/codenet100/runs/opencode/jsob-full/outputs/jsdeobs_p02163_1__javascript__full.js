const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');
const operationCount = Number(lines.shift());

// Together these values represent the affine transformation
//     result = scale * input + offset
// produced by the operations read so far.
let offset = 0;
let scale = 1;

lines.forEach((line) => {
  const [operation, value] = line.split(' ').map(Number);

  if (operation === 1) {
    offset *= value;
    scale *= value;
  } else if (operation === 2) {
    offset -= value;
  } else if (operation === 3) {
    offset += value;
  }
});

console.log(`${offset} ${scale}`);
