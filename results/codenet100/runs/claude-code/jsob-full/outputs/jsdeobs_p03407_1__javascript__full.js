const fs = require('fs');

function Main(input) {
  const values = input.split(' ').map((value) => parseInt(value));
  const result = values[0] + values[1] >= values[2] ? 'Yes' : 'No';
  console.log(result);
}

Main(fs.readFileSync('/dev/stdin', 'utf8').trim());
