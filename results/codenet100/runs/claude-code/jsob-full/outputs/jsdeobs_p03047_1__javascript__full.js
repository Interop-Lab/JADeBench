const fs = require('fs');

function main(input) {
  const fields = input.trim().split(' ');
  const first = fields[0];
  const second = fields[1];
  const result = first - second + 1;

  console.log(result);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
