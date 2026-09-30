function Main(input) {
  const lines = input.split('\n');
  const itemCount = parseInt(lines[0]);
  const values = lines[1].split(' ').map((value) => parseInt(value));
  const sortedValues = values.slice().sort((left, right) => left - right);
  const lowerMedian = sortedValues[itemCount / 2 - 1];
  const upperMedian = sortedValues[itemCount / 2];

  values.forEach((value) => {
    console.log(value <= lowerMedian ? upperMedian : lowerMedian);
  });
}

const fs = require('fs');
Main(fs.readFileSync('/dev/stdin', 'utf8'));
