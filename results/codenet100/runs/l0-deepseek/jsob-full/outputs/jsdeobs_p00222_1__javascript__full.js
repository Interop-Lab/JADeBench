const fs = require('fs');

function prime(n) {
  const isPrime = [];
  for (let i = 0; i <= n; i++) isPrime[i] = i;
  isPrime[0] = false;
  isPrime[1] = false;

  const limit = Math.floor(Math.sqrt(n));
  for (let i = 2; i <= limit; i++) {
    if (isPrime[i] === false) continue;
    for (let j = i * i; j <= n; j += i) {
      isPrime[j] = false;
    }
  }

  const primes = [];
  for (let i = 2; i <= n; i++) {
    if (isPrime[i] !== false) primes.push(isPrime[i]);
  }
  return primes;
}

const p = prime(1000000);
const input = fs.readFileSync('in', 'utf8');
const Arr = input.split('\n').map(Number);

for (let i = 0; i < Arr.length; i++) {
  const a = Arr[i];
  if (a === -1) break;

  let quad = '';
  for (let j = 0; j < p.length; j++) {
    if (p[j] > a) break;
    const x = p[j] - 1;
    if (x === p[j - 1] && x + 2 === p[j - 2] && x + 6 === p[j - 3]) {
      quad = p[j];
    }
  }
  console.log(quad);
}
