var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr = input.trim().split('\n');
while (true) {
  var n = arr.shift() - 0;
  if (n == 0) break;
  var ary = arr.shift().split(' ');
  var L = 0, R = 0, UD = 0, cnt = 0;
  ary.forEach(function(_0x490ada) {
    if (_0x490ada == 'lu') L = 1;
    else {
      if (_0x490ada == 'ru') R = 1;
      else {
        if (_0x490ada == 'ld') L = -1;
        else {
          if (_0x490ada == 'rd') R = -1;
        }
      }
    }
    if (UD == L + R) {
      cnt++;
      UD = UD == 0 ? 1 : 0;
    }
  });
  console.log(cnt);
}
