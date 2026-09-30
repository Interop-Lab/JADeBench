const fs = require('fs');

function main(input) {
  const lines = input.split('\n');
  const pointCount = Number(lines[0]);

  if (pointCount === 2) {
    console.log(1);
    return;
  }

  const points = lines
    .slice(1)
    .map((line) => line.split(' ').map(Number));

  const displacementCounts = {};

  points.forEach((from) => {
    points.forEach((to) => {
      if (from === to) return;

      const displacement = [to[0] - from[0], to[1] - from[1]];
      const key = displacement.join('_');
      displacementCounts[key] = displacementCounts[key] == null
        ? 1
        : displacementCounts[key] + 1;
    });
  });

  const [mostCommonCount] = Object.keys(displacementCounts).reduce(
    (best, key) => displacementCounts[key] > best[0]
      ? [displacementCounts[key], key]
      : best,
    [0, ''],
  );

  console.log(1 + (pointCount - 1) - mostCommonCount);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
