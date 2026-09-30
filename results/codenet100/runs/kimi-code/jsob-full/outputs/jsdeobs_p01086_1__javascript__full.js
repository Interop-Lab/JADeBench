const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

while (true) {
  const lineCount = Number(lines.shift());
  if (lineCount === 0) break;

  const lineLengths = lines.splice(0, lineCount).map((line) => line.length);

  for (let startIndex = 0; startIndex < lineLengths.length; startIndex++) {
    const targetLengths = [5, 7, 5, 7, 7];
    let currentLength = 0;

    for (let index = startIndex; index < lineLengths.length; index++) {
      if (targetLengths.length === 0) break;

      currentLength += lineLengths[index];
      if (currentLength < targetLengths[0]) continue;
      if (currentLength > targetLengths[0]) break;

      targetLengths.shift();
      currentLength = 0;

      if (targetLengths.length === 0) {
        console.log(startIndex + 1);
        break;
      }
    }
  }
}
