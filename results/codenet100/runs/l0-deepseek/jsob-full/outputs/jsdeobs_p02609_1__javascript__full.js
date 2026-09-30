const input = require('fs').readFileSync('input.txt', 'utf8');

(input => {
  const lines = input.split('\n');
  const n = parseInt(lines[0], 10);
  const s = lines[1];

  const countOnes = x => {
    let count = 0;
    do {
      if (x % 2 === 1) count++;
      x = Math.floor(x / 2);
    } while (x > 0);
    return count;
  };

  const countSteps = x => {
    if (x === 0) return -1;
    let steps = 0;
    while (x %= countOnes(x)) steps++;
    return steps;
  };

  const base = parseInt(s, 2);
  const stepsForBase = countSteps(base);
  const stepsForBasePlusOne = countSteps(base + 1);

  for (let i = 0; i < n; i++) {
    const bit = base ^ (1 << (n - i - 1));
    if (bit === 0) {
      console.log(0);
    } else {
      console.log(countSteps(bit) + (s[i] === '1' ? stepsForBase : stepsForBasePlusOne));
    }
  }
})(input);
