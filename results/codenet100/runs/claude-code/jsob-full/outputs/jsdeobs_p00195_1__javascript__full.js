const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');
const lines = input.trim().split('\n');
const playerLabels = ['A', 'B', 'C', 'D'];
let roundScores = [];

for (const line of lines) {
  if (roundScores.length === 0 && line === '0 0') {
    break;
  }

  if (roundScores.length === 4) {
    const maximumScore = roundScores.reduce((left, right) => Math.max(left, right));
    const winner = playerLabels[roundScores.indexOf(maximumScore)];
    console.log(`${winner} ${maximumScore}`);
    roundScores = [];
    continue;
  }

  const values = line.split(' ').map(Number);
  roundScores.push(values[0] + values[1]);
}
