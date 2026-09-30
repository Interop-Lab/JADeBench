var input = require('fs').readFileSync('stdin', 'utf8');
var x = input.trim().split(' ').map(Number);
var cnt = 0;

for (var a = 0; a <= 100; a++) {
    for (var b = -100; b <= 100; b++) {
        for (var c = -100; c <= 100; c++) {
            for (var d = -100; d <= 100; d++) {
                for (var e = -100; e <= 100; e++) {
                    for (var f = -100; f <= 100; f++) {
                        var z = (a + c + f + (b + e) * 10 + d * 100 + '').split('').map(Number);
                        if (z.length != 6) continue;
                        z = [a, b, c, d, e, f].concat(z);
                        var flag = z.every(function(val, idx) {
                            return (x[idx] == val || x[idx] == -1) && z[idx + 6] >= 0;
                        });
                        if (flag) cnt++;
                    }
                }
            }
        }
    }
}

console.log(cnt);
