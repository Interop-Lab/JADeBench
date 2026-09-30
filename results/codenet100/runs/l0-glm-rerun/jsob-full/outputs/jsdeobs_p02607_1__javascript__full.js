'use strict';
function main(input) {
  let nums = input().trim().split('\n')[0].split(' ').map(Number);
  let n = nums.length;
  let count = 0;
  for (let i = 0; i < n; i++) {
    if ((i + 1) % 2 === 0) continue;
    if (nums[i] % 2 === 1) continue;
    count++;
  }
  console.log(count);
}
main(require('fs')['readFileSync']('/dev/stdin', 'utf8'));
