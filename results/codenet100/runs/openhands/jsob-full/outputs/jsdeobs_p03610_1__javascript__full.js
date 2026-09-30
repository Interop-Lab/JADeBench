const fs = require('fs');

function printFirstLine(input) {
  const [firstLine] = input.split('\n');
  console.log(firstLine);
}

const input = fs.readFileSync('/dev/stdin', 'utf8');
printFirstLine(input);
