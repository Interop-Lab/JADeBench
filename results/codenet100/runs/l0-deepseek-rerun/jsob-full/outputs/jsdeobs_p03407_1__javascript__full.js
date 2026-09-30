function Main(input) {
  const nums = input.split(' ').map(part => parseInt(part));
  console.log(nums[0] + nums[1] === nums[2] ? 'Yes' : 'No');
}

Main(require('fs').readFileSync('stdin', 'utf8').trim());
