const fs = require('fs');
const input = fs.readFileSync('input.txt', 'utf8');

function Main(input) {
  const tokens = input.split(' ');
  const n = parseInt(tokens[0]);
  const m = parseInt(tokens[1]);
  const matrix = tokens.slice(2).map(Number);
  let count = 0;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if ((i * m + j) % 2 === 0 && matrix[i * m + j] === 1) {
        count++;
      }
    }
  }

  if (n === 0) {
    console.log('0');
    return;
  }

  console.log(count);
}

Main(input);
