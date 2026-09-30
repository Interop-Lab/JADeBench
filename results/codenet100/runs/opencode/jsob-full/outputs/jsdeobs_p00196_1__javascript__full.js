const fs = require("fs");

const lines = fs.readFileSync("/dev/stdin", "utf8").trim().split("\n");

while (true) {
  const teamCount = lines.shift() - 0;
  if (teamCount === 0) break;

  const teams = [];

  for (let teamIndex = 0; teamIndex < teamCount; teamIndex++) {
    const fields = lines.shift().split(" ");
    const name = fields.shift();
    let zeroCount = 0;
    let oneCount = 0;

    for (let resultIndex = 0; resultIndex < teamCount - 1; resultIndex++) {
      if (fields[resultIndex] - 0 === 0) zeroCount++;
      if (fields[resultIndex] - 0 === 1) oneCount++;
    }

    const rankingScore =
      zeroCount * 100 +
      (10 - oneCount) +
      (11 - teamCount) * 0.01;

    teams.push([name, rankingScore]);
  }

  teams.sort((left, right) => right[1] - left[1]);
  teams.forEach(([name]) => console.log(name));
}
