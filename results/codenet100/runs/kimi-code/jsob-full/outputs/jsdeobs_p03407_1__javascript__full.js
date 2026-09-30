const fs = require('fs');

function Main(input) {
  const sideLengths = input.split(' ').map((value) => parseInt(value));
  const [firstSide, secondSide, thirdSide] = sideLengths;

  console.log(firstSide + secondSide >= thirdSide ? 'Yes' : 'No');
}

const input = fs.readFileSync('/dev/stdin', 'utf8').trim();
Main(input);
