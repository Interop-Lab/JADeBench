const fs = require("fs");

function main(lines) {
  const [locationCount, serviceRadius, batchCapacity] = lines[0]
    .split(" ")
    .map((value) => value - 0);

  const locations = [];
  for (let lineIndex = 1; lineIndex <= locationCount; lineIndex++) {
    locations.push(lines[lineIndex].split(" ").map((value) => value - 0));
  }

  locations.sort((left, right) => left[0] - right[0]);

  let totalBatches = 0;
  for (let index = 0; index < locationCount; index++) {
    const location = locations[index];
    if (location[1] > 0) {
      const batches = Math.ceil(location[1] / batchCapacity);
      totalBatches += batches;

      const lastCoveredPosition = location[0] + serviceRadius * 2 + 1;
      for (let affectedIndex = index; affectedIndex < locationCount; affectedIndex++) {
        const affectedLocation = locations[affectedIndex];
        if (affectedLocation[0] <= lastCoveredPosition) {
          affectedLocation[1] -= batchCapacity * batches;
        } else {
          break;
        }
      }
    }
  }

  console.log(totalBatches);
}

const lines = fs.readFileSync("/dev/stdin", "utf8").split("\n");
main(lines);
