const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');
const lines = input.trim().split('\n');

while (true) {
  const teamCount = Number(lines.shift());
  if (teamCount === 0) {
    break;
  }

  const teams = [];

  for (let teamIndex = 0; teamIndex < teamCount; teamIndex += 1) {
    const fields = lines.shift().split(' ');
    const name = fields.shift();
    let zeroResults = 0;
    let oneResults = 0;

    for (let opponentIndex = 0; opponentIndex < teamCount - 1; opponentIndex += 1) {
      const result = Number(fields[opponentIndex]);
      if (result === 0) {
        zeroResults += 1;
      }
      if (result === 1) {
        oneResults += 1;
      }
    }

    const rankingScore =
      zeroResults * 100 +
      (10 - oneResults) +
      (11 - teamCount) * 0.01;

    teams.push([name, rankingScore]);
  }

  teams.sort((firstTeam, secondTeam) => secondTeam[1] - firstTeam[1]);
  teams.forEach(([name]) => console.log(name));
}
