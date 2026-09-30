'use strict';

function ncr(a, b, modulus) {
    modulus = modulus || 1000000007;

    const max = Math.max(a, b);
    const min = Math.min(a, b);
    const r = Math.min(min, max - min);

    const numerators = new Array(r + 1);
    const denominators = new Array(r + 1);
    let result = 1;

    if (r > 0) {
        for (let i = 1; i <= r; i++) {
            numerators[i] = max - r + i;
            denominators[i] = i;
        }

        for (let i = 2; i <= r; i++) {
            const factor = denominators[i];
            const offset = factor > 1 ? -((max - r) % i) : 0;

            for (let j = i; j <= r; j += i) {
                numerators[j + offset] /= factor;
                denominators[j] /= factor;
            }
        }

        for (let i = 1; i <= r; i++) {
            if (numerators[i] > 1) {
                result = result * numerators[i] % modulus;
            }
        }
    }

    return result;
}

function main(input) {
    const values = input.trim().split(' ');
    const n = Number(values[0]);
    const target = Number(values[1]);

    let answer = 0;

    for (let pairs = Math.floor(n / 2); pairs >= 0; pairs--) {
        const singles = n - pairs * 2;

        if (singles * 2 + pairs === target) {
            answer = ncr(pairs + singles, pairs);
        }
    }

    console.log(answer);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
