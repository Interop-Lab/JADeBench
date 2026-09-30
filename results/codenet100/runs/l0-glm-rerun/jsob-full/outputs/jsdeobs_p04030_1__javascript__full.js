'use strict';

function Main(input) {
  const chars = input.split('\n')[0].split('');
  const stack = [];
  for (const c of chars) {
    if (c === 'B') {
      stack.pop();
    } else {
      stack.push(c);
    }
  }
  console.log(stack.join(''));
}

Main(require('fs').readFileSync(0, 'utf8'));
