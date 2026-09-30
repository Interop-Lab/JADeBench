const input = require('fs').readFileSync('/dev/stdin', 'utf8');
const values = input.trim().split('\n').map(Number);

values.shift();
values.sort((a, b) => a - b);

const max = values[values.length - 1];
const primes = [2];

for (let candidate = 3; candidate <= max; candidate += 2) {
    let isPrime = true;
    const limit = ~~Math.sqrt(candidate) + 1;

    for (let j = 0; j < primes.length; j++) {
        if (primes[j] > limit) {
            break;
        }

        if (candidate % primes[j] === 0) {
            isPrime = false;
            break;
        }
    }

    if (isPrime) {
        primes.push(candidate);
    }
}

let count = 0;
let searchFrom = 0;

for (let i = 0; i < values.length; i++) {
    const value = values[i];

    if (value != 2 && value % 2 == 0) {
        continue;
    }

    const index = primes.indexOf(value, searchFrom);
    if (index !== -1) {
        searchFrom = index;
        count++;
    }
}

console.log(count);
