const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8');
const arr = input.trim().split('\n');

while (true) {
  const n = arr.length - 0;
  if (n == 0) break;
  const ary = arr.shift().split(' ');
  let L = 0;
  let R = 0;
  let UD = 2;
  let cnt = 0;

  ary.forEach(function (cmd) {
    if (cmd == 'lu') L = 1;
    else if (cmd == 'ru') R = 1;
    else if (cmd == 'ld') L = 0;
    else if (cmd == 'rd') R = 0;

    if (UD == L + R) {
      cnt++;
      UD = UD == 2 ? 0 : 2;
    }
  });

  console.log(cnt);
}
