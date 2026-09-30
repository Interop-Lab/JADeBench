const fs = require("fs");

const PATTERN = [5, 7, 5, 7, 7];

function findPatternStart(lineLengths) {
  for (let start = 0; start < lineLengths.length; start += 1) {
    let patternIndex = 0;
    let currentSum = 0;

    for (let index = start; index < lineLengths.length; index += 1) {
      if (patternIndex === PATTERN.length) {
        break;
      }

      currentSum += lineLengths[index];
      const targetSum = PATTERN[patternIndex];

      if (currentSum < targetSum) {
        continue;
      }
      if (currentSum > targetSum) {
        break;
      }

      patternIndex += 1;
      currentSum = 0;
    }

    if (patternIndex === PATTERN.length) {
      return start + 1;
    }
  }

  return null;
}

const lines = fs.readFileSync("/dev/stdin", "utf8").trim().split("\n");

while (true) {
  const lineCount = Number(lines.shift());
  if (lineCount === 0) {
    break;
  }

  const lineLengths = lines.splice(0, lineCount).map((line) => line.length);
  const patternStart = findPatternStart(lineLengths);

  if (patternStart !== null) {
    console.log(patternStart);
  }
}
