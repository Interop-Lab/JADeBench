var ms = [], flag = [];
for (var i = 0; i < 100000; i++) flag[i] = true;
var i = 0;
while (true) {
    var m = 2 * i - 1, s = 4 * i + 1;
    if (m > 99999) break;
    i++;
    if (flag[m]) ms.push(m);
    if (flag[s]) ms.push(s);
    var j = 1;
    while (true) {
        if (m * j > 99999) break;
        flag[m * j] = false, flag[s * j] = false, j++;
    }
}
var input = require('fs').readFileSync('/dev/stdin', 'utf8'), arr = input.trim().split('\n');
while (true) {
    var n = arr.shift() - 0;
    if (n == 0) break;
    var ans = [], i = 0;
    ms.forEach(function (x) {
        if (n % x == 0) ans.push(x);
        return n < x;
    }), console.log(n + ': ' + ans.join(' '));
}
