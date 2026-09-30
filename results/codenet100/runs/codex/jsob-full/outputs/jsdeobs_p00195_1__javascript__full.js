const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');
const lines = input.trim().split('\n');
const contestantLabels = ['A', 'B', 'C', 'D'];
let contestantTotals = [];

for (const line of lines) {
  if (contestantTotals.length === 0 && line === '0 0') {
    break;
  }

  if (contestantTotals.length === contestantLabels.length) {
    const highestScore = contestantTotals.reduce((maximum, score) =>
      Math.max(maximum, score),
    );
    const winner = contestantLabels[contestantTotals.indexOf(highestScore)];

    console.log(`${winner} ${highestScore}`);
    contestantTotals = [];
  } else {
    const scoreParts = line.split(' ').map(Number);
    contestantTotals.push(scoreParts[0] + scoreParts[1]);
  }
}
