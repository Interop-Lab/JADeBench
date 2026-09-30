function countQualifyingPoints(input) {
  const lines = input.split('\n');
  const [minimumX, minimumY] = lines[0].split(' ').map(Number);
  let qualifyingCount = 0;

  for (let index = 1; index < lines.length; index++) {
    const [x, y] = lines[index].split(' ').map(Number);

    if (x >= minimumX && y >= minimumY) {
      qualifyingCount++;
    }
  }

  console.log(qualifyingCount);
}

const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8').trim();
countQualifyingPoints(input);
