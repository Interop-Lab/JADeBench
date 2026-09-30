var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var x = input.trim().split(' ').map(Number);
var cnt = 0;

for (var a = 0; a <= 5; a++) {
  for (var b = 0; b <= 5; b++) {
    for (var c = 0; c <= 5; c++) {
      for (var d = 0; d <= 5; d++) {
        for (var e = 0; e <= 5; e++) {
          for (var f = 0; f <= 5; f++) {
            var z = (a + c + f + (b + e) * 7 + d * 49 + '').split('').map(Number);
            if (z.length != 2) continue;
            z = [a, b, c, d, e, f].concat(z);
            var flag = z.every(function (v, i) {
              return (x[i] == v || x[i] == -1) && z[i + 6] >= 0;
            });
            if (flag) cnt++;
          }
        }
      }
    }
  }
}

console.log(cnt);
