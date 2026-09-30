const fs = require('fs');

function calculateResult(input) {
  const [firstValue, secondValue] = input
    .split(' ')
    .map((value) => parseInt(value));
  const adjustedFirstValue = firstValue - 2;
  const adjustedSecondValue = secondValue - 2;

  let result = 0;

  if (firstValue === 1 && secondValue === 1) {
    result = 0;
  } else if (firstValue === 1 || secondValue === 1) {
    result = firstValue + secondValue - 3;
  } else {
    result = adjustedFirstValue * adjustedSecondValue;
  }

  if (result > 9000000000000000) {
    result = Math.floor(adjustedFirstValue / 10000) * adjustedSecondValue;

    let remainderProduct = (adjustedFirstValue % 10000) * adjustedSecondValue;
    result += Math.floor(remainderProduct / 10000);

    remainderProduct = ('0000' + (remainderProduct % 10000)).slice(-4);
    result += remainderProduct;
  }

  return result;
}

const input = fs.readFileSync('/dev/stdin', 'utf8');
console.log(calculateResult(input));
