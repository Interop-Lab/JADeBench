'use strict';

const main = input => {
  const lines = input.trim().split('\n');
  const first = parseInt(lines[0].split(' ')[0]);
  const second = parseInt(lines[0].split(' ')[1]);

  console.log(second === 1 ? 0 : first - second);
};

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
