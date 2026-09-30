const fs = require('fs');

function main(input) {
  const nums = input.split(' ').map(part => parseInt(part));
  const a = nums[0];
  const b = nums[1];
  const c = nums[2];
  const sum1 = b + a;
  const sum2 = c + a;
  let values;
  if (b < c) {
    values = [b, sum1, c, sum2];
  } else {
    values = [c, sum2, b, sum1];
  }
  if (values[2] < values[1]) {
    console.log(values[0] + values[3]);
  } else {
    console.log(0);
  }
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
