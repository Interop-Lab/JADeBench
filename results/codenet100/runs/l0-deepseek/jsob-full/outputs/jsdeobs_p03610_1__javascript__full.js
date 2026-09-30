function Main(input) {
  const lines = input.split('\n');
  let result = '';
  for (let i = lines.length - 1; i >= 0; i--) {
    result += lines[i];
  }
  console.log(result);
}

const fs = require('fs');
Main(fs.readFileSync('stdin', 'utf8'));
