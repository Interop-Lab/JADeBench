function prime(limit) {
    const sieve = [];

    for (let i = 0; i <= limit; i++) {
        sieve[i] = i;
    }

    sieve[0] = false;
    sieve[1] = false;

    const squareRoot = Math.floor(Math.sqrt(limit));

    for (let i = 2; i <= squareRoot; i++) {
        if (sieve[i] == false) {
            continue;
        }

        for (let multiple = i + i; multiple <= limit; multiple += i) {
            sieve[multiple] = false;
        }
    }

    const primes = [];

    for (let i = 0; i <= limit; i++) {
        if (sieve[i] !== false) {
            primes.push(sieve[i]);
        }
    }

    return primes;
}

const primes = prime(9999999);
const input = require('fs').readFileSync('/dev/stdin', 'utf8');
const values = input.trim().split('\n').map(Number);

for (let i = 0; i < values.length; i++) {
    const limit = values[i];

    if (limit == 0) {
        break;
    }

    let largestQuadrupletEnd = '';

    for (let j = 5; j < primes.length; j++) {
        if (primes[j] > limit) {
            break;
        }

        const start = primes[j] - 8;

        if (
            start == primes[j - 3] &&
            start + 2 == primes[j - 2] &&
            start + 6 == primes[j - 1]
        ) {
            largestQuadrupletEnd = primes[j];
        }
    }

    console.log(largestQuadrupletEnd);
}
