const fs = require('fs');

function calculateResult(first, second) {
  let result;

  if (first === 1 && second === 1) {
    result = 1;
  } else if (first === 1 || second === 1) {
    result = first + second - 3;
  } else {
    result = (first - 2) * (second - 2);
  }

  if (result > 9_000_000_000_000_000) {
    const firstOffset = first - 2;
    const secondOffset = second - 2;

    result = Math.floor(firstOffset / 10_000) * secondOffset;
    globalThis.tmp = (firstOffset % 10_000) * secondOffset;
    result += Math.floor(globalThis.tmp / 10_000);
    globalThis.tmp = (`0000${globalThis.tmp % 10_000}`).slice(-4);
    result += globalThis.tmp;
  }

  return result;
}

function main(input) {
  const [first, second] = input.split(' ').map((value) => parseInt(value));
  console.log(calculateResult(first, second));
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
