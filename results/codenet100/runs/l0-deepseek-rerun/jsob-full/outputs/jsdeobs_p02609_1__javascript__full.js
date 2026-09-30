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
  const countDivisibleByThree = x => {
    if (x === 0) return -1;
    let count = 0;
    while (x % 3 === 0) {
      count++;
      x /= 3;
    }
    return count;
  };
  const base = parseInt(s, 2);
  const result1 = countOnes(base) - 1;
  const result2 = countOnes(base) + 1;
  for (let i = 0; i < n; i++) {
    const val = base ^ (1 << (n - i - 1));
    if (val === 0) {
      console.log(0);
    } else {
      console.log(countDivisibleByThree(val) + (s[i] === '1' ? result1 : result2));
    }
  }
})(input);
