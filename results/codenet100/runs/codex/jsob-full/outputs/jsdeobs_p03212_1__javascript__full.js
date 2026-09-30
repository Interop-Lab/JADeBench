const fs = require('fs');

const ALL_LUCKY_DIGITS = 0b111;

function countLuckyNumbers(limit, currentNumber = 0, usedDigits = 0) {
  if (currentNumber > limit) {
    return 0;
  }

  let count = usedDigits === ALL_LUCKY_DIGITS ? 1 : 0;
  count += countLuckyNumbers(limit, currentNumber * 10 + 3, usedDigits | 0b001);
  count += countLuckyNumbers(limit, currentNumber * 10 + 5, usedDigits | 0b010);
  count += countLuckyNumbers(limit, currentNumber * 10 + 7, usedDigits | 0b100);
  return count;
}

function main(input) {
  const limit = parseInt(input);
  console.log(countLuckyNumbers(limit));
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
