const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
let lineCount = 0;
const s = () => lines[lineCount++];
const n = () => Number(s());
const b = () => BigInt(s());
const sa = () => s().split(' ');
const na = () => sa().map(Number);
const ba = () => sa().map(BigInt);

function main(lines) {
  const [N, M] = na();
  const adj = Array(N + 1).fill(null).map(() => new Set());

  for (let i = 0; i < M; i++) {
    const [u, v] = na();
    adj[u].add(v);
    adj[v].add(u);
  }

  let count = 0;

  function dfs(current, visited) {
    if (visited.size === N) {
      return ++count;
    }
    for (let next of adj[current]) {
      if (visited.has(next)) continue;
      dfs(adj[next], visited.add(next));
    }
  }

  dfs(adj[1], new Set([1]));
  return count;
}

const ans = main(lines);
console.log(ans);
