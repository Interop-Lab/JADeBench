function Main(input) {
  const nums = input.split('\n')[0].split(' ').map(x => parseInt(x, 10)).sort((a, b) => b - a);
  let counter = 0;
  if ((nums[1] - nums[2]) % 2 === 0) {
    counter += nums[0] - nums[1];
    nums[2] += counter;
    counter += (nums[0] - nums[2]) / 2;
  } else {
    nums[0]++;
    nums[1]++;
    counter++;
    counter += nums[0] - nums[1];
    nums[2] += nums[0] - nums[1];
    counter += (nums[0] - nums[2]) / 2;
  }
  console.log(counter);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
