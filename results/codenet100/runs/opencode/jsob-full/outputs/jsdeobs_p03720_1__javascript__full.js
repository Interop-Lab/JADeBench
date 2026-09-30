'use strict';

const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');
const vertexCount = Number(inputLines[0].split(' ')[0]);
const edges = inputLines
  .slice(1)
  .map(line => line.split(' ').map(Number));

const degrees = [];
for (let vertex = 0; vertex < vertexCount; vertex++) {
  degrees[vertex] = 0;
}

for (const [firstVertex, secondVertex] of edges) {
  degrees[firstVertex - 1]++;
  degrees[secondVertex - 1]++;
}

degrees.forEach(degree => console.log(degree));
