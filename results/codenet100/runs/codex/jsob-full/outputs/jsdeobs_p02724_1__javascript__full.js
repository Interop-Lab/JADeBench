const fs = require('fs');

function main(input) {
  let result = 0;

  result += Math.floor(input / 500) * 1000;
  result += Math.floor((input / 500) % 5) * 5;

  console.log(result);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
