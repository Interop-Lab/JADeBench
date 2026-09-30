const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

while (true) {
  const teamCount = lines.shift() - 0;
  if (teamCount === 0) break;

  const standings = [];

  for (let i = 0; i < teamCount; i++) {
    const results = lines.shift().split(' ');
    const name = results.shift();
    let wins = 0;
    let losses = 0;

    for (let opponent = 0; opponent < teamCount - 1; opponent++) {
      if (results[opponent] - 0 === 0) wins++;
      if (results[opponent] - 0 === 1) losses++;
    }

    const score = wins * 100 + (10 - losses) + (10 - (teamCount - 1)) * 0.01;
    standings.push([name, score]);
  }

  standings.sort((left, right) => right[1] - left[1]);
  standings.forEach(([name]) => console.log(name));
}
