function prime(n) {
  var isPrime = [];
  for (var i = 0; i <= n; i++) isPrime[i] = i;
  isPrime[0] = false;
  isPrime[1] = false;
  var limit = Math.sqrt(n);
  for (var i = 2; i <= limit; i++) {
    if (isPrime[i] === false) continue;
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

var PRIME = prime(100000);
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr = input.split('\n');
arr.forEach(function (line) {
  if (line == '') return true;
  var nums = line.split(' ').map(Number);
  var a = nums[0], b = nums[1], c = nums[2];
  var best = [0, 0, 0];
  for (var i = 0; i < PRIME.length; i++) {
    for (var j = i; j < PRIME.length; j++) {
      var product = PRIME[i] * PRIME[j];
      if (product > a) break;
      if (PRIME[j] + b <= PRIME[i] + c && best[0] < product) {
        best = [PRIME[i], PRIME[j], product];
      }
    }
  }
  console.log(best[0] + ' ' + best[1]);
});
