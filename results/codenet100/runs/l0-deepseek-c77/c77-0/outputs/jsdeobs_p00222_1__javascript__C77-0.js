function prime(n) {
    var isPrime = [];
    for (var i = 0; i <= n; i++) isPrime[i] = i;
    isPrime[0] = false;
    isPrime[1] = false;
    var limit = Math.floor(Math.sqrt(n));
    for (var i = 2; i <= limit; i++) {
        if (isPrime[i] == false) continue;
        for (var j = i + i; j <= n; j += i) {
            isPrime[j] = false;
        }
    }
    var primes = [];
    for (var i = 0; i <= n; i++) {
        if (isPrime[i] !== false) primes.push(isPrime[i]);
    }
    return primes;
}

var p = prime(0x98967f);
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr = input.trim().split('\n').map(Number);

for (var i = 0; i < Arr.length; i++) {
    var a = Arr[i];
    if (a == 0) break;
    var quad = '';
    for (var j = 5; j < p.length; j++) {
        if (p[j] > a) break;
        var x = p[j] - 8;
        if (x == p[j - 3] && x + 2 == p[j - 2] && x + 6 == p[j - 1]) quad = p[j];
    }
    console.log(quad);
}
