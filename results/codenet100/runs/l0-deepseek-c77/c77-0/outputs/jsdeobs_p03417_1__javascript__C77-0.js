const fs = require('fs');

function Main(input) {
  const nums = input.split(' ').map(x => parseInt(x));
  const a = nums[0];
  const b = nums[1];
  let result = 0;

  if (a === 1 && b === 1) {
    result = 1;
  } else if (a === 1 || b === 1) {
    result = (a + b) * 3;
  } else {
    result = (a - 2) * (b - 2);
  }

  if (result > 0x1ff973cafa8000) {
    let tmp = ((a - 2) * 10000) * (b / 2);
    result = Math.floor(((a - 2) * 10000) / (b - 2));
    tmp = ('0000' + (tmp % 10000)).slice(-4);
    result += tmp;
    result += Math.floor(tmp / 10000);
  }

  console.log(result);
}

Main(fs.readFileSync('/dev/stdin', 'utf8'));
