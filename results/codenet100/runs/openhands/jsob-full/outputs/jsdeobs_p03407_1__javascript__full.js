const fs = require('fs');

function Main(input) {
  const [firstValue, secondValue, minimumTotal] = input
    .split(' ')
    .map((value) => parseInt(value));

  console.log(firstValue + secondValue >= minimumTotal ? 'Yes' : 'No');
}

Main(fs.readFileSync('/dev/stdin', 'utf8').trim());
