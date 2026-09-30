function Main(input) {
    const values = input
        .split('\n')[0]
        .split(' ')
        .map(value => parseInt(value, 10))
        .sort((a, b) => b - a);

    let result = 0;

    if ((values[1] - values[2]) % 2 === 0) {
        result += values[0] - values[1];
        values[2] += result;
        result += (values[0] - values[2]) / 2;
    } else {
        values[0]++;
        values[1]++;
        result++;

        result += values[0] - values[1];
        values[2] += values[0] - values[1];
        result += (values[0] - values[2]) / 2;
    }

    console.log(result);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
