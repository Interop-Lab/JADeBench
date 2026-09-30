'use strict';

const lines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');
const vertexCount = Number(lines[0].split(' ')[0]);
const edges = lines.slice(1).map((line) => line.split(' ').map(Number));
const incidentEdgeCounts = [];

for (let vertexIndex = 0; vertexIndex < vertexCount; vertexIndex++) {
  incidentEdgeCounts[vertexIndex] = 0;
}

edges.forEach(([firstVertex, secondVertex]) => {
  incidentEdgeCounts[firstVertex - 1]++;
  incidentEdgeCounts[secondVertex - 1]++;
});

incidentEdgeCounts.forEach((count) => console.log(count));
