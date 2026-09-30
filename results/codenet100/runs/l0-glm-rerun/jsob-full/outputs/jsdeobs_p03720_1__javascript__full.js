'use strict';
let lines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');
let N = +lines[0].split(' ')[0];
let ABs = lines.slice(1).map(_0x112c16 => _0x112c16.split(' ').map(Number));
let res = [];
for (let i = 0; i < N; i++) res[i] = 0;
ABs.forEach(_0x2a42f8 => {
  res[_0x2a42f8[0] - 1]++;
  res[_0x2a42f8[1] - 1]++;
});
res.forEach(_0x3b373f => console.log(_0x3b373f));
