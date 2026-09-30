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

    const directionCounts = {};

    points.forEach(origin => {
        points.forEach(point => {
            if (origin === point) {
                return;
            }

            const direction = [
                point[0] - origin[0],
                point[1] - origin[1]
            ].join('_');

            directionCounts[direction] =
                directionCounts[direction] == null
                    ? 1
                    : directionCounts[direction] + 1;
        });
    });

    const mostCommonDirection = Object.keys(directionCounts).reduce(
        (best, direction) => {
            const count = directionCounts[direction];
            return count > best[0] ? [count, direction] : best;
        },
        [0, '']
    );

    console.log(1 + (pointCount - 1) + mostCommonDirection[0]);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
