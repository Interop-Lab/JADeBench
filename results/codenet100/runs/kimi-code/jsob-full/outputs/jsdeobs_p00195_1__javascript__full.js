'use strict';

const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n');
let sums = [];

for (const line of lines) {
  if (sums.length === 0 && line === '0 0') {
    break;
  }

  if (sums.length === 4) {
    const maximum = sums.reduce((largest, value) => Math.max(largest, value));
    const labels = ['A', 'B', 'C', 'D'];
    const label = labels[sums.indexOf(maximum)];
    console.log(label + ' ' + maximum);
    sums = [];
  } else {
    const [left, right] = line.split(' ').map(Number);
    sums.push(left + right);
  }
}
