const fs = require('fs');

const values = fs.readFileSync('/dev/stdin', 'utf8').split(' ');
const sortedValueCount = 4;

for (let pass = 0; pass < sortedValueCount - 1; pass += 1) {
  for (let index = 0; index < sortedValueCount - 1; index += 1) {
    if (values[index] > values[index + 1]) {
      const currentValue = values[index];
      values[index] = values[index + 1];
      values[index + 1] = currentValue;
    }
  }
}

console.log('%d %d %d', values[0], values[1], values[2]);
