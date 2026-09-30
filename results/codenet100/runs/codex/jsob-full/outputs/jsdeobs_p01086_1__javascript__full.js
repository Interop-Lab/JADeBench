const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');
const targetSums = [5, 7, 5, 7, 7];

while (true) {
  const lineCount = lines.shift() - 0;
  if (lineCount === 0) {
    break;
  }

  const lineLengths = lines
    .splice(0, lineCount)
    .map((line) => line.length);

  for (let startIndex = 0; startIndex < lineLengths.length; startIndex++) {
    const remainingSums = targetSums.slice();
    let currentSum = 0;

    for (let lineIndex = startIndex; lineIndex < lineLengths.length; lineIndex++) {
      if (remainingSums.length === 0) {
        break;
      }

      currentSum += lineLengths[lineIndex];

      if (currentSum < remainingSums[0]) {
        continue;
      }

      if (currentSum > remainingSums[0]) {
        break;
      }

      remainingSums.shift();
      currentSum = 0;

      if (remainingSums.length === 0) {
        console.log(startIndex + 1);
        break;
      }
    }
  }
}
