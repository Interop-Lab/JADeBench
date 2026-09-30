'use strict';

function Main(input) {
    const lines = input.trim().split('\n');
    const count = Number(lines[0].trim());
    const values = lines[1].trim().split(' ').map(Number);

    let result = 'YES';

    for (let i = 0; i < count; i++) {
        const remainingValues = values.slice(i + 1);
        const duplicateIndex = remainingValues.indexOf(values[i]);

        if (duplicateIndex !== -1) {
            result = 'NO';
            break;
        }
    }

    console.log(result);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
