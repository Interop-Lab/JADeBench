const fs = require('fs');

const inputLines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');
let nextLineIndex = 0;

function readNumberArray() {
  return inputLines[nextLineIndex++].split(' ').map(Number);
}

function countHamiltonianPaths() {
  const [vertexCount, edgeCount] = readNumberArray();
  const neighborsByVertex = Array(vertexCount + 1)
    .fill(0)
    .map(() => new Set());

  for (let edgeIndex = 0; edgeIndex < edgeCount; edgeIndex++) {
    const [firstVertex, secondVertex] = readNumberArray();
    neighborsByVertex[firstVertex].add(secondVertex);
    neighborsByVertex[secondVertex].add(firstVertex);
  }

  let pathCount = 0;

  function visitPaths(neighbors, visitedVertices) {
    if (visitedVertices.length === vertexCount) {
      pathCount++;
      return;
    }

    for (const vertex of neighbors) {
      if (visitedVertices.includes(vertex)) continue;
      visitPaths(neighborsByVertex[vertex], visitedVertices.concat(vertex));
    }
  }

  visitPaths(neighborsByVertex[1], [1]);
  return pathCount;
}

const answer = countHamiltonianPaths();
console.log(answer);
