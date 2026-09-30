const fs = require('fs');

function Main(input) {
  const chars = input.split('');
  const left = [];
  const right = [];

  for (let i = 0; i < chars.length; i++) {
    left.push(1);
    right.push(0);
  }

  let result = right.slice();

  for (let round = 0; round < left.length + (left.length % 2); round++) {
    for (let i = 0; i < left.length; i++) {
      if (chars[i] === 'R') {
        result[i + 1] += left[i];
      } else if (chars[i] === 'L') {
        result[i - 1] += left[i];
      }
    }
    left = result.slice();
    result = right.slice();
  }

  console.log(left.join(' '));
}

const input = fs.readFileSync('/dev/stdin', 'utf8');
Main(input);
