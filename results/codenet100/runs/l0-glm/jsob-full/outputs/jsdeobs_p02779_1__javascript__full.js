'use strict';
function Main(input) {
  input = input.trim().split('\n');
  const N = Number(input[0].trim());
  const A = input[1].trim().split(' ').map(Number);
  let result = 'YES';
  for (let i = 0; i < N; i++) {
    let x = A.slice(i + 1);
    let y = x.indexOf(A[i]);
    if (y !== -1) {
      result = 'NO';
      break;
    }
  }
  console.log(result);
}
Main(require('fs')['readFileSync']('/dev/stdin', 'utf8'));
