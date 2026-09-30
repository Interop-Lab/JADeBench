const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8').trim();
const lines = input.split('\n');

while (lines.length > 0) {
  const degreeByNode = [];
  let line;

  while ((line = lines.shift()) !== '0 0') {
    const endpoints = line.split(' ');
    const from = +endpoints[0];
    const to = +endpoints[1];

    degreeByNode[from] = (degreeByNode[from] || 0) + 1;
    degreeByNode[to] = (degreeByNode[to] || 0) + 1;
  }

  const oddDegrees = degreeByNode.filter((degree) => degree % 2 === 1);
  const endpointsAreOdd = degreeByNode[1] % 2 === 1 && degreeByNode[2] % 2 === 1;

  console.log(endpointsAreOdd && oddDegrees.length > 2 ? 'NG' : 'OK');
}
