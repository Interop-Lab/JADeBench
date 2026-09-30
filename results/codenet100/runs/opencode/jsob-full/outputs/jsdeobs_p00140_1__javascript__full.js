const fs = require("fs");

const lines = fs.readFileSync(0, "utf8").replace(/\n$/, "").split("\n");
const pairCount = Number(lines.shift());

function buildPath(start, goal) {
  const path = [start];
  let current = start;

  if (current < goal) {
    while (current !== goal) {
      path.push(++current);
    }
  } else if (current > goal && current <= 5) {
    while (current !== goal) {
      path.push(--current);
    }
  } else if (current > goal && current >= 6 && goal >= 6) {
    while (current !== goal) {
      current++;
      if (current === 10) current = 5;
      path.push(current);
    }
  } else if (current > goal && current >= 6 && goal <= 5) {
    while (current !== goal) {
      if (current >= 6) {
        current++;
        if (current === 10) current = 5;
      } else {
        current--;
      }
      path.push(current);
    }
  }

  return path;
}

for (let index = 0; index < pairCount; index++) {
  const [start, goal] = lines[index].split(" ").map(Number);
  console.log(buildPath(start, goal).join(" "));
}
