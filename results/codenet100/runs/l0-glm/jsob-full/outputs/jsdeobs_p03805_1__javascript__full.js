function main(input) {
  const [N, M] = na();
  const adj = Array.from({ length: N + 1 }, () => new Set());

  for (let i = 0; i < M; i++) {
    const [u, v] = na();
    adj[u].add(v);
    adj[v].add(u);
  }

  let count = 0;

  function dfs(node, visited) {
    if (visited.size === N) return ++count;
    for (let neighbor of adj[node]) {
      if (visited.has(neighbor)) continue;
      dfs(neighbor, new Set(visited).add(neighbor));
    }
  }

  dfs(adj[1], new Set([1]));

  return count;
}

const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
let lineCount = 0;
const s = () => lines[lineCount++];
const n = () => Number(s());
const b = () => BigInt(s());
const sa = () => s().split(' ');
const na = () => sa().map(Number);
const ba = () => sa().map(BigInt);
const ans = main(lines);
console.log(ans);
