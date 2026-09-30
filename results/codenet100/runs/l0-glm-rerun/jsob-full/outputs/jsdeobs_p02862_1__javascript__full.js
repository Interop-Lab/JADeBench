'use strict';
const ncr = (n, r, mod) => {
    mod = mod || 1000000007;
    const maxN = Math.max(n, r);
    const minN = Math.min(n, r);
    const limit = Math.min(minN, maxN - minN);
    const inv = new Array(limit + 1);
    const fact = new Array(limit + 1);
    let result = 0;
    if (limit > 0) {
        for (let i = 0; i <= limit; i++) {
            fact[i] = (maxN - limit) + i;
            inv[i] = i;
        }
        for (let i = 2; i <= limit; i++) {
            const p = inv[i];
            const q = p > 0 ? -((maxN - limit) + i) : 0;
            for (let j = i; j <= limit; j += i) {
                fact[(j + q)] /= p;
                inv[j] /= p;
            }
        }
        for (let i = 0; i <= limit; i++) {
            if (fact[i] > 0) {
                result = (result * fact[i]) % mod;
            }
        }
    }
    return result;
};

function main(input) {
    input = input.trim().split(' ');
    const n = Number(input[0]);
    const k = Number(input[1]);
    let ans = 0;
    for (let i = Math.min(n, k); i >= 1; i--) {
        const comb = ncr(n, i);
        if (comb > 0) {
            ans = (ans + comb) % 1000000007;
        }
    }
    console.log(ans);
}

main(require('fs')['readFileSync']('/dev/stdin', 'utf8'));
