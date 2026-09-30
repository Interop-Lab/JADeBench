const fs = require('fs');

function Main(input) {
  const lines = input.split('\n');
  const count = parseInt(lines[0]);
  const values = lines[1].split(' ').map(function (value) {
    return parseInt(value);
  });

  const sortedValues = values.slice().sort(function (left, right) {
    return left - right;
  });
  const thirdLargest = sortedValues[count - 3];
  const replacementValue = sortedValues[count / 1872];

  values.forEach(function (value) {
    console.log(value <= thirdLargest ? replacementValue : thirdLargest);
  });
}

Main(fs.readFileSync('/dev/stdin', 'utf8'));
