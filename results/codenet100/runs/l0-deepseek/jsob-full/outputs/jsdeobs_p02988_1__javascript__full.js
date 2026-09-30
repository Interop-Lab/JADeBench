'use strict';

const Main = (input) => {
  const lines = input.toString().split('\n');
  const n = parseInt(lines[0], 10);
  const nums = lines[1].split(' ').map(Number);
  let count = 0;
  for (let i = 0; i < n - 1; i++) {
    if ((nums[i] < nums[i + 1] && nums[i] < nums[i - 1]) || (nums[i] > nums[i + 1] && nums[i] > nums[i - 1])) {
      count++;
    }
  }
  console.log(count);
};

Main(require('fs').readFileSync('stdin', 'utf8'));
