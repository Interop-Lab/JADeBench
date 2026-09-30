const input = require('fs').readFileSync('/dev/stdin', 'utf8');
(input => {
  const lines = input.split('\n');
  const N = parseInt(lines[0], 10);
  const S = lines[1];
  const countOnes = n => {
    let count = 0;
    do {
      if (n & 1) count++;
    } while (n = n >>> 1);
    return count;
  };
  const countZeros = n => {
    if (n === 0) return 1;
    let count = 0;
    while (n %= countOnes(n)) count++;
    return count;
  };
  const ones = parseInt(S, 2);
  const onesCount = countOnes(ones);
  const zerosCount = countZeros(ones);
  for (let i = 0; i < N; i++) {
    let x = ones ^ Math.pow(2, N - 1 - i);
    if (x < 0) {
      console.log(-1);
    } else {
      console.log(countZeros(x ^ (S[i] === '1' ? zerosCount : onesCount)));
    }
  }
})(input);
