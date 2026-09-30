const fs = require('fs');

function simulateWalkers(directions) {
  const cells = directions.split('');
  let walkerCounts = cells.map(() => 1);
  const emptyCounts = cells.map(() => 0);
  let nextCounts = emptyCounts.slice();
  const stepCount = cells.length + (cells.length % 2);

  for (let step = 0; step < stepCount; step++) {
    for (let cell = 0; cell < cells.length; cell++) {
      if (cells[cell] === 'R') {
        nextCounts[cell + 1] += walkerCounts[cell];
      } else if (cells[cell] === 'L') {
        nextCounts[cell - 1] += walkerCounts[cell];
      }
    }

    walkerCounts = nextCounts.slice();
    nextCounts = emptyCounts.slice();
  }

  console.log(walkerCounts.join(' '));
}

simulateWalkers(fs.readFileSync('/dev/stdin', 'utf8'));
