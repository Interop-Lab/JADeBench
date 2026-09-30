const fs = require('fs');

function describePattern(value) {
  let scale = 1;

  while ((value & 3) === 0) {
    scale++;
    value >>>= 2;
  }

  return {
    scale,
    startsEven: !(value & 1),
  };
}

function includesPoint(pattern, x, y) {
  const row = Math.floor(y / pattern.scale);

  if (pattern.startsEven) {
    return !(row & 1);
  }

  const column = Math.floor(x / pattern.scale);
  return !((column + row) & 1);
}

function main(input) {
  const values = input.split(' ').map(Number);
  const size = values[0];
  const firstPattern = describePattern(values[1]);
  const secondPattern = describePattern(values[2]);
  const points = [];

  for (let x = 0; x < 2 * size; x++) {
    for (let y = 0; y < 2 * size; y++) {
      if (
        includesPoint(firstPattern, x, y) &&
        includesPoint(secondPattern, x, y)
      ) {
        points.push(`${x} ${y}`);
      }

      if (points.length === size * size) {
        console.log(points.join('\n'));
        return;
      }
    }
  }
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
