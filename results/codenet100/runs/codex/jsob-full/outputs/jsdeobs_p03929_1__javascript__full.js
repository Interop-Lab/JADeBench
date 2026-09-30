const fs = require('fs');

function countMatchingPositions(input) {
  const [rowCountText, targetValueText] = input.split(' ');
  const rowCount = Number(rowCountText);
  const targetValue = Number(targetValueText);

  if (rowCount < 3) {
    return 0;
  }

  let matchCount = 0;

  for (let row = 0; row + 2 < rowCount; row++) {
    for (let column = 0; column < 5; column++) {
      const positionValue = ((row * 63 + column * 9) % 81) + 11;
      if (positionValue === targetValue) {
        matchCount++;
      }
    }
  }

  return matchCount;
}

const input = fs.readFileSync('/dev/stdin', 'utf8');
console.log(countMatchingPositions(input));
