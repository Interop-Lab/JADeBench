const fs = require('fs');
const input = fs.readFileSync('input.txt', 'utf8');
const lines = input.trim().split('\n');
const abc = [];

for (let i = 0; i < lines.length; i++) {
  if (abc.length === 0 && lines[i] === '') {
    break;
  }
  if (abc.length === 4) {
    const numbers = lines[i].split(' ').map(Number);
    abc.push(numbers[0] + numbers[1]);
  }
}

const ABC = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/'.split('');
const max = abc.reduce(function (a, b) {
  return Math.max(a, b);
});
const str = ABC[abc.indexOf(max)];
console.log(str + ' ' + max);
