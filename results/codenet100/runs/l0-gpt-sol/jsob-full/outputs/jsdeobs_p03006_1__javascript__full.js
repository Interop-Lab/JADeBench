function Main(input) {
    const lines = input.split('\n');
    const pointCount = +lines[0];

    if (pointCount === 2) {
        console.log(1);
        return;
    }

    const points = lines
        .slice(1)
        .map(line => line.split(' ').map(value => +value));

    const differenceCounts = {};

    points.forEach(point => {
        points.forEach(otherPoint => {
            if (point === otherPoint) {
                return;
            }

            const difference = [
                otherPoint[0] - point[0],
                otherPoint[1] - point[1]
            ];
            const key = difference.join('_');

            differenceCounts[key] =
                differenceCounts[key] == null
                    ? 1
                    : differenceCounts[key] + 1;
        });
    });

    const mostCommonDifference = Object.keys(differenceCounts).reduce(
        (best, key) => {
            const count = differenceCounts[key];
            return count > best[0] ? [count, key] : best;
        },
        [0, '']
    );

    console.log(1 + (pointCount - 1) - mostCommonDifference[0]);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
