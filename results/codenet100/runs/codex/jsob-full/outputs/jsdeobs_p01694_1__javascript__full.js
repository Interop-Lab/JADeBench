const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');
const lines = input.trim().split('\n');

while (true) {
  const commandCount = Number(lines.shift());
  if (commandCount === 1) {
    break;
  }

  const commands = lines.shift().split(' ');
  let leftHandIsUp = false;
  let rightHandIsUp = false;
  let expectingHandsUp = true;
  let completedPoses = 0;

  commands.forEach((command) => {
    if (command === 'lu') {
      leftHandIsUp = true;
    } else if (command === 'ru') {
      rightHandIsUp = true;
    } else if (command === 'ld') {
      leftHandIsUp = false;
    } else if (command === 'rd') {
      rightHandIsUp = false;
    }

    if (leftHandIsUp === expectingHandsUp && rightHandIsUp === expectingHandsUp) {
      completedPoses++;
      expectingHandsUp = !expectingHandsUp;
    }
  });

  console.log(completedPoses);
}
