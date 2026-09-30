const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8').replace(/\n$/, '').split('\n');
const caseCount = Number(lines.shift());

for (let caseIndex = 0; caseIndex < caseCount; caseIndex++) {
  const [start, destination] = lines[caseIndex].split(' ').map(Number);
  let position = start;
  const path = [position];

  if (position < destination) {
    do {
      position++;
      path.push(position);
    } while (position !== destination);
  } else if (position > destination && position <= 5) {
    do {
      position--;
      path.push(position);
    } while (position !== destination);
  } else if (position > destination && destination >= 6) {
    do {
      position++;
      // Positions 6 through 9 form a loop whose next position is 5.
      if (position === 10) position = 5;
      path.push(position);
    } while (position !== destination);
  } else if (position > destination && position >= 6 && destination <= 5) {
    let step = 1;
    do {
      position += step;
      if (position === 10) {
        position = 5;
        step = -1;
      }
      path.push(position);
    } while (position !== destination);
  }

  console.log(path.join(' '));
}
