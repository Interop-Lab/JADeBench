'use strict';

function main(input) {
  const lines = input.split('\n').filter(line => line !== '');
  const _e3788a = lines[0];
  const nums = lines[1].split(' ').map(Number);

  let counter = 1;

  function check(base, arr) {
    let value = '0'.repeat(arr[0]);

    for (let i = 1; i < arr.length; i++) {
      if (arr[i - 1] < arr[i]) {
        value += '0'.repeat(arr[i] - arr[i - 1]);
      } else {
        value = (parseInt(value.substring(0, arr[i]), base) + 1).toString();
        if (isNaN(value)) {
          return false;
        }
        value = '' + value;
        if (value.length > arr[i]) {
          return false;
        } else {
          value = '0'.repeat(arr[i] - value.length) + value;
        }
      }
    }

    return true;
  }

  while (!check(counter, nums)) {
    counter = counter + 1;
  }

  console.log(counter);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
