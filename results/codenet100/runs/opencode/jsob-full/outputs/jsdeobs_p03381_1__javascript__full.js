const fs = require('fs');

function Main(input) {
  const lines = input.split('\n');
  const count = parseInt(lines[0]);
  const values = lines[1].split(' ').map((value) => parseInt(value));

  const sortedValues = values.slice().sort((left, right) => left - right);
  const lowerMedian = sortedValues[count / 2 - 1];
  const upperMedian = sortedValues[count / 2];

  values.forEach((value) => {
    console.log(value <= lowerMedian ? upperMedian : lowerMedian);
  });
}

Main(fs.readFileSync('/dev/stdin', 'utf8'));
