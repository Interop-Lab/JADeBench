const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8').trim();

function Main(input) {
  const nums = input.split('\n').map(Number);
  console.log((nums[0] * -1 + nums[1]) * (nums[2] * -1 + nums[3]));
}

Main(input);
