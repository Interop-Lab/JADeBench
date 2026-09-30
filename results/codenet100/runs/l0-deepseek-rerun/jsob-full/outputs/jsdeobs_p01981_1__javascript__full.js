const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8');
const arr = input.split('\n');

while (true) {
  const line = arr.shift();
  if (line === '#') break;

  const [g, yStr, mStr, dStr] = line.split(' ');
  let y = Number(yStr) - 1;
  let m = Number(mStr) - 1;
  let d = Number(dStr) - 1;

  if (y <= 0 || (y === 0 && m <= 0)) {
    console.log(line);
  } else {
    y = y - 1;
    console.log('? ' + y + ' ' + m + ' ' + d);
  }
}
