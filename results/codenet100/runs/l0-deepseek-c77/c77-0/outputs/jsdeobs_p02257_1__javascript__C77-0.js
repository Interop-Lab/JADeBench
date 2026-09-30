const fs = require('fs');
const input = fs.readFileSync('/dev/stdin', 'utf8');
const Arr = input.trim().split('\n').map(Number);
Arr.shift();
Arr.sort(function(a, b) { return a - b; });
const max = Arr[Arr.length - 1];
const primes = [2];
for (let i = 3; i <= max; i += 2) {
  let isPrime = true;
  const sqrt = ~~Math.sqrt(i) + 1;
  for (let j = 0; j < primes.length; j++) {
    if (primes[j] > sqrt) break;
    if (i % primes[j] === 0) {
      isPrime = false;
      break;
    }
  }
  if (isPrime) primes.push(i);
}
let num = 0;
let f = 0;
for (let i = 0; i < Arr.length; i++) {
  if (Arr[i] !== 2 && Arr[i] % 2 === 0) continue;
  const index = primes.indexOf(Arr[i], f);
  if (index !== -1) {
    f = index;
    num++;
  }
}
console.log(num);
