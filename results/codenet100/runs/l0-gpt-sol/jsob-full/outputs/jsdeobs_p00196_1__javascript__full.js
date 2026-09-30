const input = require('fs').readFileSync('/dev/stdin', 'utf8');
const lines = input.trim().split('\n');

while (true) {
    const n = Number(lines.shift());

    if (n === 0) {
        break;
    }

    const teams = [];

    for (let i = 0; i < n; i++) {
        const results = lines.shift().split(' ');
        const name = results.shift();

        let zeroCount = 0;
        let oneCount = 0;
        let j;

        for (j = 0; j < n - 1; j++) {
            if (Number(results[j]) === 0) {
                zeroCount++;
            }
            if (Number(results[j]) === 1) {
                oneCount++;
            }
        }

        const score =
            zeroCount * 100 +
            (10 - oneCount) +
            (10 - j) * 0.01;

        teams.push([name, score]);
    }

    teams.sort((a, b) => b[1] - a[1]);
    teams.forEach(team => {
        console.log(team[0]);
    });
}
