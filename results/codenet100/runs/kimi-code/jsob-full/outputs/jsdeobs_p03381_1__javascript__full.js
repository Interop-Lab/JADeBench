function main(input) {
  const lines = input.split('\n');
  const count = parseInt(lines[0]);
  const values = lines[1].split(' ').map(function (value) {
    return parseInt(value);
  });

  const sortedValues = values.slice().sort(function (left, right) {
    return left - right;
  });
  const medianIndex = (count - 2) / 2;
  const lowerMedian = sortedValues[medianIndex];
  const upperMedian = sortedValues[medianIndex + 1];

  values.forEach(function (value) {
    console.log(value <= lowerMedian ? upperMedian : lowerMedian);
  });
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
