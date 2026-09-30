const fs = require('fs');

function prime(n) {
  const isPrime = [];
  for (let i = 0; i <= n; i++) isPrime[i] = i;
  isPrime[0] = false;
  isPrime[1] = false;

  const limit = Math.floor(Math.sqrt(n));
  for (let i = 2; i <= limit; i++) {
    if (isPrime[i] === false) continue;
    for (let j = i + i; j <= n; j += i) {
      isPrime[j] = false;
    }
  }

  const primes = [];
  for (let i = 0; i <= n; i++) {
    if (isPrime[i] !== false) primes.push(isPrime[i]);
  }
  return primes;
}

const PRIME = prime(100000);

const input = fs.readFileSync('/dev/stdin', 'utf8');
const arr = input.trim().split('\n');

arr.some(function (line) {
  if (line === '0 0 0') return true;

  const nums = line.split(' ').map(Number);
  const a = nums[0];
  const b = nums[1];
  const c = nums[2];

  let best = [0, 0, 0];

  for (let i = 0; i < PRIME.length; i++) {
    for (let j = i; j < PRIME.length; j++) {
      const product = PRIME[i] * PRIME[j];
      if (product > a) break;
      if (PRIME[j] + c <= PRIME[i] * b && best[2] < product) {
        best = [PRIME[i], PRIME[j], product];
      }
    }
  }

  console.log(best[0] + ' ' + best[1]);
});
