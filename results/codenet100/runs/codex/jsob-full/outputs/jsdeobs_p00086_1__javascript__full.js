const input = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
const lines = input.split('\n');

while (lines.length > 0) {
  const degreeByVertex = [];
  let line;

  while ((line = lines.shift()) != '0 0') {
    const numbers = line.split(' ');
    const from = +numbers[0];
    const to = +numbers[1];

    degreeByVertex[from] = (degreeByVertex[from] || 0) + 1;
    degreeByVertex[to] = (degreeByVertex[to] || 0) + 1;
  }

  const oddDegrees = degreeByVertex.filter((degree) => degree % 2 == 1);
  const endpointsAreOdd = degreeByVertex[1] % 2 == 1 && degreeByVertex[2] % 2 == 1;

  console.log(endpointsAreOdd && oddDegrees.length > 2 ? 'NG' : 'OK');
}
