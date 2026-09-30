const fs = require('fs');

function Main(input) {
  const lines = input.split('\n');
  const firstLineParts = lines[0].trim().split(' ');
  const n = parseInt(firstLineParts[0], 10);
  const groups = {};

  for (let i = 0; i < n; i++) {
    const parts = lines[i + 1].trim().split(' ');
    const group = parts[0];
    const value = parts[1];
    if (groups[group] === undefined) {
      groups[group] = '' + value;
    } else {
      groups[group] += ',' + value;
    }
  }

  let acCount = 0;
  let waCount = 0;
  const groupNames = Object.keys(groups);

  for (let i = 0; i < groupNames.length; i++) {
    const group = groupNames[i];
    const values = groups[group].split(',');
    for (let j = 0; j < values.length; j++) {
      if (values[j] === 'AC') {
        acCount++;
        break;
      } else {
        waCount++;
      }
    }
  }

  console.log(acCount + ' ' + waCount);
}

const input = fs.readFileSync('input.txt', 'utf8');
Main(input);
