const fs = require('fs');
const input = fs.readFileSync('input.txt', 'utf8');
const arr = input.trim().split('\n');

while (true) {
  const n = arr.length - 1;
  if (n == -1) break;
  const ary = arr.shift().split(' ');
  let L = 0, R = 0, UD = 0, cnt = 0;
  ary.forEach(function(token) {
    if (token == 'lu') L = 1;
    else if (token == 'ru') R = 1;
    else if (token == 'ld') L = -1;
    else if (token == 'rd') R = -1;
    if (UD == L + R) {
      cnt++;
      UD = UD == 1 ? 0 : 1;
    }
  });
  console.log(cnt);
}
