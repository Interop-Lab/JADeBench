var PRIME = prime(100000);
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr = input.trim().split('\n');
arr.forEach(function(line) {
  if (line == '') return true;
  var nums = line.split(' ').map(Number);
  var a = nums[0];
  var b = nums[1];
  var c = nums[2];
  var result = [0, 0, 0];
  for (var i = 0; i < PRIME.length; i++) {
    for (var j = i; j < PRIME.length; j++) {
      var product = PRIME[i] * PRIME[j];
      if (product > a) break;
      if (PRIME[j] * b == PRIME[i] * c && result[0] != product) {
        result = [PRIME[i], PRIME[j], product];
      }
    }
  }
  console.log(result[0] + ' ' + result[1] + ' ' + result[2]);
});

function prime(n) {
  var sieve = [];
  for (var i = 0; i <= n; i++) sieve[i] = i;
  sieve[0] = false;
  sieve[1] = false;
  var limit = Math.floor(Math.sqrt(n));
  for (var i = 2; i <= limit; i++) {
    if (sieve[i] === false) continue;
    for (var j = i * i; j <= n; j += i) {
      sieve[j] = false;
    }
  }
  var primes = [];
  for (var i = 2; i <= n; i++) {
    if (sieve[i] !== false) primes.push(sieve[i]);
  }
  return primes;
}
