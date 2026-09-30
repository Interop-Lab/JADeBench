'use strict';

function Main(input) {
  const lines = input.split('\n');
  const n = parseInt(lines[0].split(' ')[0], 10);
  const groups = {};

  for (let i = 0; i < n; i++) {
    const parts = lines[i].split(' ');
    const key = parts[0];
    const value = parts[1];
    if (groups[key] === undefined) {
      groups[key] = '' + value;
    } else {
      groups[key] += ',' + value;
    }
  }

  let wa = 0;
  let ac = 0;
  const keys = Object.keys(groups);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const values = groups[key].split(',');
    for (let j = 0; j < values.length; j++) {
      if (values[j] === 'AC') {
        ac++;
        break;
      } else {
        wa++;
      }
    }
  }

  console.log(ac + ' ' + wa);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
