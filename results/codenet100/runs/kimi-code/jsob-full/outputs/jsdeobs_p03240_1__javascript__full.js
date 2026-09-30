'use strict';

const fs = require('fs');

function findConsistentGridPoints(input) {
  const lines = input.split('\n');
  const measurementCount = parseInt(lines[0]);
  const measurements = lines
    .slice(1, measurementCount + 1)
    .map((line) => line.split(' ').map((value) => parseInt(value)));

  const xCoordinates = [];
  const yCoordinates = [];
  const heights = [];

  measurements.forEach(([x, y, height]) => {
    xCoordinates.push(x);
    yCoordinates.push(y);
    heights.push(height);
  });

  const maximumCoordinate = 100;

  for (let candidateY = 0; candidateY <= maximumCoordinate; candidateY++) {
    for (let candidateX = 0; candidateX <= maximumCoordinate; candidateX++) {
      let commonHeight = -1;

      for (let index = 0; index < measurementCount; index++) {
        const candidateHeight =
          heights[index] +
          Math.abs(yCoordinates[index] - candidateY) +
          Math.abs(xCoordinates[index] - candidateX);

        if (commonHeight === -1) {
          commonHeight = candidateHeight;
        } else if (commonHeight !== candidateHeight) {
          commonHeight = -2;
          break;
        }
      }

      if (commonHeight !== -2) {
        console.log('%d %d %d', candidateX, candidateY, commonHeight);
      }
    }
  }
}

findConsistentGridPoints(fs.readFileSync('/dev/stdin', 'utf-8'));
