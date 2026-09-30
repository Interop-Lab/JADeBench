function main(input) {
  const inputStr = input.toString();
  const length = inputStr.length;
  let value = parseInt(inputStr, 10);
  let divisor = Math.pow(10, length - 1);
  const digits = [];
  for (let i = 0; i < length; i++) {
    digits.push(Math.floor(value / divisor));
    value = value % divisor;
    divisor /= 10;
  }
  let sum = digits.reduce((acc, digit) => acc + digit);
  if (sum == 1) {
    sum = 10;
  }
  console.log(sum);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
