'use strict';

function Main(input) {
  let lines = input.split('\n');
  let N = parseInt(lines[0].trim().split(' ')[0]);
  let dict = {};

  for (let i = 0; i < N; i++) {
    let city = lines[i + 1].split(' ')[0];
    let point = lines[i + 1].split(' ')[1];
    if (dict[city] === undefined) {
      dict[city] = '' + point;
    } else {
      dict[city] += ',' + point;
    }
  }

  let total = 0;
  let acCount = 0;
  let keys = Object.keys(dict);

  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    let points = dict[key].split(',');
    for (let j = 0; j < points.length; j++) {
      if (points[j] === 'AC') {
        acCount++;
        break;
      } else {
        total++;
      }
    }
  }

  console.log(acCount + ' ' + total);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
