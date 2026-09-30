const fs = require("fs");

const input = fs.readFileSync("/dev/stdin", "utf8");
const lines = input.trim().split("\n");

let line;
while ((line = lines.shift())) {
  const numbers = line.split(" ").map(Number);

  if (numbers.length > 1) {
    const pairsByDifference = [];

    numbers.forEach((leftNumber, leftIndex) => {
      numbers.forEach((rightNumber, rightIndex) => {
        if (leftIndex !== rightIndex) {
          const difference = Math.abs(leftNumber - rightNumber);
          const pair = `${leftNumber} ${rightNumber}`;
          pairsByDifference.push([pair, difference]);
        }
      });
    });

    const closestPair = pairsByDifference.sort(
      (leftPair, rightPair) => leftPair[1] - rightPair[1],
    )[0];

    console.log(closestPair[1]);
  }
}
