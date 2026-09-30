'use strict';

const fs = require('fs');

function main(input) {
  const lines = input.trim().split('\n');
  const itemCount = Number(lines[0].trim());
  const values = lines[1].trim().split(' ').map(Number);

  let result = 'YES';

  for (let index = 0; index < itemCount; index += 1) {
    const laterValues = values.slice(index + 1);
    const duplicateIndex = laterValues.indexOf(values[index]);

    if (duplicateIndex !== -1) {
      result = 'NO';
      break;
    }
  }

  console.log(result);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
