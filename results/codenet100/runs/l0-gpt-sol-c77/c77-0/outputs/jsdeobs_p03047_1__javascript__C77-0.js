function Main(input) {
    const values = input.trim().split(' ');
    const first = values[0];
    const second = values[1];
    const result = first - second + 1;
    console.log(result);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
