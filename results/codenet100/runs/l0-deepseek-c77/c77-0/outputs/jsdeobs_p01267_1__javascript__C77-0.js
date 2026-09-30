const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8');
const Arr = input.replace(/\n$/, '').split('\n');

while (true) {
  const arr = Arr.shift().split(' ').map(Number);
  if (arr.join('') === '00000') break;
  const y = Arr.shift().split(' ').map(Number);

  let counter = 0;
  let state = 0;
  while (true) {
    if (y[0] === state) y.shift();
    if (y.length === 0) {
      console.log(counter);
      break;
    }
    state = (arr[0] * state + arr[1]) % arr[2];
    counter++;
    if (counter === 10001) {
      console.log(-1);
      break;
    }
  }
}
