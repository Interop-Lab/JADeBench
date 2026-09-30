const input = require('fs').readFileSync('/dev/stdin', 'utf8');
const lines = input.trim().split('\n');
while (line = lines.shift()) {
  const numbers = line.split(' ').map(Number);
  if (numbers.length > 0) {
    const diffList = [];
    numbers.forEach((a, i) => {
      numbers.forEach((b, j) => {
        if (i !== j) {
          const diff = Math.abs(a - b);
          const pair = a + ' ' + b;
          diffList.push([pair, diff]);
        }
      });
    });
    const sorted = diffList.sort((x, y) => x[1] - y[1])[0];
    console.log(sorted[0]);
  }
}
