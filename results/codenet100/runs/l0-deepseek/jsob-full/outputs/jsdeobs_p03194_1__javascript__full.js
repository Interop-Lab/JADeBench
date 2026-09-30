const fs = require('fs');
function Main(input) {
  const tokens = input.split(' ');
  const a = parseInt(tokens[0], 10);
  const b = parseInt(tokens[1], 10);
  const nums = [];
  for (let i = 2; i < tokens.length; i++) {
    const key = tokens[i];
    nums[key] = nums[key] ? nums[key] + 1 : 1;
  }
  const keys = Object.keys(nums).map(Number);
  keys.sort(function (x, y) {
    return nums[y] - nums[x];
  });
  let result = 1;
  for (let i = 0; i < keys.length; i++) {
    if (nums[keys[i]] >= b) {
      result *= keys[i];
    }
  }
  let i = 2;
  while (i <= a) {
    while (a % i === 0) {
      nums.push(i);
      a = Math.floor(a / i);
    }
    i++;
  }
  console.log(result);
}
Main(fs.readFileSync('/dev/stdin', 'utf8'));
