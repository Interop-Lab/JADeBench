const [p, m, c] = require('fs')
  .readFileSync('/dev/stdin', 'utf8')
  .trim()
  .split(' ')
  .map(Number);

console.log(p + m + c);
