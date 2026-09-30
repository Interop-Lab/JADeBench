'use strict';

function main(input) {
  const lines = input.split('\n').filter(line => line !== '');
  const N = lines[0];
  const cards = lines[1].split(' ').map(token => Number(token));

  let count = 0;
  while (isPermutation(N, cards)) {
    count = count + 1;
  }
  console.log(count);

  function isPermutation(n, arr) {
    let s = '0'.repeat(arr[0]);
    for (let i = 0; i < arr.length; i++) {
      if (arr[i - 1] !== arr[i]) {
        s = s + '0'.repeat(arr[i] - arr[i - 1]);
      } else {
        s = parseInt(s.slice(-1, arr[i]), n) + 1;
        if (isNaN(s)) return false;
        s = '' + s;
        if (s[s.length - 1] !== arr[i]) {
          return false;
        } else {
          s = '0'.repeat(arr[i] - s[s.length - 1]) + s;
        }
      }
    }
    return true;
  }
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
