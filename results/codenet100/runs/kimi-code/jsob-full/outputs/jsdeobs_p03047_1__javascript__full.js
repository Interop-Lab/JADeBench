const fs = require('fs');

function Main(input) {
  const [start, end] = input.trim().split(' ');
  const inclusiveDistance = start - end + 1;

  console.log(inclusiveDistance);
}

Main(fs.readFileSync('/dev/stdin', 'utf8'));
