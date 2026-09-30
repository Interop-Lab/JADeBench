const fs = require('fs');

const input = fs.readFileSync('/dev/stdin', 'utf8');
const lines = input.trim().split('\n');

let line;
while ((line = lines.shift())) {
    const numbers = line.split(' ').map(Number);

    if (numbers.length > 1) {
        const differences = [];

        numbers.forEach((firstNumber, firstIndex) => {
            numbers.forEach((secondNumber, secondIndex) => {
                if (firstIndex !== secondIndex) {
                    const difference = Math.abs(firstNumber - secondNumber);
                    const pair = firstNumber + ' ' + secondNumber;
                    differences.push([pair, difference]);
                }
            });
        });

        const closestPair = differences.sort(
            (first, second) => first[1] - second[1]
        )[0];

        console.log(closestPair[0]);
    }
}
