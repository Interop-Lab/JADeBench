'use strict';

function getPair(num) {
  const binary = num.toString(2).split('').map(bit => bit === '1' ? '0' : '1').join('');
  return parseInt(binary, 2) + 1;
}

function main(input) {
  const lines = input.split('\n').filter(line => line !== '');
  const nums = lines[1].split(' ').map(Number);
  let arr = nums.sort((a, b) => b - a);
  let count = 0;

  while (arr.length > 0) {
    const current = arr[0];
    arr.splice(0, 1);
    const pair = getPair(current);
    const idx = arr.findIndex(x => x === pair);
    if (idx >= 0) {
      arr.splice(idx, 1);
      count++;
    }
  }

  console.log(count);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
