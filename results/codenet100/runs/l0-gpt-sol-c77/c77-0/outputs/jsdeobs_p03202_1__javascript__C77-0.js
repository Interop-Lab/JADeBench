'use strict';

function isValidBase(base, lengths) {
    let value = '0'.repeat(lengths[0]);

    for (let i = 1; i < lengths.length; i++) {
        if (lengths[i - 1] < lengths[i]) {
            value += '0'.repeat(lengths[i] - lengths[i - 1]);
        } else {
            value = parseInt(value.substring(0, lengths[i]), base) + 1;

            if (isNaN(value)) {
                return false;
            }

            value = String(value);

            if (value.length > lengths[i]) {
                return false;
            }

            value = '0'.repeat(lengths[i] - value.length) + value;
        }
    }

    return true;
}

function main(input) {
    const lines = input.split('\n').filter(line => line !== '');
    const lengths = lines[1].split(' ').map(Number);

    let base = 1;
    while (isValidBase(base, lengths) === false) {
        base++;
    }

    console.log(base);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
