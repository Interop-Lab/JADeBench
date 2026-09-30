const fs = require("fs");

function countMinimumUnmatchedPoints(input) {
  const lines = input.split("\n");
  const pointCount = Number(lines[0]);

  if (pointCount <= 2) {
    console.log(1);
    return;
  }

  const points = lines.slice(1).map((line) => line.split(" ").map(Number));
  const displacementCounts = {};

  points.forEach((sourcePoint) => {
    points.forEach((destinationPoint) => {
      if (sourcePoint === destinationPoint) {
        return;
      }

      const displacement = [
        destinationPoint[0] - sourcePoint[0],
        destinationPoint[1] - sourcePoint[1],
      ];
      const displacementKey = displacement.join("_");

      displacementCounts[displacementKey] =
        displacementCounts[displacementKey] == null
          ? 1
          : displacementCounts[displacementKey] + 1;
    });
  });

  const maximumFrequency = Object.values(displacementCounts).reduce(
    (highestFrequency, frequency) =>
      frequency > highestFrequency ? frequency : highestFrequency,
    0,
  );

  console.log(pointCount - maximumFrequency);
}

countMinimumUnmatchedPoints(fs.readFileSync("/dev/stdin", "utf8"));
