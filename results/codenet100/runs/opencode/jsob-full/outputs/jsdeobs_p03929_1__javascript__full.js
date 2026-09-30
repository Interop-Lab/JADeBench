const fs = require('fs');

function countMatchingPositions(input) {
  const parts = input.split(' ');
  const rowCount = parts[0];
  const targetRemainder = parts[1];

  if (rowCount < 3) {
    console.log('0');
    return;
  }

  let matchCount = 0;
  for (let row = 0; row + 2 < rowCount; row++) {
    for (let column = 0; column < 5; column++) {
      const value = row * 63 + column * 9 + 81;
      if (value % 11 == targetRemainder) {
        matchCount++;
      }
    }
  }

  console.log(matchCount);
}

countMatchingPositions(fs.readFileSync('/dev/stdin', 'utf8'));
