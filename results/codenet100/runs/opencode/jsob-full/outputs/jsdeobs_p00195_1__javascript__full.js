const fs = require("fs");

const input = fs.readFileSync("/dev/stdin", "utf8");
const lines = input.trim().split("\n");
const contestantLabels = "ABCD";
let roundScores = [];

for (const line of lines) {
  if (roundScores.length === 0 && line === "0 0") {
    break;
  }

  if (roundScores.length === 4) {
    const highestScore = roundScores.reduce((highest, score) =>
      Math.max(highest, score),
    );
    const winner = contestantLabels[roundScores.indexOf(highestScore)];

    console.log(`${winner} ${highestScore}`);
    roundScores = [];
  } else {
    const [firstScore, secondScore] = line.split(" ").map(Number);
    roundScores.push(firstScore + secondScore);
  }
}
