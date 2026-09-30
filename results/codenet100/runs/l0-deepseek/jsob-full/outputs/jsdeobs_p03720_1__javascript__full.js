'use strict';

const fs = require('fs');

const lines = fs.readFileSync('in', 'utf8').split('\n');
const N = +lines[0].split(' ')[0];
const ABs = lines.slice(1).map(line => line.split(' ').map(Number));
const res = [];

for (let i = 0; i < N; i++) {
  res[i] = 0;
}

ABs.forEach(ab => {
  res[ab[0] - 1]++;
  res[ab[1] - 1]++;
});

res.forEach(value => console.log(value));
