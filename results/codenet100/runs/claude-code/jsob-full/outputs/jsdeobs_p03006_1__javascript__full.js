'use strict';

const fs = require('fs');

function main(input) {
  const lines = input.split('\n');
  const pointCount = Number(lines[0]);

  if (pointCount <= 2) {
    console.log(1);
    return;
  }

  const points = lines
    .slice(1)
    .map((line) => line.split(' ').map(Number));
  const displacementCounts = {};

  points.forEach((origin) => {
    points.forEach((destination) => {
      if (origin === destination) return;

      const displacement = [
        destination[0] - origin[0],
        destination[1] - origin[1],
      ];
      const key = displacement.join('_');
      displacementCounts[key] = displacementCounts[key] == null
        ? 1
        : displacementCounts[key] + 1;
    });
  });

  const [maximumCount] = Object.keys(displacementCounts).reduce(
    (best, key) => {
      const count = displacementCounts[key];
      return count > best[0] ? [count, key] : best;
    },
    [0, ''],
  );

  console.log(pointCount - maximumCount);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
