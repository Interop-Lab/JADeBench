'use strict';
let lines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n'),
    N = +lines[0].split(' ')[0],
    ABs = lines.slice(1).map(line => line.split(' ').map(Number)),
    res = [];
for (let i = 0; i < N; i++) res[i] = 0;
ABs.forEach(([a, b]) => {
    res[a - 1]++;
    res[b - 1]++;
});
res.forEach(count => console.log(count));
