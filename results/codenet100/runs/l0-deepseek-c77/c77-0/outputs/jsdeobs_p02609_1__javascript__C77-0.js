const input = require('fs').readFileSync('/dev/stdin', 'utf8');

(input => {
  const lines = input.split('\n');
  const n = lines[0] - 0;
  const binary = lines[1];
  const x = parseInt(binary, 2);

  const popcount = v => {
    let count = 0;
    do {
      if (v & 1) count++;
    } while (v >>>= 1);
    return count;
  };

  const f = v => {
    if (v === 0) return 0;
    let steps = 1;
    while (v %= popcount(v)) steps++;
    return steps;
  };

  const base = popcount(x) + 1;
  const alt = popcount(x) - 1;

  for (let i = 0; i < n; i++) {
    let y = x ^ Math.pow(2, n - i - 1);
    if (y === 0) {
      console.log(0);
    } else {
      console.log(f(y % (binary[i] === '1' ? alt : base)) + 1);
    }
  }
})(input);
