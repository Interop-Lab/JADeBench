function Main(input) {
  var nums = input.split(' ').map(s => parseInt(s));
  console.log(nums[0] + nums[1] >= nums[2] ? 'Yes' : 'No');
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8').trim());
