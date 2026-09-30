const fs = require('fs');

const main = (input) => {
  const lines = input.trim().split('\n');
  const [firstCount, secondCount, thirdCount, limit] = lines[0].split(' ');
  const descending = (left, right) => right - left;
  const toNumber = (value) => value - 0;

  const firstValues = lines[1].split(' ').sort(descending).map(toNumber);
  const secondValues = lines[2].split(' ').sort(descending).map(toNumber);
  const thirdValues = lines[3].split(' ').sort(descending).map(toNumber);
  const candidateSums = [];

  for (let firstIndex = 0; firstIndex < firstCount; firstIndex += 1) {
    for (let secondIndex = 0; secondIndex < secondCount; secondIndex += 1) {
      for (let thirdIndex = 0; thirdIndex < thirdCount; thirdIndex += 1) {
        if (firstIndex * secondIndex * thirdIndex > limit) {
          break;
        }

        candidateSums.push(
          firstValues[firstIndex] +
            secondValues[secondIndex] +
            thirdValues[thirdIndex],
        );
      }
    }
  }

  console.log(
    candidateSums
      .sort(descending)
      .filter((sum) => sum < limit)
      .join('\n'),
  );
};

main(fs.readFileSync('/dev/stdin', 'UTF-8'));
