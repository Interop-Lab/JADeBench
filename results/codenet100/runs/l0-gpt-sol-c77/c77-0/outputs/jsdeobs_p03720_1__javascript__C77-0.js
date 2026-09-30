const lines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');
const vertexCount = +lines[0].split(' ')[0];
const edges = lines.slice(1).map(line => line.split(' ').map(Number));

const degreeCounts = [];

for (let i = 0; i < vertexCount; i++) {
    degreeCounts[i] = 0;
}

edges.forEach(edge => {
    degreeCounts[edge[0] - 1]++;
    degreeCounts[edge[1] - 1]++;
});

degreeCounts.forEach(degree => console.log(degree));
