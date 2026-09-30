const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
let nextLineIndex = 0;

function readNumbers() {
  return lines[nextLineIndex++].split(' ').map(Number);
}

function countHamiltonianPaths() {
  const [vertexCount, edgeCount] = readNumbers();
  const neighbors = Array(vertexCount + 1)
    .fill(0)
    .map(() => new Set());

  for (let edgeIndex = 1; edgeIndex <= edgeCount; edgeIndex++) {
    const [from, to] = readNumbers();
    neighbors[from].add(to);
    neighbors[to].add(from);
  }

  let pathCount = 0;

  function visit(adjacentVertices, path) {
    if (path.length == vertexCount) {
      pathCount++;
      return;
    }

    for (const vertex of adjacentVertices) {
      if (path.includes(vertex)) continue;
      visit(neighbors[vertex], path.concat(vertex));
    }
  }

  visit(neighbors[1], [1]);
  return pathCount;
}

const answer = countHamiltonianPaths();
console.log(answer);
