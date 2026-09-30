'use strict';

const fs = require('fs');

const GRID_LIMIT = 100;
const UNSET_DISTANCE = -1;
const INCONSISTENT_DISTANCE = -2;

function main(input) {
  const lines = input.split('\n');
  const pointCount = parseInt(lines[0]);
  const points = lines.slice(1, pointCount + 1).map((line) => {
    const [x, y, distance] = line.split(' ').map((value) => parseInt(value));
    return { x, y, distance };
  });

  for (let y = 0; y <= GRID_LIMIT; y++) {
    for (let x = 0; x <= GRID_LIMIT; x++) {
      let commonDistance = UNSET_DISTANCE;

      for (const point of points) {
        const distance =
          point.distance + Math.abs(point.y - y) + Math.abs(point.x - x);

        if (commonDistance === UNSET_DISTANCE) {
          commonDistance = distance;
        } else if (commonDistance !== distance) {
          commonDistance = INCONSISTENT_DISTANCE;
          break;
        }
      }

      if (commonDistance !== INCONSISTENT_DISTANCE) {
        console.log('%d %d %d', x, y, commonDistance);
      }
    }
  }
}

main(fs.readFileSync('/dev/stdin', 'utf-8'));
