const fs = require('fs');

function countHamiltonianPaths(lines) {
  let lineIndex = 0;
  const readNumbers = () => lines[lineIndex++].split(' ').map(Number);

  const [vertexCount, edgeCount] = readNumbers();
  const adjacency = Array(vertexCount + 1)
    .fill(0)
    .map(() => new Set());

  for (let edgeIndex = 1; edgeIndex <= edgeCount; edgeIndex++) {
    const [from, to] = readNumbers();
    adjacency[from].add(to);
    adjacency[to].add(from);
  }

  let pathCount = 0;

  function visit(currentVertex, visited) {
    if (visited.length === vertexCount) {
      pathCount++;
      return;
    }

    for (const neighbor of adjacency[currentVertex]) {
      if (visited.includes(neighbor)) continue;
      visit(neighbor, visited.concat(neighbor));
    }
  }

  visit(1, [1]);
  return pathCount;
}

const lines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');
console.log(countHamiltonianPaths(lines));
