const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');
const lines = input.trim().split('\n');

while (true) {
  const n = parseInt(lines.shift(), 10);
  if (n === 0) break;

  const team = [];

  for (let i = 0; i < n; i++) {
    const parts = lines.shift().split(' ');
    const name = parts.shift();
    const scores = parts.map(Number);

    let scoreA = 0;
    let scoreB = 0;

    for (let j = 0; j < n - 1; j++) {
      if (scores[j] === 0) scoreA++;
      if (scores[j] === 1) scoreB++;
    }

    team.push([name, scoreA * 100 + (10 - scoreB) + (10 - i) * 0.01]);
  }

  team.sort((a, b) => b[1] - a[1]);
  team.forEach(entry => console.log(entry[0]));
}
