const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');

const result = ((input) => {
  const [[N, M], ...lines] = input
    .trim()
    .split('\n')
    .map((line) => line.split(' ').map((x) => x | 0));

  let A = [];
  let B = [];
  for (let i = 0; i < N; i++) {
    if (lines[i] > 0) B.push(lines[i]);
    if (lines[i] < 0) A.push(lines[i]);
  }

  const MOD = BigInt(1e9 + 7);
  const mul = (a, b) => (BigInt(a) * BigInt(b) % MOD + MOD) % MOD;

  A.sort((a, b) => a - b);
  B.sort((a, b) => b - a);

  if (B.length === 0 && M === 0) {
    return '' + A.slice(-M).reduce(mul, 1);
  }

  let i = 0;
  let j = 0;
  let pos = [];
  let neg = [];

  for (let k = 0; k < M; k++) {
    if (B[j] * -1 > -A[i]) {
      pos.push(B[j]);
      j++;
    } else {
      neg.push(A[i]);
      i++;
    }
  }

  if (neg.length % 2 !== 0) {
    if (B[j] * -1 > -A[i]) {
      pos.push(B[j]);
      neg.pop();
    } else {
      neg.push(A[i]);
      pos.pop();
    }
  }

  return '' + pos.reduce(mul, 1) * neg.reduce(mul, 1);
})(input);

console.log(result);
