const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');
let lineIndex = 0;

function readNumbers() {
  return lines[lineIndex++].split(' ').map(Number);
}

function countHamiltonianPaths() {
  const [vertexCount, edgeCount] = readNumbers();
  const adjacency = Array.from(
    { length: vertexCount + 1 },
    () => new Set(),
  );

  for (let edgeIndex = 0; edgeIndex < edgeCount; edgeIndex++) {
    const [from, to] = readNumbers();
    adjacency[from].add(to);
    adjacency[to].add(from);
  }

  let pathCount = 0;

  function visit(neighbors, visited) {
    if (visited.size === vertexCount) {
      pathCount++;
      return;
    }

    for (const vertex of neighbors) {
      if (visited.has(vertex)) continue;

      const nextVisited = new Set(visited);
      nextVisited.add(vertex);
      visit(adjacency[vertex], nextVisited);
    }
  }

  visit(adjacency[1], new Set([1]));
  return pathCount;
}

const answer = countHamiltonianPaths();
console.log(answer);
