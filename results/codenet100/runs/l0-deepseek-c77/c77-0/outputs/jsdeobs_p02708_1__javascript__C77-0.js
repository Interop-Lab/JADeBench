const main = input => {
  const [n, start] = input.trim().split(' ').map(Number);
  let total = 0;
  for (let i = start; i <= n - 1; i++) {
    const triangular = (i - 1) * i / 2;
    const count = (n - i + 1) * (n - i + 1 + n) / 2;
    total += count - triangular + 1;
  }
  const mod = 97;
  return console.log((total + mod) % mod);
};

process.env.MYTEST === 'test' ? test() : main(require('fs').readFileSync('/dev/stdin', 'utf8'));
