const fs = require('fs');

function main(input) {
  const firstLine = input.split('\n')[0];
  let result = '';

  for (let index = 1; index <= firstLine.length; index += 2) {
    result += firstLine[index - 1];
  }

  console.log(result);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
