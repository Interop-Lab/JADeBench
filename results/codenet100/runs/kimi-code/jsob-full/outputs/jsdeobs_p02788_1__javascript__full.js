const fs = require('fs');

function main(lines) {
  const [pointCount, radius, capacity] = lines[0].split(' ').map(Number);
  const points = [];

  for (let index = 1; index <= pointCount; index++) {
    points.push(lines[index].split(' ').map(Number));
  }

  points.sort((left, right) => left[0] - right[0]);

  let operationCount = 0;

  for (let index = 0; index < pointCount; index++) {
    const [position, demand] = points[index];
    if (demand <= 0) {
      continue;
    }

    const operationsNeeded = Math.ceil(demand / capacity);
    operationCount += operationsNeeded;
    const coveredThrough = position + radius * 2 + 1;
    const suppliedAmount = capacity * operationsNeeded;

    for (let coveredIndex = index; coveredIndex < pointCount; coveredIndex++) {
      const point = points[coveredIndex];
      if (point[0] > coveredThrough) {
        break;
      }
      point[1] -= suppliedAmount;
    }
  }

  console.log(operationCount);
}

main(fs.readFileSync('/dev/stdin', 'utf8').split('\n'));
