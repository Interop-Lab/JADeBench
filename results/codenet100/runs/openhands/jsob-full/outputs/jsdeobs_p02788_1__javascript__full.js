function main(lines) {
  const [locationCount, distanceLimit, batchCapacity] = lines[0]
    .split(' ')
    .map(Number);
  const locations = [];

  for (let lineIndex = 1; lineIndex <= locationCount; lineIndex++) {
    const [position, requiredAmount] = lines[lineIndex]
      .split(' ')
      .map(Number);
    locations.push({ position, requiredAmount });
  }

  locations.sort((first, second) => first.position - second.position);

  let totalBatches = 0;
  for (let locationIndex = 0; locationIndex < locationCount; locationIndex++) {
    const location = locations[locationIndex];

    if (location.requiredAmount > 0) {
      const batchCount = Math.ceil(location.requiredAmount / batchCapacity);
      totalBatches += batchCount;
      const furthestCoveredPosition =
        location.position + distanceLimit * 2 + 1;

      for (
        let coveredIndex = locationIndex;
        coveredIndex < locationCount;
        coveredIndex++
      ) {
        const coveredLocation = locations[coveredIndex];
        if (coveredLocation.position <= furthestCoveredPosition) {
          coveredLocation.requiredAmount -= batchCapacity * batchCount;
        } else {
          break;
        }
      }
    }
  }

  console.log(totalBatches);
}

const input = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');
main(input);
