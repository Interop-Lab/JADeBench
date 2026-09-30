'use strict';

const fs = require('fs');

function main(input) {
  const lines = input.split('\n');
  const measurementCount = parseInt(lines[0]);
  const measurements = [];

  lines.slice(1, measurementCount + 1).forEach(line => {
    const [x, y, offset] = line.split(' ').map(value => parseInt(value));
    measurements.push({ x, y, offset });
  });

  for (let y = 0; y <= 100; y++) {
    for (let x = 0; x <= 100; x++) {
      let commonDistance = -1;

      for (let index = 0; index < measurementCount; index++) {
        const measurement = measurements[index];
        const distance = measurement.offset
          + Math.abs(measurement.y - y)
          + Math.abs(measurement.x - x);

        if (commonDistance === -1) {
          commonDistance = distance;
        } else if (commonDistance !== distance) {
          commonDistance = -2;
          break;
        }
      }

      if (commonDistance !== -2) {
        console.log('%d %d %d', x, y, commonDistance);
      }
    }
  }
}

main(fs.readFileSync('/dev/stdin', 'utf-8'));
