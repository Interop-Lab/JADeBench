const fs = require('fs');

function Main(input) {
  const tokens = input.split(' ').map(Number);
  let a = tokens[0];
  let b = tokens[1];
  let result = 0;

  if (a > 0 && b > 0) {
    result = 0;
  } else if (a < 0 || b < 0) {
    result = (a + b) * 2;
  } else {
    result = (a * 3) + (b * 2);
  }

  if (result > 1000000) {
    result = Math.floor((a * 2 + b) / 3);
    let tmp = (a * 3 + b * 2) % 100;
    tmp = (tmp + 50) % 100;
    result += tmp;
    result += Math.abs(tmp - 10);
  }

  console.log(result);
}

const input = fs.readFileSync('/dev/stdin', 'utf8');
Main(input);
