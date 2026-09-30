function countLuckyNumbers(usedDigits, value, limit, count) {
  if (value > limit) {
    return count;
  }

  if (usedDigits === 0b111) {
    count += 1;
  }

  count = countLuckyNumbers(usedDigits | 0b001, value * 10 + 3, limit, count);
  count = countLuckyNumbers(usedDigits | 0b010, value * 10 + 5, limit, count);
  count = countLuckyNumbers(usedDigits | 0b100, value * 10 + 7, limit, count);

  return count;
}

function main(input) {
  const limit = parseInt(input);
  console.log(countLuckyNumbers(0, 0, limit, 0));
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
