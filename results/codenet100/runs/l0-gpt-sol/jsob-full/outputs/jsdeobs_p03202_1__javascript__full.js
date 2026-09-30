'use strict';

const fs = require('fs');

function isValidBase(base, widths) {
    let value = '0'.repeat(widths[0]);

    for (let i = 1; i < widths.length; i++) {
        if (widths[i - 1] !== widths[i]) {
            value += '0'.repeat(widths[i] - widths[i - 1]);
            continue;
        }

        const incremented = parseInt(value.substring(0, widths[i]), base) + 1;

        if (isNaN(incremented)) {
            return false;
        }

        value = String(incremented);

        if (value.length > widths[i]) {
            return false;
        }

        value = '0'.repeat(widths[i] - value.length) + value;
    }

    return true;
}

function main(input) {
    const lines = input.split('\n').filter(line => line !== '');
    const widths = lines[1].split(' ').map(value => Number(value));

    let base = 1;

    while (isValidBase(base, widths) === false) {
        base++;
    }

    console.log(base);
}

main(fs.readFileSync('/dev/stdin', 'utf8'));
