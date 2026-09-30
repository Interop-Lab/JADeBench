function Main(input) {
    const numbers = input
        .split('\n')[0]
        .split(' ')
        .map(value => parseInt(value, 10))
        .sort((a, b) => b - a);

    let result = 0;

    if ((numbers[1] - numbers[2]) % 2 === 0) {
        result += numbers[0] - numbers[1];
        numbers[2] += result;
        result += (numbers[0] - numbers[2]) / 2;
    } else {
        numbers[0]++;
        numbers[1]++;
        result++;

        numbers[2] += numbers[0] - numbers[1];
        result += numbers[0] - numbers[1];
        result += (numbers[0] - numbers[2]) / 2;
    }

    console.log(result);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
