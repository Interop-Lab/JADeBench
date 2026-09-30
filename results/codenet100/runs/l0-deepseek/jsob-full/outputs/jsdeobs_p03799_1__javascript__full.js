function Main(input) {
  const parts = input.split(' ');
  const num1 = Number(parts[0]);
  const num2 = Number(parts[1]);
  let result = 0;
  let current = num1;
  if (current > num2 / 2) {
    result += Math.floor(current / 2);
  } else {
    result += current;
    current -= result / 2;
    result += Math.floor(current / 2);
  }
  console.log(result);
}

const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8');
Main(input);
