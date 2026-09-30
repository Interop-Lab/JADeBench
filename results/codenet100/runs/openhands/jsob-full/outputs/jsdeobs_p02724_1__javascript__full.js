const fs = require('fs');

function main(input) {
  const value = Number(input);
  const thousands = Math.floor(value / 1000) * 1000;
  const roundedRemainder = Math.floor((value % 500) / 5) * 5;

  console.log(thousands + roundedRemainder);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
