const fs = require('fs');

const lines = fs.readFileSync(0, 'utf8').trim().split('\n');

while (true) {
  const laneCount = lines.shift() - 0;
  if (laneCount === 0) break;

  const laneValues = Array(laneCount).fill(0);
  let pendingValue = 0;
  const operations = lines.shift();

  for (let index = 0; index < operations.length; index++) {
    const lane = index % laneCount;

    switch (operations[index]) {
      case 'M':
        laneValues[lane]++;
        break;
      case 'L':
        laneValues[lane] += pendingValue + 1;
        pendingValue = 0;
        break;
      case 'S':
        pendingValue += laneValues[lane] + 1;
        laneValues[lane] = 0;
        break;
    }
  }

  laneValues.sort((left, right) => left - right);
  console.log(`${laneValues.join(' ')} ${pendingValue}`);
}
