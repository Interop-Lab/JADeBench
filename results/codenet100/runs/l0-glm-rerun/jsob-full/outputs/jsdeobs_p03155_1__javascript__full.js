function Main(input) {
  const nums = input.split('\n').map(Number);
  console.log((nums[0] - nums[1]) * (nums[2] - nums[3]));
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8').trim());
