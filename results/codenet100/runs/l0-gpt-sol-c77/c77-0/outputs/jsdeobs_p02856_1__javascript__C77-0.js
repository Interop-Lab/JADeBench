function Main(input) {
    const rows = input
        .trim()
        .split('\n')
        .map(line => line.split(' '));

    const count = parseInt(rows[0][0], 10);
    let result = -1;
    let weightedTotal = 0;

    for (let i = 0; i < count; i++) {
        const value = parseInt(rows[i + 1][0], 10);
        const quantity = parseInt(rows[i + 1][1], 10);

        result += quantity;
        weightedTotal += value * quantity;
    }

    result += Math.floor((weightedTotal - 1) / 9);
    console.log(result);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
