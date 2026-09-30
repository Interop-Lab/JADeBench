'use strict';

function Main(input) {
  const lines = input.split('\n');
  const n = parseInt(lines.shift().split(' ')[1], 10);
  const stateObject = {};

  for (let i = 0; i < n; i++) {
    const parts = lines[i].split(' ');
    const state = parts[0];
    const action = parts[1];

    if (stateObject[state] === undefined) {
      stateObject[state] = '' + action;
    } else {
      stateObject[state] += ',' + action;
    }
  }

  let acCount = 0;
  let waCount = 0;
  const states = Object.keys(stateObject);

  for (let i = 0; i < states.length; i++) {
    const state = states[i];
    const actions = stateObject[state].split(',');

    for (let j = 0; j < actions.length; j++) {
      if (actions[j] == 'AC') {
        acCount++;
        break;
      } else {
        waCount++;
      }
    }
  }

  console.log(acCount + ' ' + waCount);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
