'use strict';
const fs = require('fs');

function ncr(n, r, mod) {
    mod = mod || 1000000007;
    const minVal = Math.min(n, r);
    const maxVal = Math.max(n, r);
    const k = maxVal - minVal;
    const size = Math.min(k, minVal);
    
    if (size > 0) {
        const numerators = new Array(size);
        const denominators = new Array(size);
        
        for (let i = 0; i < size; i++) {
            numerators[i] = minVal - size + i;
            denominators[i] = i;
        }
        
        for (let i = 2; i < size; i++) {
            const d = denominators[i];
            if (d > 1) {
                const offset = d > 0 ? -(minVal - size) % d : 0;
                for (let j = i; j < size; j += i) {
                    numerators[j + offset] /= d;
                    denominators[j] /= d;
                }
            }
        }
        
        let result = 1;
        for (let i = 0; i < size; i++) {
            if (numerators[i] !== 1) {
                result = (result * numerators[i]) % mod;
            }
        }
        return result;
    }
    return 1;
}

function main(input) {
    const lines = input.trim().split(' ');
    const n = Number(lines[0]);
    const k = Number(lines[1]);
    let answer = 0;
    
    for (let i = Math.min(n, k); i >= 0; i--) {
        const j = n - i * k;
        if (i * j + i === k) {
            answer = ncr(n - i * k + i, i);
        }
    }
    
    console.log(answer);
}

main(fs.readFileSync('stdin', 'utf8'));
