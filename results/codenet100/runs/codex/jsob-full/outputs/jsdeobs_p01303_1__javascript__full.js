const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');
const lines = input.replace(/\n$/, '').split('\n');
const testCaseCount = Number(lines.shift());

for (let testCase = 0; testCase < testCaseCount; testCase++) {
  const [left, top, width, height] = lines.shift().split(' ').map(Number);
  const right = left + width;
  const bottom = top + height;
  const pointCount = Number(lines.shift());
  let containedPointCount = 0;

  for (let pointIndex = 0; pointIndex < pointCount; pointIndex++) {
    const [x, y] = lines.shift().split(' ').map(Number);

    if (left <= x && x <= right && top <= y && y <= bottom) {
      containedPointCount++;
    }
  }

  console.log(containedPointCount);
}
