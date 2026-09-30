'use strict';

const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8').split('\n');
const vertexCount = Number(lines[0].split(' ')[0]);
const edges = lines.slice(1).map(line => line.split(' ').map(Number));
const degreeByVertex = Array(vertexCount).fill(0);

edges.forEach(([firstVertex, secondVertex]) => {
  degreeByVertex[firstVertex - 1]++;
  degreeByVertex[secondVertex - 1]++;
});

degreeByVertex.forEach(degree => console.log(degree));
