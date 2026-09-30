const fs = require('fs');

function countLuckyNumbers(limit) {
  function countFrom(number, usedDigits, count) {
    if (number > limit) {
      return count;
    }

    if (usedDigits === 0b111) {
      count += 1;
    }

    count = countFrom(number * 10 + 3, usedDigits | 0b001, count);
    count = countFrom(number * 10 + 5, usedDigits | 0b010, count);
    count = countFrom(number * 10 + 7, usedDigits | 0b100, count);
    return count;
  }

  return countFrom(0, 0, 0);
}

const input = fs.readFileSync('/dev/stdin', 'utf8');
const limit = parseInt(input);
console.log(countLuckyNumbers(limit));
