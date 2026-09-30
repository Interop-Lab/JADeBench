const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');
const targetGroupLengths = [5, 7, 5, 7, 7];

while (true) {
  const lineCount = Number(lines.shift());
  if (lineCount === 0) break;

  const lineLengths = lines
    .splice(0, lineCount)
    .map((line) => line.length);

  for (let startIndex = 0; startIndex < lineLengths.length; startIndex += 1) {
    let targetIndex = 0;
    let currentLength = 0;

    for (let index = startIndex; index < lineLengths.length; index += 1) {
      currentLength += lineLengths[index];
      const targetLength = targetGroupLengths[targetIndex];

      if (currentLength < targetLength) continue;
      if (currentLength > targetLength) break;

      targetIndex += 1;
      currentLength = 0;

      if (targetIndex === targetGroupLengths.length) {
        console.log(startIndex + 1);
        break;
      }
    }
  }
}
