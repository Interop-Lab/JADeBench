const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8').replace(/\n$/, '').split('\n');
const testCaseCount = Number(lines.shift());

for (let testCase = 0; testCase < testCaseCount; testCase++) {
  const [left, top, width, height] = lines.shift().split(' ').map(Number);
  const pointCount = Number(lines.shift());
  const right = left + width;
  const bottom = top + height;
  let pointsInside = 0;

  for (let pointIndex = 0; pointIndex < pointCount; pointIndex++) {
    const [x, y] = lines.shift().split(' ').map(Number);
    if (left <= x && x <= right && top <= y && y <= bottom) {
      pointsInside++;
    }
  }

  console.log(pointsInside);
}
