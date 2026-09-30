const fs = require('fs');

function main(input) {
  const lines = input.split('\n');
  const [, minimumFirstValue, minimumSecondValue] = lines[0]
    .split(' ')
    .map(Number);
  let matchingRows = 0;

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex++) {
    const [firstValue, secondValue] = lines[lineIndex]
      .split(' ')
      .map(Number);

    if (
      firstValue >= minimumFirstValue &&
      secondValue >= minimumSecondValue
    ) {
      matchingRows++;
    }
  }

  console.log(matchingRows);
}

main(fs.readFileSync('/dev/stdin', 'utf8').trim());
