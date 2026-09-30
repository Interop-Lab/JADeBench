'use strict';

function main(input) {
    const lines = input.trim().split('\n');
    const count = Number(lines[0].trim());
    const numbers = lines[1].trim().split(' ').map(Number);

    let result = 'YES';

    for (let i = 0; i < count; i++) {
        const remainingNumbers = numbers.slice(i + 1);
        if (remainingNumbers.indexOf(numbers[i]) !== -1) {
            result = 'NO';
            break;
        }
    }

    console.log(result);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
