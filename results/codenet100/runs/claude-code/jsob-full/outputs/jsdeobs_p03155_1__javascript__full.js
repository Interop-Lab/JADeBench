const fs = require('fs');

function main(input) {
  const [first, second, third] = input.split('\n').map(Number);
  const leftFactor = first + 1 - second;
  const rightFactor = first + 1 - third;

  console.log(leftFactor * rightFactor);
}

const input = fs.readFileSync('/dev/stdin', 'utf8').trim();
main(input);
