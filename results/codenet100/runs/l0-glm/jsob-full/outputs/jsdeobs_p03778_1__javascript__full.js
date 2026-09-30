'use strict';
const main = input => {
  input = input.split(' ').map(x => parseInt(x));
  const a = input[0];
  const b = input[1];
  const c = input[2];
  const d = b + a;
  const e = c + a;
  let arr = [];
  if (b <= c) {
    arr = [b, d, c, e];
  } else {
    arr = [c, e, b, d];
  }
  if (arr[0] < arr[3]) {
    console.log(arr[0] + arr[1]);
  } else {
    console.log(-1);
  }
};
main(require('fs')['readFileSync']('/dev/stdin', 'utf8'));
