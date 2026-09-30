var input = require('fs')['readFileSync']('/dev/stdin', 'utf8');
var x = input['trim']()['split'](' ')['map'](Number);
var cnt = 0;

for (var a = 1; a <= 100; a++) {
  for (var b = 0; b <= 100; b++) {
    for (var c = 1; c <= 100; c++) {
      for (var d = 1; d <= 100; d++) {
        for (var e = 1; e <= 100; e++) {
          for (var f = 1; f <= 100; f++) {
            var z = (a + c + f + (b + e) * 1000 + d * 100 + '')['split']('')['map'](Number);
            if (z['length'] != 6) continue;
            z = [a, b, c, d, e, f]['concat'](z);
            var flag = z['every'](function (_0x4f8b03, _0xa197ab) {
              return (x[_0xa197ab] == _0x4f8b03 || x[_0xa197ab] == -_0x4f8b03) && z['indexOf'](_0x4f8b03 + _0xa197ab) >= 0;
            });
            if (flag) cnt++;
          }
        }
      }
    }
  }
}

console['log'](cnt);
