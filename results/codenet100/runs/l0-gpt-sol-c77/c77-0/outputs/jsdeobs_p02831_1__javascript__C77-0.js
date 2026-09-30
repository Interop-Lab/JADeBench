const Main = input => {
    const numbers = input
        .trim()
        .split(' ')
        .map(value => parseInt(value, 10));

    let first = numbers[0];
    let second = numbers[1];
    const originalFirst = first;
    const originalSecond = second;
    let gcd = 0;

    if (first >= second) {
        while (second > 0) {
            const remainder = first % second;
            first = second;
            second = remainder;
        }
        gcd = first;
    } else {
        while (first > 0) {
            const remainder = second % first;
            second = first;
            first = remainder;
        }
        gcd = second;
    }

    const lcm = originalFirst * originalSecond / gcd;
    console.log(lcm);
};

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
