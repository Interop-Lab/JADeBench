function Main(input) {
  const lines = input.split('\n');
  const nums = lines[1].split(' ').map(x => parseInt(x, 10)).sort((a, b) => b - a);
  let result = 0;
  if ((nums[0] - nums[1]) % 2 === 0) {
    result += nums[0] - nums[1];
    nums[2] += result;
    result += (nums[0] - nums[1]) / 2;
  } else {
    result += nums[0] - nums[1];
    nums[2]++;
    result++;
    result += (nums[0] - nums[1]) / 2;
    nums[1]++;
    nums[0]++;
  }
  console.log(result);
}

Main(require('fs').readFileSync('input.txt', 'utf8'));
