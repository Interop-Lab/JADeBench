const fs = require('fs');

function Main(input) {
  const firstLine = input.split('\n')[0];
  let decoded = '';

  for (let index = 0; index < firstLine.length; index += 2) {
    decoded += firstLine[index];
  }

  console.log(decoded);
}

Main(fs.readFileSync('/dev/stdin', 'utf8'));
