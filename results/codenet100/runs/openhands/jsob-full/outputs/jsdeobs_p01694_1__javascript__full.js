const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

while (true) {
  const moveCount = Number(lines.shift());
  if (moveCount === 0) break;

  const moves = lines.shift().split(' ');
  let leftHand = 0;
  let rightHand = 0;
  let targetPosition = 2;
  let completedPositions = 0;

  for (const move of moves) {
    if (move === 'lu') {
      leftHand = 1;
    } else if (move === 'ru') {
      rightHand = 1;
    } else if (move === 'ld') {
      leftHand = 0;
    } else if (move === 'rd') {
      rightHand = 0;
    }

    if (leftHand + rightHand === targetPosition) {
      completedPositions += 1;
      targetPosition = targetPosition === 2 ? 0 : 2;
    }
  }

  console.log(completedPositions);
}
