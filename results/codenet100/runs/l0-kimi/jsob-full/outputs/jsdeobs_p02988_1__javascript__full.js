'use strict';
const Main = (input) => {
    const lines = input.trim().split('\n');
    const n = parseInt(lines[0]);
    const arr = lines[1].split(' ').map(Number);
    let count = 0;
    for (let i = 1; i < n - 1; i++) {
        if ((arr[i - 1] < arr[i] && arr[i] < arr[i + 1]) ||
            (arr[i - 1] > arr[i] && arr[i] > arr[i + 1])) {
            count += 1;
        }
    }
    console.log(count);
};
Main(require('fs').readFileSync('stdin', 'utf8'));
