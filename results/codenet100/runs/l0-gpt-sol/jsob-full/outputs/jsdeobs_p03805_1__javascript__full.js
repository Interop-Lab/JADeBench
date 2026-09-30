const lines = require("fs")
  .readFileSync("/dev/stdin", "utf8")
  .trim()
  .split("\n");

let lineIndex = 0;

const readLine = () => lines[lineIndex++];
const readNumbers = () => readLine().split(" ").map(Number);

function main() {
  const [vertexCount, edgeCount] = readNumbers();
  const graph = Array(vertexCount + 1)
    .fill(0)
    .map(() => new Set());

  for (let i = 1; i <= edgeCount; i++) {
    const [from, to] = readNumbers();
    graph[from].add(to);
    graph[to].add(from);
  }

  let pathCount = 0;

  function search(neighbors, visited) {
    if (visited.length == vertexCount) {
      return ++pathCount;
    }

    for (const next of neighbors) {
      if (visited.includes(next)) continue;
      search(graph[next], visited.concat(next));
    }
  }

  search(graph[1], [1]);
  return pathCount;
}

const answer = main();
console.log(answer);
