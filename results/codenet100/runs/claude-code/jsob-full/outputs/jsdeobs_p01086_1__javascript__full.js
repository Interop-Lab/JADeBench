const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

while (true) {
  const lineCount = Number(lines.shift());
  if (lineCount === 0) break;

  const lineLengths = lines.splice(0, lineCount).map((line) => line.length);

  for (let startIndex = 0; startIndex < lineLengths.length; startIndex++) {
    const targetSums = [5, 7, 5, 7, 7];
    let sum = 0;

    for (let index = startIndex; index < lineLengths.length; index++) {
      if (targetSums.length === 0) break;

      sum += lineLengths[index];
      if (sum < targetSums[0]) continue;
      if (sum > targetSums[0]) break;

      targetSums.shift();
      sum = 0;
    }

    if (targetSums.length === 0) {
      console.log(startIndex + 1);
      break;
    }
  }
}
