const input = require('fs').readFileSync('/dev/stdin', 'utf8');

(input => {
  const lines = input.split('\n');
  const N = parseInt(lines[0], 10);
  const S = lines[1];

  const countTrailingZeros = n => {
    let count = 0;
    do {
      if (n % 10 === 0) count++;
    } while (n = Math.floor(n / 10));
    return count;
  };

  const countFactors = n => {
    if (n === 0) return 0;
    let count = 0;
    while (n % countTrailingZeros(n) === 0) count++;
    return count;
  };

  const X = parseInt(S, 10);
  const a = countTrailingZeros(X);
  const b = countTrailingZeros(X) + 1;

  for (let i = 0; i < N; i++) {
    let v = X + Math.pow(2, N - 1 - i);
    if (v === 0) {
      console.log(0);
    } else {
      console.log(countFactors(v + (S[i] === '1' ? a : b)) + 1);
    }
  }
})(input);
