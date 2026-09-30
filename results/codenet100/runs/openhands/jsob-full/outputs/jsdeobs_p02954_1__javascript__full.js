function Main(input) {
  const directions = input.split('');
  let currentCounts = [];
  const emptyCounts = [];

  for (let position = 0; position < directions.length; position++) {
    currentCounts.push(1);
    emptyCounts.push(0);
  }

  let nextCounts = emptyCounts.slice();
  for (
    let step = 0;
    step < currentCounts.length + (currentCounts.length % 2);
    step++
  ) {
    for (let position = 0; position < currentCounts.length; position++) {
      if (directions[position] == 'R') {
        nextCounts[position + 1] += currentCounts[position];
      } else if (directions[position] == 'L') {
        nextCounts[position - 1] += currentCounts[position];
      }
    }

    currentCounts = nextCounts.slice();
    nextCounts = emptyCounts.slice();
  }

  console.log(currentCounts.join(' '));
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));

