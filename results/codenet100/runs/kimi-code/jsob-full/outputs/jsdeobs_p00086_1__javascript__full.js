const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

while (lines.length > 0) {
  const degreeByVertex = [];
  let line;

  while ((line = lines.shift()) !== '0 0') {
    const [from, to] = line.split(' ').map(Number);
    degreeByVertex[from] = (degreeByVertex[from] || 0) + 1;
    degreeByVertex[to] = (degreeByVertex[to] || 0) + 1;
  }

  const oddDegrees = degreeByVertex.filter((degree) => degree % 2 === 1);
  const hasInvalidOddDegrees =
    degreeByVertex[0] % 2 === 1 &&
    degreeByVertex[1] % 2 === 1 &&
    oddDegrees.length > 2;

  console.log(hasInvalidOddDegrees ? 'NG' : 'OK');
}
