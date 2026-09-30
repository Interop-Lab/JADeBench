const fs = require('fs');

function main(input) {
  const [upperBound, lowerBound] = input.trim().split(' ');
  const inclusiveRangeSize = upperBound - lowerBound + 1;

  console.log(inclusiveRangeSize);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
