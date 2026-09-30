const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');
const lines = input.trim().split('\n');
let scores = [];

for (const line of lines) {
  if (scores.length === 0 && line === '0 0') {
    break;
  }

  if (scores.length === 4) {
    const highestScore = scores.reduce((highest, score) =>
      Math.max(highest, score),
    );
    const contestantLabels = 'ABCD'.split('');
    const winner = contestantLabels[scores.indexOf(highestScore)];

    console.log(winner + ' ' + highestScore);
    scores = [];
  } else {
    const values = line.split(' ').map(Number);
    scores.push(values[0] + values[1]);
  }
}
