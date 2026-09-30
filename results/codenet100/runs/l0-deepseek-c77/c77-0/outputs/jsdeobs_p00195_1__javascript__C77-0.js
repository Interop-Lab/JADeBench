const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8');

const Arr = input.trim().split('\n');
const abc = [];

for (let i = 0; i < Arr.length; i++) {
  if (abc.length === 0 && Arr[i] === '0 0') break;

  if (abc.length === 4) {
    const ABC = 'ABCD'.split('');
    const max = abc.reduce(function (a, b) {
      return Math.max(a, b);
    });
    const str = ABC[abc.indexOf(max)];
    console.log(str + ' ' + max);
    abc = [];
  } else {
    const arr = Arr[i].split(' ').map(Number);
    abc.push(arr[0] + arr[1]);
  }
}
