const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');
const lines = input.trim().split('\n');

let line;
while ((line = lines.shift())) {
    const numbers = line.split(' ').map(Number);

    if (numbers.length > 1) {
        const differences = [];

        numbers.forEach((first, firstIndex) => {
            numbers.forEach((second, secondIndex) => {
                if (firstIndex !== secondIndex) {
                    differences.push(Math.abs(first - second));
                }
            });
        });

        differences.sort((a, b) => a - b);
        console.log(differences[0]);
    }
}
