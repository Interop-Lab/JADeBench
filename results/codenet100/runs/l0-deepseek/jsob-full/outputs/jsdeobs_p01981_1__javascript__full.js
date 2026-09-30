const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8');
const arr = input.split('\n');

while (true) {
  const gymd = arr.shift();
  if (gymd === '#') break;

  let [g, y, m, d] = gymd.split(' ');
  y = y - 1;
  m = m - 1;
  d = d - 1;

  if (y <= 0 || (y === 0 && m <= 0)) {
    console.log(gymd);
  } else {
    y = y - 1;
    console.log('? ' + y + ' ' + m + ' ' + d);
  }
}
