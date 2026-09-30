const fs = require('fs');

const LOWER_RANGE_MAX = 5;
const UPPER_RANGE_MIN = 6;
const WRAP_AFTER = 10;

function buildPath(start, goal) {
  let current = start;
  let step = 1;
  const path = [current];

  if (current < goal) {
    do {
      current++;
      path.push(current);
    } while (current !== goal);
  } else if (current > goal && current <= LOWER_RANGE_MAX) {
    do {
      current--;
      path.push(current);
    } while (current !== goal);
  } else if (
    current > goal &&
    current >= UPPER_RANGE_MIN &&
    goal >= UPPER_RANGE_MIN
  ) {
    do {
      current++;
      if (current === WRAP_AFTER) {
        current = LOWER_RANGE_MAX;
      }
      path.push(current);
    } while (current !== goal);
  } else if (
    current > goal &&
    current >= UPPER_RANGE_MIN &&
    goal <= LOWER_RANGE_MAX
  ) {
    do {
      current += step;
      if (current === WRAP_AFTER) {
        current = LOWER_RANGE_MAX;
        step = -1;
      }
      path.push(current);
    } while (current !== goal);
  }

  return path;
}

const lines = fs
  .readFileSync('/dev/stdin', 'utf8')
  .replace(/\n$/, '')
  .split('\n');
const pathCount = lines.shift() - 0;

for (let index = 0; index < pathCount; index++) {
  const [start, goal] = lines[index].split(' ').map(Number);
  console.log(buildPath(start, goal).join(' '));
}
