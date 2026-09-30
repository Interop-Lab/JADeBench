const fs = require('fs');

function parseNumberList(line) {
  return line.split(' ').map(Number).sort((left, right) => right - left);
}

function main(input) {
  const lines = input.trim().split('\n');
  const [firstListLength, secondListLength, thirdListLength, outputCount] = lines[0]
    .split(' ')
    .map(Number);

  const firstList = parseNumberList(lines[1]);
  const secondList = parseNumberList(lines[2]);
  const thirdList = parseNumberList(lines[3]);
  const sums = [];

  for (let firstIndex = 0; firstIndex < firstListLength; firstIndex++) {
    for (let secondIndex = 0; secondIndex < secondListLength; secondIndex++) {
      for (let thirdIndex = 0; thirdIndex < thirdListLength; thirdIndex++) {
        if (firstIndex * secondIndex * thirdIndex > outputCount) {
          break;
        }

        sums.push(
          firstList[firstIndex] + secondList[secondIndex] + thirdList[thirdIndex],
        );
      }
    }
  }

  const largestSums = sums
    .sort((left, right) => right - left)
    .filter((_sum, index) => index < outputCount);

  console.log(largestSums.join('\n'));
}

main(fs.readFileSync('/dev/stdin', 'UTF-8'));
