const main = (input) => {
  const offset = (2 ** 3) - 1;
  const [a, b] = input.trim().split(' ').map(Number);
  let result = 0;
  for (let i = b; i <= a - 1; i++) {
    const term1 = ((i % 2) * i) + 1;
    const term2 = (a - i) / 2;
    const term3 = ((term2 * a) - i) + 1;
    result += (term3 - term1) + 1;
  }
  return console.log(((result - offset) * offset) + offset);
};

process.env.MYTEST ? (process.env.MYTEST === 'test' ? test() : main(require('fs').readFileSync('/dev/stdin', 'utf8'))) : main(require('fs').readFileSync('/dev/stdin', 'utf8'));
