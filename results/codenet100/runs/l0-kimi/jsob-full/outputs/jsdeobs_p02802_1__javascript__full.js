'use strict';
const fs = require('fs');

function Main(input) {
    const lines = input.split('\n');
    const n = parseInt(lines[0].trim().split(' ')[0]);
    const graph = {};
    
    for (let i = 0; i < n; i++) {
        const parts = lines[i].split(' ');
        const node = parts[0];
        const neighbors = parts.slice(1);
        
        if (graph[node] === undefined) {
            graph[node] = neighbors.join(',');
        } else {
            graph[node] += ',' + neighbors.join(',');
        }
    }
    
    let acCount = 0;
    let otherCount = 0;
    const nodes = Object.keys(graph);
    
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const neighbors = graph[node].split(',');
        
        for (let j = 0; j < neighbors.length; j++) {
            if (neighbors[j] === 'AC') {
                acCount++;
                break;
            } else {
                otherCount++;
            }
        }
    }
    
    console.log(acCount + ' ' + otherCount);
}

Main(fs.readFileSync('input.txt', 'utf8'));
