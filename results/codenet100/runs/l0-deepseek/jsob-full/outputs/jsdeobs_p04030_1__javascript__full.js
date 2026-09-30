'use strict';

function Main(input) {
  const lines = input.split('\n');
  const chars = lines[0].split('');
  const result = [];
  for (const ch of chars) {
    if (ch === 'B') {
      result.pop();
    } else {
      result.push(ch);
    }
  }
  console.log(result.join(''));
}

Main(require('fs').readFileSync('in', 'utf8'));
