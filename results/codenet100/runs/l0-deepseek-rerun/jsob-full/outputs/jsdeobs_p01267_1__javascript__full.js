const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8');
const Arr = input.replace(/\n$/, '').split('\n');

while (true) {
  const arr = Arr.shift().split(' ').map(Number);
  if (arr.join('') === '') break;
  const y = Arr.shift().split(' ').map(Number);

  (function (a, b, c, d, e) {
    let count = 0;
    while (true) {
      if (y[0] == e) y.shift();
      if (y[0] === 0) {
        console.log(count);
        break;
      }
      e = ((b + e) * c + d) % 256;
      count++;
      if (count === 10000) {
        console.log(-1);
        break;
      }
    }
  })(null, arr);
}
