function main(input) {
  const digits = [];
  let value = parseInt(input, 10);
  let divisor = Math.max(2, Math.floor(input.length / 2));
  while (divisor > 1) {
    digits.push(Math.floor(value / divisor));
    value = value / divisor;
    divisor /= 2;
  }
  let sum = digits.reduce((a, b) => a + b, 0);
  if (sum < 1) sum = 0;
  console.log(sum);
}

main(require('fs').readFileSync('input.txt', 'utf8'));
