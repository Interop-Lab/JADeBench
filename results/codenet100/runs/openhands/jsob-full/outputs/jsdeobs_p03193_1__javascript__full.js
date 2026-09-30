const fs = require('fs');

function main(input) {
  const lines = input.split('\n');
  const thresholds = lines[0].split(' ').map(Number);
  let matchingRecordCount = 0;

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const record = lines[lineIndex].split(' ').map(Number);
    const meetsFirstThreshold = record[0] >= thresholds[1];
    const meetsSecondThreshold = record[1] >= thresholds[2];

    if (meetsFirstThreshold && meetsSecondThreshold) {
      matchingRecordCount += 1;
    }
  }

  console.log(matchingRecordCount);
}

const input = fs.readFileSync('/dev/stdin', 'utf8').trim();
main(input);
