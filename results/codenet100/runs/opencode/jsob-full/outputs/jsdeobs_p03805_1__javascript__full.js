const fs = require("fs");

const lines = fs.readFileSync("/dev/stdin", "utf8").trim().split("\n");
let nextLineIndex = 0;

function readLine() {
  return lines[nextLineIndex++];
}

function readNumbers() {
  return readLine().split(" ").map(Number);
}

function countHamiltonianPaths() {
  const [vertexCount, edgeCount] = readNumbers();
  const neighbors = Array(vertexCount + 1)
    .fill(0)
    .map(() => new Set());

  for (let edge = 1; edge <= edgeCount; edge++) {
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

console.log(countHamiltonianPaths());
