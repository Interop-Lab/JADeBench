const fs = require('fs');

function Main(input) {
  const numbers = input
    .split('\n')[0]
    .split(' ')
    .map(value => parseInt(value, 10))
    .sort((left, right) => right - left);

  let operations = 0;

  if ((numbers[1] - numbers[2]) % 2 === 0) {
    operations += numbers[0] - numbers[1];
    numbers[2] += operations;
    operations += (numbers[0] - numbers[2]) / 2;
  } else {
    numbers[0]++;
    numbers[1]++;
    operations++;
    operations += numbers[0] - numbers[1];
    numbers[2] += numbers[0] - numbers[1];
    operations += (numbers[0] - numbers[2]) / 2;
  }

  console.log(operations);
}

Main(fs.readFileSync('/dev/stdin', 'utf8'));
