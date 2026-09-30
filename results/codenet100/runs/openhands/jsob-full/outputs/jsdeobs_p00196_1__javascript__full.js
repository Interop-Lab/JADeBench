const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

while (true) {
  const teamCount = lines.shift() - 0;
  if (teamCount === 0) {
    break;
  }

  const standings = [];

  for (let teamIndex = 0; teamIndex < teamCount; teamIndex += 1) {
    const fields = lines.shift().split(' ');
    const name = fields.shift();
    let zeroResultCount = 0;
    let oneResultCount = 0;
    let resultIndex = 0;

    for (; resultIndex < teamCount - 1; resultIndex += 1) {
      if (fields[resultIndex] - 0 === 0) {
        zeroResultCount += 1;
      }
      if (fields[resultIndex] - 0 === 1) {
        oneResultCount += 1;
      }
    }

    const rankingScore =
      zeroResultCount * 100 +
      (10 - oneResultCount) +
      (10 - resultIndex) * 0.01;

    standings.push([name, rankingScore]);
  }

  standings.sort((left, right) => right[1] - left[1]);
  standings.forEach(([name]) => console.log(name));
}
