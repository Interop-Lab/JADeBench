const fs = require('fs');

function main(lines) {
    const [n, m] = na();
    const adj = Array.from({ length: n + 1 }, () => new Set());
    
    for (let i = 0; i < m; i++) {
        const [u, v] = na();
        adj[u].add(v);
        adj[v].add(u);
    }
    
    let components = 0;
    dfs(adj[1], new Set([1]));
    
    function dfs(nodes, visited) {
        if (visited.size === n) {
            components++;
            return;
        }
        for (let node of nodes) {
            if (visited.has(node)) continue;
            dfs(adj[node], new Set([...visited, node]));
        }
    }
    
    return components;
}

const lines = fs.readFileSync(0, 'utf-8').toString().trim().split('\n');
let lineCount = 0;
const s = () => lines[lineCount++];
const n = () => Number(s());
const b = () => BigInt(s());
const sa = () => s().split(' ');
const na = () => sa().map(Number);
const ba = () => sa().map(BigInt);
const ans = main(lines);
console.log(ans);
