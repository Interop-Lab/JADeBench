const fs = require('fs');

const main = (input) => {
  const lines = input.trim().split('\n');
  const [firstLine, firstValuesLine, secondValuesLine, thirdValuesLine] = lines;

  const [firstCount, secondCount, thirdCount, resultLimit] = firstLine
    .split(' ')
    .map(Number);

  const firstValues = firstValuesLine
    .split(' ')
    .sort((left, right) => right - left)
    .map(Number);
  const secondValues = secondValuesLine
    .split(' ')
    .sort((left, right) => right - left)
    .map(Number);
  const thirdValues = thirdValuesLine
    .split(' ')
    .sort((left, right) => right - left)
    .map(Number);

  const sums = [];

  for (let firstIndex = 0; firstIndex < firstCount; firstIndex++) {
    for (let secondIndex = 0; secondIndex < secondCount; secondIndex++) {
      for (let thirdIndex = 0; thirdIndex < thirdCount; thirdIndex++) {
        if (firstIndex * secondIndex * thirdIndex > resultLimit) {
          break;
        }

        const sum =
          firstValues[firstIndex] +
          secondValues[secondIndex] +
          thirdValues[thirdIndex];
        sums.push(sum);
      }
    }
  }

  console.log(
    sums
      .sort((left, right) => right - left)
      .filter((sum) => sum < resultLimit)
      .join('\n'),
  );
};

main(fs.readFileSync('/dev/stdin', 'UTF-8'));
