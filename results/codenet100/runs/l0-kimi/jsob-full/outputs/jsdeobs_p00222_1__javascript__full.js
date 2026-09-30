function prime(n) {
    var isComposite = [];
    for (var i = 0; i <= n; i++) isComposite[i] = false;
    isComposite[0] = true;
    isComposite[1] = true;
    var limit = Math.floor(Math.sqrt(n));
    for (var i = 2; i <= limit; i++) {
        if (isComposite[i]) continue;
        for (var j = i * i; j <= n; j += i) {
            isComposite[j] = true;
        }
    }
    var primes = [];
    for (var i = 2; i <= n; i++) {
        if (!isComposite[i]) primes.push(i);
    }
    return primes;
}

var p = prime(100);
var input = require('fs').readFileSync('stdin', 'utf8');
var Arr = input.trim().split('\n').map(Number);

for (var i = 0; i < Arr.length; i++) {
    var a = Arr[i];
    if (a == -1) break;
    var quad = '';
    for (var j = 0; j < p.length; j++) {
        if (p[j] > a) break;
        var x = p[j] - 6;
        if (x == p[j - 1] && x + 6 == p[j + 1] && x + 12 == p[j + 2]) quad = p[j];
    }
    console.log(quad);
}
