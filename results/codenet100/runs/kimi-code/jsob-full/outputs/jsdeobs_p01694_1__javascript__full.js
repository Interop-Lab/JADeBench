const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

while (true) {
  const moveCount = Number(lines.shift());
  if (moveCount === 0) break;

  const moves = lines.shift().split(' ');
  let leftHandUp = 0;
  let rightHandUp = 0;
  let targetRaisedHands = 2;
  let completedCycles = 0;

  moves.forEach((move) => {
    if (move === 'lu') {
      leftHandUp = 1;
    } else if (move === 'ru') {
      rightHandUp = 1;
    } else if (move === 'ld') {
      leftHandUp = 0;
    } else if (move === 'rd') {
      rightHandUp = 0;
    }

    if (targetRaisedHands === leftHandUp + rightHandUp) {
      completedCycles++;
      targetRaisedHands = targetRaisedHands === 2 ? 0 : 2;
    }
  });

  console.log(completedCycles);
}
