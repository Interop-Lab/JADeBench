'use strict';

const fs = require('fs');

const main = input => {
    const lines = input.trim().split('\n');
    const firstLine = lines[0].split(' ');
    const n = parseInt(firstLine[0]);
    const m = parseInt(firstLine[1]);

    console.log(m === 1 ? 0 : n - m);
};

main(fs.readFileSync('/dev/stdin', 'utf8'));
