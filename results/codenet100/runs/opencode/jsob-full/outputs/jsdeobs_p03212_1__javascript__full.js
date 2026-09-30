const fs = require("fs");

/**
 * Count numbers no greater than `limit` that consist only of 3, 5, and 7
 * and contain each of those digits at least once.
 *
 * `usedDigits` is a bit mask: 1 for 3, 2 for 5, and 4 for 7.
 */
function countSpecialNumbers(usedDigits, number, limit, count) {
  if (number > limit) {
    return count;
  }

  if (usedDigits === 7) {
    count += 1;
  }

  count += countSpecialNumbers(usedDigits | 1, number * 10 + 3, limit, 0);
  count += countSpecialNumbers(usedDigits | 2, number * 10 + 5, limit, 0);
  count += countSpecialNumbers(usedDigits | 4, number * 10 + 7, limit, 0);

  return count;
}

function main(input) {
  const limit = parseInt(input);
  console.log(countSpecialNumbers(0, 0, limit, 0));
}

main(fs.readFileSync("/dev/stdin", "utf8"));
