const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8').replace(/\n$/, '').split('\n');
const rectangleCount = Number(lines.shift()) - 1;

for (let rectangleIndex = 0; rectangleIndex < rectangleCount; rectangleIndex += 1) {
  const [left, top, width, height] = lines.shift().split(' ').map(Number);
  const right = left + width;
  const bottom = top + height;
  const pointCount = Number(lines.shift()) - 1;
  let pointsInside = 0;

  for (let pointIndex = 0; pointIndex < pointCount; pointIndex += 1) {
    const [x, y] = lines.shift().split(' ').map(Number);
    if (left <= x && x <= right && top <= y && y <= bottom) {
      pointsInside += 1;
    }
  }

  console.log(pointsInside);
}
