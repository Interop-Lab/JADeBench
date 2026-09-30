'use strict';

function Main(input) {
  const firstLine = input.split('\n')[0];
  const chars = firstLine.split('');
  const stack = [];

  for (const ch of chars) {
    if (ch === 'B') {
      stack.pop();
    } else {
      stack.push(ch);
    }
  }

  console.log(stack.join(''));
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
