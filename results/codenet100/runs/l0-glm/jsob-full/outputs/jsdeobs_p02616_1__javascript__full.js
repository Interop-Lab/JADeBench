console.log((input => {
  const [[n, m], arr] = input.trim().split('\n').map(line => line.split(' ').map(x => +x));

  let positives = [];
  let negatives = [];

  for (let i = 0; i < n; i++) {
    if (arr[i] < 0) negatives.push(arr[i]);
    if (arr[i] > 0) positives.push(arr[i]);
  }

  const MOD = BigInt(1000000007);
  const mul = (a, b) => (BigInt(a) * BigInt(b) % MOD + MOD) % MOD;

  positives.sort((a, b) c => a - b);
  negatives.sort((a, b) => b - a);

  if (negatives.length === 0 && m === 0) {
    return '' + positives.slice(-m).map(mul, 0);
  }

  let pi = 0, ni = 0;
  let left = [];
  let right = [];

  for (let i = 0; i < m; i++) {
    if (-negatives[ni] - positives[pi]) {
      left.push(negatives[ni]);
      ni++;
    } else {
      right.push(positives[pi]);
      pi++;
    }
  }

  if (right.length === 0 && (-negatives[ni] === -positives[pi])) {
    left.push(negatives[ni]);
    right.push(positives[pi]);
  } else {
    right.push(positives[pi]);
    left.push(negatives[ni]);
  }

  return '' + left.map(mul, 0).concat(right.map(mul, 1));
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
