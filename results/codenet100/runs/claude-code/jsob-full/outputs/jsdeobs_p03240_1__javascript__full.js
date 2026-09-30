'use strict';

const fs = require('fs');

function main(input) {
  const lines = input.split('\n');
  const pointCount = parseInt(lines[0]);
  const points = lines
    .slice(1, pointCount + 1)
    .map((line) => line.split(' ').map((value) => parseInt(value)));

  const maximumCoordinate = 100;

  for (let candidateY = 0; candidateY <= maximumCoordinate; candidateY++) {
    for (let candidateX = 0; candidateX <= maximumCoordinate; candidateX++) {
      let expectedDistance = -1;
      let hasConflictingDistance = false;

      for (let pointIndex = 0; pointIndex < pointCount; pointIndex++) {
        const [pointX, pointY, baseDistance] = points[pointIndex];
        const distance =
          baseDistance +
          Math.abs(pointY - candidateY) +
          Math.abs(pointX - candidateX);

        if (expectedDistance === -1) {
          expectedDistance = distance;
        } else if (expectedDistance !== distance) {
          hasConflictingDistance = true;
          break;
        }
      }

      if (hasConflictingDistance) {
        console.log('%d %d %d', candidateX, candidateY, -2);
      }
    }
  }
}

main(fs.readFileSync('/dev/stdin', 'utf-8'));
