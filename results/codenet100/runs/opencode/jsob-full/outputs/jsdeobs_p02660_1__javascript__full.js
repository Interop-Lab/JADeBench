const fs = require("fs");

/**
 * Counts the divisions performed while testing successive integer powers.
 *
 * The changing remainder is intentional: after every exact division it is
 * divided by the power that matched. If no power matched, positive inputs
 * other than 1 produce the fallback value 1.
 */
function Main(input) {
  const number = parseInt(input.split("\n")[0]);
  let count = 0;
  let remainder = number;

  for (let base = 2; base < Math.sqrt(number); base++) {
    let power = base;

    for (let exponent = 1; power < number; exponent++) {
      const divisor = Math.pow(base, exponent);

      if (remainder % divisor == 0) {
        count++;
        remainder /= divisor;
      } else {
        break;
      }

      power = Math.pow(base, exponent + 1);
    }
  }

  if (count == 0 && number != 1) {
    count = 1;
  }

  console.log("%s", count);
  return count;
}

/**
 * Browser-side answer checker retained from the original program.
 * Elements are named input<ID>, output<ID>, and result<ID>.
 */
function debug(id) {
  const input = document.getElementById(`input${id}`).value;
  const actual = Main(input);
  let verdict = "WA";

  const expected = document
    .getElementById(`result${id}`)
    .innerHTML.split("\n")[0];

  if (actual == expected) {
    verdict = "AC";
  }

  document.getElementById(`output${id}`).innerHTML = verdict;
}

Main(fs.readFileSync("/dev/stdin", "utf8"));
