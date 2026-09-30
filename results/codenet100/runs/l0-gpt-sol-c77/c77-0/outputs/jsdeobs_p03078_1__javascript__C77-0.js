const fs = require('fs');

const main = input => {
    const lines = input.trim().split('\n');
    const [firstCount, secondCount, thirdCount, resultLimit] = lines[0].split(' ');

    const firstValues = lines[1]
        .split(' ')
        .sort((a, b) => b - a)
        .map(value => value - 0);

    const secondValues = lines[2]
        .split(' ')
        .sort((a, b) => b - a)
        .map(value => value - 0);

    const thirdValues = lines[3]
        .split(' ')
        .sort((a, b) => b - a)
        .map(value => value - 0);

    const sums = [];

    for (let i = 0; i < firstCount; i++) {
        for (let j = 0; j < secondCount; j++) {
            for (let k = 0; k < thirdCount; k++) {
                if (i * j * k > resultLimit) {
                    break;
                }

                sums.push(firstValues[i] + secondValues[j] + thirdValues[k]);
            }
        }
    }

    console.log(
        sums
            .sort((a, b) => b - a)
            .filter((value, index) => index < resultLimit)
            .join('\n')
    );
};

main(fs.readFileSync('/dev/stdin', 'UTF-8'));
