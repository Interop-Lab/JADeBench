var input = require('fs').readFileSync('/dev/stdin', 'utf8'), cnt, i, j;
input = input.split(' ');
for (cnt = 0; cnt < 3; cnt++) {
  for (i = 0; i < 4; i++) {
    input[i] > input[i + 1] && (j = input[i], input[i] = input[i + 1], input[i + 1] = j);
  }
}
console.log('%s %s %s', input[0], input[1], input[2]);
