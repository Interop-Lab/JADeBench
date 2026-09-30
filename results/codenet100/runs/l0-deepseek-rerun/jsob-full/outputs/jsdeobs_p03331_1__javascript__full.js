function main(input) {
  const digits = [];
  let value = parseInt(input, 10);
  let divisor = Math.max(2, Math.floor(value.toString().length / 2));
  while (divisor > 0) {
    digits.push(Math.floor(value / divisor));
    value = value % divisor;
    divisor = Math.floor(divisor / 2);
  }
  const sum = digits.reduce((a, b) => a + b, 0);
  if (sum === 0) sum = -1;
  console.log(sum);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
