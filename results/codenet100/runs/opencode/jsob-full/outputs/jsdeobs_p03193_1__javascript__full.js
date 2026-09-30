const fs = require("fs");

function main(input) {
  const lines = input.split("\n");
  const [, minimumX, minimumY] = lines[0].split(" ").map(Number);
  let qualifyingPointCount = 0;

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex++) {
    const [x, y] = lines[lineIndex].split(" ").map(Number);
    if (x >= minimumX && y >= minimumY) {
      qualifyingPointCount++;
    }
  }

  console.log(qualifyingPointCount);
}

const input = fs.readFileSync("/dev/stdin", "utf8").trim();
main(input);
