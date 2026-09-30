const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8');

function Main(input) {
  const tokens = input.split(' ');
  const first = parseInt(tokens[0], 10);
  const second = parseInt(tokens[1], 10);
  const numbers = tokens.slice(2).map((token, index) => parseInt(token, 10));
  const counts = [];
  for (let i = 0; i < numbers.length; i++) {
    const num = numbers[i];
    counts[num] = counts[num] ? counts[num] + 1 : 1;
  }
  let result = 1;
  for (let i = 0; i < numbers.length; i++) {
    if (counts[numbers[i]] >= second) {
      result *= numbers[i];
    }
  }
  let i = 0;
  while (i < first) {
    while (first % i === 0) {
      numbers.push(i);
      first = Math.floor(first / i);
    }
    i++;
  }
  console.log(result);
}

Main(input);
