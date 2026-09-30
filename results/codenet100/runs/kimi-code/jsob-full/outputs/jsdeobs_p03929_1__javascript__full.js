const fs = require('fs');

function countMatches(input) {
  const [targetValue, size] = input.split(' ');

  if (size == 3) {
    console.log('0');
    return;
  }

  let matches = 0;

  for (let row = 0; row + 2 < size; row++) {
    for (let column = 0; column < 5; column++) {
      const value = (63 * row + 9 * column + 81) % 11;
      if (value == targetValue) {
        matches++;
      }
    }
  }

  console.log(matches);
}

const input = fs.readFileSync('/dev/stdin', 'utf8');
countMatches(input);
