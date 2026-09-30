const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8').replace(/\n$/, '').split('\n');
const caseCount = lines.shift();

for (let caseIndex = 0; caseIndex < caseCount; caseIndex++) {
  const [start, goal] = lines[caseIndex].split(' ').map(Number);
  let current = start;
  const path = [current];

  if (current < goal) {
    do {
      current++;
      path.push(current);
    } while (current !== goal);
  } else if (current > goal && current <= 5) {
    do {
      current--;
      path.push(current);
    } while (current !== goal);
  } else if (current > goal && goal >= 6) {
    do {
      current++;
      if (current === 10) current = 5;
      path.push(current);
    } while (current !== goal);
  } else if (current > goal && current >= 6 && goal <= 5) {
    let step = 1;
    do {
      current += step;
      if (current === 10) {
        current = 5;
        step = -1;
      }
      path.push(current);
    } while (current !== goal);
  }

  console.log(path.join(' '));
}
