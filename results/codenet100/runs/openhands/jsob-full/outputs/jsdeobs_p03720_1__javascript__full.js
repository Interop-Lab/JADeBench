'use strict';

const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8').split('\n');
const vertexCount = Number(lines[0].split(' ')[0]);
const edges = lines
  .slice(1)
  .map((line) => line.split(' ').map(Number));

const degreeByVertex = [];
for (let vertexIndex = 0; vertexIndex < vertexCount; vertexIndex++) {
  degreeByVertex[vertexIndex] = 0;
}

for (const [firstVertex, secondVertex] of edges) {
  degreeByVertex[firstVertex - 1]++;
  degreeByVertex[secondVertex - 1]++;
}

degreeByVertex.forEach((degree) => console.log(degree));
