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

  for (const point of points) {
    for (const otherPoint of points) {
      if (point === otherPoint) continue;

      const displacement = [
        otherPoint[0] - point[0],
        otherPoint[1] - point[1],
      ].join('_');

      displacementCounts[displacement] = displacementCounts[displacement] == null
        ? 1
        : displacementCounts[displacement] + 1;
    }
  }

  const maximumDisplacementCount = Object.keys(displacementCounts).reduce(
    (maximum, displacement) => Math.max(maximum, displacementCounts[displacement]),
    0,
  );

  console.log(pointCount - maximumDisplacementCount);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
