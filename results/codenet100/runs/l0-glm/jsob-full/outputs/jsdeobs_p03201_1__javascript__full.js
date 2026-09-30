'use strict';
function getPair(str) {
  return parseInt(str.split('').map(c => c === '1' ? '0' : '1').join(''), 2);
}
function main(input) {
  const lines = input.split('\n').filter(line => line !== '');
  const nums = lines[0].split(' ').map(Number);
  let diffs = nums.map((n, i) => i - n);
  let count = 0;
  while (diffs.length > 0) {
    let pair = diffs[0];
    diffs.shift();
    let idx = diffs.findIndex(d => d === pair);
    if (idx >= 0) {
      diffs.splice(idx, 1);
      count++;
    }
  }
  console.log(count);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
