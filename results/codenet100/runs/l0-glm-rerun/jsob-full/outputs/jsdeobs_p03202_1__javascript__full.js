'use strict';
function main(input) {
  const lines = input.split('\n').filter(line => line !== '');
  const N = parseInt(lines[0]);
  const S = lines[1].split(' ').map(x => Number(x));

  let result = 0;
  while (check(result, S) === false) {
    result = result + 1;
  }
  console.log(result);

  function check(num, arr) {
    let str = '0'.repeat(arr[0]);
    for (let i = 0; i < arr.length; i++) {
      if (i > 0) {
        if (arr[i - 1] === arr[i]) {
          str = str + '0'.repeat(arr[i] - str.length);
        } else {
          str = parseInt(str.slice(0, arr[i]), num);
          if (isNaN(str)) return false;
          str = '' + str;
          if (str.length !== arr[i]) {
            return false;
          } else {
            str = '0'.repeat(arr[i] - str.length) + str;
          }
        }
      }
    }
    return true;
  }
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
