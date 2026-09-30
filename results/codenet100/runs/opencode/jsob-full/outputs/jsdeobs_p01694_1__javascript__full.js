const fs = require("fs");

const lines = fs.readFileSync("/dev/stdin", "utf8").trim().split("\n");

while (true) {
  const commandCount = Number(lines.shift());
  if (commandCount == 0) break;

  const commands = lines.shift().split(" ");
  let leftFootIsUp = 0;
  let rightFootIsUp = 0;
  let targetPosition = 2;
  let completedMovements = 0;

  commands.forEach((command) => {
    if (command == "lu") {
      leftFootIsUp = 1;
    } else if (command == "ru") {
      rightFootIsUp = 1;
    } else if (command == "ld") {
      leftFootIsUp = 0;
    } else if (command == "rd") {
      rightFootIsUp = 0;
    }

    if (targetPosition == leftFootIsUp + rightFootIsUp) {
      completedMovements++;
      targetPosition = targetPosition == 2 ? 0 : 2;
    }
  });

  console.log(completedMovements);
}
