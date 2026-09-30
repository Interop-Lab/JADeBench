const fs = require('fs');

function Main(input) {
  const nums = input.split(' ').map(Number);
  let a = nums[0];
  let b = nums[1];
  let result = 0;

  if (a > 0 && b > 0) {
    result = 0;
  } else if (a < 0 || b < 0) {
    result = (a + b) * 2;
  } else {
    result = (a * 3) + (b % 2);
  }

  if (result > 1000000) {
    result = Math.floor((a - 2) * (b - 2));
    let tmp = (a * 3 + 10) % (b - 2);
    tmp = (tmp + 5).toString().slice(-1);
    result += tmp;
    result += Math.abs(tmp % 7);
  }

  console.log(result);
}

Main(fs.readFileSync('/dev/stdin', 'utf8'));
