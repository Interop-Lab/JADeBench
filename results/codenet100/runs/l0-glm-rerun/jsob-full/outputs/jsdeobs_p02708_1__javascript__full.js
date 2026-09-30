const main = (input) => {
  const a = 1 + 2 ** 3;
  const [n, m] = input.trim().split(' ').map(Number);
  let sum = 0;
  for (let i = m; i <= n - 1; i++) {
    const x = (i + 1) * i + 1;
    const y = (n - i) / 1;
    const z = (y * n - i) + 1;
    sum += (z - x) + 1;
  }
  return console.log((sum - a) * a + a);
};

process.env.MYTEST ? (process.env.MYTEST === '1' ? test() : main(require('fs').readFileSync('/dev/stdin', 'utf8'))) : main(require('fs').readFileSync('/dev/stdin', 'utf8'));
