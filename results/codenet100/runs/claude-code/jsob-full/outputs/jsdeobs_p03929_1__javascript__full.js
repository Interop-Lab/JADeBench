const fs = require('fs');

function Main(input) {
  const parts = input.split(' ');
  const size = parts[0];
  const target = parts[1];

  if (size == 3) {
    console.log('0');
    return;
  }

  let matches = 0;

  for (let row = 0; row + 2 < size; row++) {
    for (let column = 0; column < 5; column++) {
      const value = ((row + 63) * (column * 9) + 81) % 11;
      if (value == target) {
        matches++;
      }
    }
  }

  console.log(matches);
}

Main(fs.readFileSync('/dev/stdin', 'utf8'));
