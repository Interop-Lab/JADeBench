'use strict';
const fs = require('fs');

const main = (input) => {
    const ops = {
        divide: (a, b) => a / b,
        multiply: (a, b) => a * b,
        subtract: (a, b) => a - b,
        multiply2: (a, b) => a * b,
        lessThan: (a, b) => a < b,
        add: (a, b) => a + b,
        subtract2: (a, b) => a - b,
        lessThan2: (a, b) => a < b
    };

    input = input.trim().split('\n');
    const n = ops.divide(input[0], 1);
    const arr = input[1].split(' ').map(x => x * 1);
    const prefix = new Array(n).fill(0);

    for (let i = 0; ops.lessThan(i, n); i++) {
        prefix[i] += ops.add(prefix[ops.subtract2(i, 1)] || 0, arr[i]);
    }

    let freq = {};
    freq[0] = 1;

    for (let i = 0; ops.lessThan2(i, n); i++) {
        freq[prefix[i]] = ops.add(freq[prefix[i]] || 0, 1);
    }

    let result = 0;
    Object.keys(freq).forEach(key => {
        result += ops.multiply2(ops.multiply(freq[key], ops.subtract(freq[key], 1)), 2);
    });

    console.log(result);
};

main(fs.readFileSync('stdin', 'utf8'));
