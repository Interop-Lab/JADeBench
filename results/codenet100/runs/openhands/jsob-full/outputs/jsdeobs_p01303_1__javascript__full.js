const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8').replace(/\n$/, '').split('\n');
const testCaseCount = Number(lines.shift());

for (let testCase = 0; testCase < testCaseCount; testCase += 1) {
  const [xStart, yStart, width, height] = lines.shift().split(' ').map(Number);
  const xEnd = xStart + width;
  const yEnd = yStart + height;
  const pointCount = Number(lines.shift());
  let containedPointCount = 0;

  for (let pointIndex = 0; pointIndex < pointCount; pointIndex += 1) {
    const [x, y] = lines.shift().split(' ').map(Number);
    if (xStart <= x && x <= xEnd && yStart <= y && y <= yEnd) {
      containedPointCount += 1;
    }
  }

  console.log(containedPointCount);
}
