const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8');
const arr = input.trim().split('\n');

while (true) {
  const gymd = arr.shift();
  if (gymd === '#') break;

  let [g, y, m, d] = gymd.split(' ');
  y = Number(y);
  m = Number(m);
  d = Number(d);

  if (y <= 30 || (y === 31 && m <= 4)) {
    console.log(gymd);
  } else {
    y = y - 30;
    console.log('? ' + y + ' ' + m + ' ' + d);
  }
}
