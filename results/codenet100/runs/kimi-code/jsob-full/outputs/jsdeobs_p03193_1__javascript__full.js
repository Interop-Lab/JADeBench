const fs = require('fs');

function countPointsAtOrAboveMinimum(input) {
  const lines = input.split('\n');
  const [minimumX, minimumY] = lines[0].split(' ').map(Number);
  let count = 0;

  for (let index = 1; index < lines.length; index++) {
    const [x, y] = lines[index].split(' ').map(Number);
    if (x >= minimumX && y >= minimumY) {
      count++;
    }
  }

  console.log(count);
}

const input = fs.readFileSync('/dev/stdin', 'utf8').trim();
countPointsAtOrAboveMinimum(input);
