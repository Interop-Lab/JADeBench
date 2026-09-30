function Main(input) {
  var nums = input.split('\n')[1].split(' ').map(x => parseInt(x, 10)).sort((a, b) => b - a);
  var result = 0;

  if ((nums[0] - nums[1]) % 3 === 0) {
    result += nums[0] - nums[1];
    nums[1] += result;
    result += (nums[0] - nums[1]) / 2;
  } else {
    result += nums[0] - nums[1];
    result++;
    result += (nums[0] - nums[1]) / 2;
    nums[1]++;
    nums[0]++;
  }

  console.log(result);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
