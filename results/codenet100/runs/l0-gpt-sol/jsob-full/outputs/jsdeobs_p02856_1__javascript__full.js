function Main(input) {
    const lines = input.trim().split('\n').map(function (line) {
        return line.split(' ');
    });

    const count = parseInt(lines[0][0], 10);
    let result = -1;
    let weightedSum = 0;

    for (let i = 0; i < count; i++) {
        const first = parseInt(lines[i + 1][0], 10);
        const second = parseInt(lines[i + 1][1], 10);

        result += second;
        weightedSum += first * second;
    }

    result += Math.floor((weightedSum - 1) / 9);
    console.log(result);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
