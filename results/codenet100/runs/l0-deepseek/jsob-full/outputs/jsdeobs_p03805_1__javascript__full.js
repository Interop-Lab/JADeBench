const fs = require('fs');
const lines = fs.readFileSync('input.txt', 'utf8').trim().split('\n');
let lineCount = 0;
const s = () => lines[lineCount++];
const n = () => Number(s());
const b = () => BigInt(s());
const sa = () => s().split(' ');
const na = () => sa().map(Number);
const ba = () => sa().map(BigInt);

function main(input) {
  const [n, m] = na();
  const adj = Array.from({ length: n + 1 }, () => new Set());
  for (let i = 0; i < m; i++) {
    const [u, v] = na();
    adj[u].add(v);
    adj[v].add(u);
  }
  let count = 0;
  function dfs(node, visited) {
    if (visited.size === n) return ++count;
    for (const next of adj[node]) {
      if (visited.has(next)) continue;
      dfs(next, new Set(visited).add(next));
    }
  }
  dfs(1, new Set([1]));
  return count;
}

const ans = main(lines);
console.log(ans);
