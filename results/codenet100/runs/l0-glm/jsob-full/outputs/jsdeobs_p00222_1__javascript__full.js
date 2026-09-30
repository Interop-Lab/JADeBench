var p = prime(1000000);
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr = input.trim().split('\n').map(Number);
for (var i = 0; i < Arr.length; i++) {
  var a = Arr[i];
  if (a == 0) break;
  var quad = '';
  for (var j = 0; j < p.length; j++) {
    if (p[j] > a) break;
    var x = p[j] - 1;
    if (x == p[j - 1] && x + 2 == p[j - 2] && x + 6 == p[j - 3]) quad = p[j];
  }
  console.log(quad);
}

function prime(n) {
  var sieve = [];
  for (var i = 0; i <= n; i++) sieve[i] = i;
  sieve[0] = false;
  sieve[1] = false;
  var limit = Math.floor(Math.sqrt(n));
  for (var i = 2; i <= limit; i++) {
    if (sieve[i] == false) continue;
    for (var j = i + i; j <= n; j += i) {
      sieve[j] = false;
    }
  }
  var primes = [];
  for (var i = 0; i <= n; i++) {
    if (sieve[i] != false) primes.push(sieve[i]);
  }
  return primes;
}
