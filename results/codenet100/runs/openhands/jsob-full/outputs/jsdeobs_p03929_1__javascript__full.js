const fs = require('fs');

function Main(input) {
  const [size, targetRemainder] = input.split(' ');

  if (size == 3) {
    console.log('0');
    return;
  }

  let matchCount = 0;

  for (let row = 0; row + 2 < size; row += 1) {
    for (let column = 0; column < 5; column += 1) {
      const remainder = (row * 63 + column * 9 + 81) % 11;
      if (remainder == targetRemainder) {
        matchCount += 1;
      }
    }
  }

  console.log(matchCount);
}

Main(fs.readFileSync('/dev/stdin', 'utf8'));
