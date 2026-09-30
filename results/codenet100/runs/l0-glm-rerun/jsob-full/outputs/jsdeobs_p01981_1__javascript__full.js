var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr = input.trim().split('\n');

while (true) {
  var gymd = arr.shift();
  if (gymd == '#') break;
  var [g, y, m, d] = gymd.split(' ');
  [y, m, d] = [y - 1, m - 1, d - 1];
  if (y <= 0 || y == 0 && m <= 0)
    console.log(gymd);
  else
    y = y - 1,
    console.log('? ' + y + ' ' + m + ' ' + d);
}
