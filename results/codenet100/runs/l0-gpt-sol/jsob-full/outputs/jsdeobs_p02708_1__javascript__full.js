const main = input => {
  const MOD = 10 ** 9 + 7;
  const [n, k] = input.trim().split(' ').map(Number);

  let result = 0;

  for (let i = k; i <= n - 1; i++) {
    const triangular = i * (i + 1) / 2;
    const remaining = n - i + 1;
    const base = (remaining * n - i) / 2;

    result += base ** triangular - 1;
  }

  return console.log(((result % MOD) + MOD) % MOD);
};

process.env.MYTEST
  ? process.env.MYTEST === 'true'
    ? test()
    : main(require('fs').readFileSync('./test.in', 'utf8'))
  : main(require('fs').readFileSync('/dev/stdin', 'utf8'));
