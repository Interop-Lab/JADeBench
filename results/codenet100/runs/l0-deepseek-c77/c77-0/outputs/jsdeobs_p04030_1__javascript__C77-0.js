'use strict';

function Main(input) {
  const chars = input.split('\n')[0].split('');
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

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
