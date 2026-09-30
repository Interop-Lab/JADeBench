var input = require('fs').readFileSync('stdin', 'utf8');
var Arr = input.trim().split('\n');
while (true) {
    var N = Arr.shift() - 0;
    if (N == 0) break;
    var n = [], p = 0;
    for (var i = 0; i < N; i++) n[i] = 0;
    var str = Arr.shift();
    for (var i = 0; i < str.length; i++) {
        var j = i % N;
        var v = str[i];
        if (v == 'M') n[j]++;
        if (v == 'L') {
            n[j] += p + 1;
            p = 0;
        }
        if (v == 'S') {
            p += n[j] + 1;
            n[j] = 0;
        }
    }
    n.sort(function(a, b) {
        return a - b;
    });
    console.log(n.join(' ') + ' ' + p);
}
