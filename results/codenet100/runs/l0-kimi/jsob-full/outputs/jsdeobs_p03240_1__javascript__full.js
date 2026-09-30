'use strict';
const fs = require('fs');

const main = (input) => {
    input = input.split('\n');
    const n = parseInt(input[0]);
    let x = [];
    let y = [];
    let r = [];
    
    input.slice(1, n + 1).forEach(line => {
        let parts = line.split(' ').map(p => parseInt(p));
        x.push(parts[0]);
        y.push(parts[1]);
        r.push(parts[2]);
    });
    
    const size = 100;
    for (let i = 0; i <= size; i++) {
        for (let j = 0; j <= size; j++) {
            let count = -1;
            for (let k = 0; k < n; k++) {
                let dist = Math.pow(x[k] - i, 2) + Math.pow(y[k] - j, 2);
                if (count === -1) {
                    count = dist;
                } else {
                    if (count !== dist) {
                        count = -1;
                        break;
                    }
                }
            }
            if (count === -1) continue;
            console.log(i, j, count);
        }
    }
};

main(fs.readFileSync('stdin', 'utf8'));
