const fs = require('fs');

function main(input) {
  const [firstNumber, secondNumber] = input
    .split(' ')
    .map(value => parseInt(value));

  let result;
  if (firstNumber === 1 && secondNumber === 1) {
    result = 1;
  } else if (firstNumber === 1 || secondNumber === 1) {
    result = firstNumber + secondNumber - 3;
  } else {
    result = (firstNumber - 2) * (secondNumber - 2);
  }

  if (result > 9_000_000_000_000_000) {
    result = Math.floor((firstNumber - 2) / 10_000) * (secondNumber - 2);

    const lowerProduct = ((firstNumber - 2) % 10_000) * (secondNumber - 2);
    globalThis.tmp = lowerProduct;
    result += Math.floor(lowerProduct / 10_000);

    const paddedRemainder = (`0000${lowerProduct % 10_000}`).slice(-4);
    globalThis.tmp = paddedRemainder;
    result += paddedRemainder;
  }

  console.log(result);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
