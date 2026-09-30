function Main(input) {
    const directions = input.split('');
    let counts = [];
    const emptyCounts = [];

    for (let i = 0; i < directions.length; i++) {
        counts.push(1);
        emptyCounts.push(0);
    }

    let nextCounts = emptyCounts.slice();

    for (let step = 0; step < 2; step++) {
        for (let i = 0; i < counts.length; i++) {
            if (directions[i] === 'R') {
                nextCounts[i + 1] += counts[i];
            } else if (directions[i] === 'L') {
                nextCounts[i - 1] += counts[i];
            }
        }

        counts = nextCounts.slice();
        nextCounts = emptyCounts.slice();
    }

    console.log(counts.join(' '));
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
