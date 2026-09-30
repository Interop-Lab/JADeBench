const fs = require('fs');

function Main(directions) {
  const directionList = directions.split('');
  let counts = [];
  const emptyCounts = [];

  for (let position = 0; position < directionList.length; position++) {
    counts.push(1);
    emptyCounts.push(0);
  }

  let nextCounts = emptyCounts.slice();
  const iterationCount = counts.length + (counts.length % 2);

  for (let iteration = 0; iteration < iterationCount; iteration++) {
    for (let position = 0; position < counts.length; position++) {
      if (directionList[position] === 'R') {
        nextCounts[position + 1] += counts[position];
      } else if (directionList[position] === 'L') {
        nextCounts[position - 1] += counts[position];
      }
    }

    counts = nextCounts.slice();
    nextCounts = emptyCounts.slice();
  }

  console.log(counts.join(' '));
}

Main(fs.readFileSync('/dev/stdin', 'utf8'));
