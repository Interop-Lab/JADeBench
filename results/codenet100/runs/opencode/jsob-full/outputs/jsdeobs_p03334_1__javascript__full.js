const fs = require("fs");

function getPattern(number) {
  let scale = 0;

  while ((number & 3) === 0) {
    scale++;
    number >>>= 2;
  }

  return [scale, number & 1];
}

function isSelected(pattern, x, y) {
  const [scale, alternatesVertically] = pattern;
  x = Math.floor(x / scale);

  if (!alternatesVertically) {
    return !(x & 1);
  }

  y = Math.floor(y / alternatesVertically);
  return !((x + y) & 1);
}

function main(input) {
  const numbers = input.split(" ").map((value) => +value);
  const size = numbers[0];
  const firstPattern = getPattern(numbers[1]);
  const secondPattern = getPattern(numbers[2]);
  const points = [];

  for (let x = 0; x < 2 * size; x++) {
    for (let y = 0; y < 2 * size; y++) {
      if (
        isSelected(firstPattern, x, y) &&
        isSelected(secondPattern, x, y)
      ) {
        points.push(`${x} ${y}`);
      }

      if (points.length === size * size) {
        console.log(points.join("\n"));
        return;
      }
    }
  }
}

main(fs.readFileSync("/dev/stdin", "utf8"));
