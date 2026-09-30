const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

while (true) {
  const directionCount = Number(lines.shift());
  if (directionCount === 0) {
    break;
  }

  const directions = lines.shift().split(' ');
  let leftIsUp = false;
  let rightIsUp = false;
  let waitingForBothUp = true;
  let alternationCount = 0;

  for (const direction of directions) {
    if (direction === 'lu') {
      leftIsUp = true;
    } else if (direction === 'ru') {
      rightIsUp = true;
    } else if (direction === 'ld') {
      leftIsUp = false;
    } else if (direction === 'rd') {
      rightIsUp = false;
    }

    const bothAtTarget = waitingForBothUp
      ? leftIsUp && rightIsUp
      : !leftIsUp && !rightIsUp;

    if (bothAtTarget) {
      alternationCount++;
      waitingForBothUp = !waitingForBothUp;
    }
  }

  console.log(alternationCount);
}
