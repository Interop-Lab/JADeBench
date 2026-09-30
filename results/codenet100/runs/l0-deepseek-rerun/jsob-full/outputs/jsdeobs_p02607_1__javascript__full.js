'use strict';

function main(input) {
    const lines = input.split('\n');
    const nums = lines[0].split(' ').map(Number);
    const n = nums[0];
    let count = 0;
    for (let i = 0; i < n; i++) {
        if ((i + 1) % 2 === 0) continue;
        if (nums[i] % 2 === 0) continue;
        count++;
    }
    console.log(count);
}

main(require('fs').readFileSync('input.txt', 'utf8'));
