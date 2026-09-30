const fs = require('fs');

function main(inputLines) {
  const [startNode, nodeCount] = inputLines[0].split(' ').map(Number);
  const adjacency = Array.from({ length: nodeCount + 1 }, () => new Set());

  for (let i = 1; i <= nodeCount; i++) {
    const [u, v] = inputLines[i].split(' ').map(Number);
    adjacency[u].add(v);
    adjacency[v].add(u);
  }

  let pathCount = 0;

  function dfs(node, visited) {
    if (visited.length === nodeCount) {
      pathCount++;
      return;
    }

    for (const neighbor of adjacency[node]) {
      if (visited.includes(neighbor)) continue;
      dfs(neighbor, [...visited, neighbor]);
    }
  }

  dfs(startNode, [startNode]);
  return pathCount;
}

const input = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');
console.log(main(input));
