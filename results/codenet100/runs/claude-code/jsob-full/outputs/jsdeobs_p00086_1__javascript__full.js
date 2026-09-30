const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8').trim();
const lines = input.split('\n');

while (lines.length > 0) {
  const degrees = [];
  let line;

  while ((line = lines.shift()) !== '0 0') {
    const [from, to] = line.split(' ').map(Number);
    degrees[from] = (degrees[from] || 0) + 1;
    degrees[to] = (degrees[to] || 0) + 1;
  }

  const oddDegrees = degrees.filter((degree) => degree % 2 === 1);
  const endpointsHaveOddDegree =
    degrees[1] % 2 === 1 && degrees[2] % 2 === 1;
  const hasAdditionalOddVertices = oddDegrees.length > 2;

  console.log(
    endpointsHaveOddDegree && hasAdditionalOddVertices ? 'NG' : 'OK',
  );
}
