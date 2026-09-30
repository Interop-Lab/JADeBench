const fs = require('fs');

function simulateDirections(input) {
  const directions = input.split('');
  let counts = [];
  const emptyCounts = [];

  for (let index = 0; index < directions.length; index++) {
    counts.push(1);
    emptyCounts.push(0);
  }

  let nextCounts = emptyCounts.slice();

  for (let round = 0; round < counts.length + (counts.length % 2); round++) {
    for (let index = 0; index < counts.length; index++) {
      if (directions[index] === 'R') {
        nextCounts[index + 1] += counts[index];
      } else if (directions[index] === 'L') {
        nextCounts[index - 1] += counts[index];
      }
    }

    counts = nextCounts.slice();
    nextCounts = emptyCounts.slice();
  }

  console.log(counts.join(' '));
}

const input = fs.readFileSync('/dev/stdin', 'utf8');
simulateDirections(input);
