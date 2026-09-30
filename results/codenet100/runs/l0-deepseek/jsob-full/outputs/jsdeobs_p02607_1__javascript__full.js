const fs = require('fs');

function main(input) {
  const lines = input.toString().split('\n');
  const numbers = lines[0].trim().split(/\s+/).map(Number);
  const length = numbers.length;
  let count = 0;

  for (let i = 0; i < length; i++) {
    if (i % 2 === 0) continue;
    if (numbers[i] % 2 === 0) continue;
    count++;
  }

  console.log(count);
}

main(fs.readFileSync('input.txt', 'utf8'));
