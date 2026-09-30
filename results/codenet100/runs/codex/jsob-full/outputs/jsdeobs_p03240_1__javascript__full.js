'use strict';

function main(input) {
  const lines = input.split('\n');
  const pointCount = parseInt(lines[0]);
  const points = lines
    .slice(1, pointCount + 1)
    .map((line) => line.split(' ').map((value) => parseInt(value)));

  for (let centerY = 0; centerY <= 100; centerY++) {
    for (let centerX = 0; centerX <= 100; centerX++) {
      let expectedHeight = -1;

      for (let pointIndex = 0; pointIndex < pointCount; pointIndex++) {
        const [pointX, pointY, pointHeight] = points[pointIndex];
        const candidateHeight =
          pointHeight +
          Math.abs(pointY - centerY) +
          Math.abs(pointX - centerX);

        if (expectedHeight === -1) {
          expectedHeight = candidateHeight;
        } else if (expectedHeight !== candidateHeight) {
          expectedHeight = -2;
          break;
        }
      }

      if (expectedHeight === -2) {
        continue;
      }

      console.log('%d %d %d', centerX, centerY, expectedHeight);
    }
  }
}

main(require('fs').readFileSync('/dev/stdin', 'utf-8'));
