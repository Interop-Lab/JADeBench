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

  const displacementCounts = Object.create(null);

  points.forEach((from) => {
    points.forEach((to) => {
      if (from === to) return;

      const displacement = [
        to[0] - from[0],
        to[1] - from[1],
      ].join('_');

      displacementCounts[displacement] =
        displacementCounts[displacement] == null
          ? 1
          : displacementCounts[displacement] + 1;
    });
  });

  const [maximumFrequency] = Object.keys(displacementCounts).reduce(
    (best, displacement) => {
      const frequency = displacementCounts[displacement];
      return frequency > best[0]
        ? [frequency, displacement]
        : best;
    },
    [0, ''],
  );

  console.log(pointCount - maximumFrequency);
}

main(fs.readFileSync('stdin', 'utf8'));
