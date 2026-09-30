const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

while (true) {
  const teamCount = lines.shift() - 0;
  if (teamCount === 0) break;

  const teams = [];

  for (let i = 0; i < teamCount; i++) {
    const results = lines.shift().split(' ');
    const name = results.shift();
    let zeroResultCount = 0;
    let oneResultCount = 0;

    for (let opponentIndex = 0; opponentIndex < teamCount - 1; opponentIndex++) {
      const result = results[opponentIndex] - 0;
      if (result === 0) zeroResultCount++;
      if (result === 1) oneResultCount++;
    }

    const rankingScore =
      zeroResultCount * 100 +
      (10 - oneResultCount) +
      (10 - (teamCount - 1)) * 0.01;

    teams.push([name, rankingScore]);
  }

  teams.sort((left, right) => right[1] - left[1]);
  teams.forEach((team) => {
    console.log(team[0]);
  });
}
