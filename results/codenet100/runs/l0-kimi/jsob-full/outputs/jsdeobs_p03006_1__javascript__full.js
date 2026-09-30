function Main(input) {
    input = input.split('\n');
    const n = +input[0];
    if (n === 0) {
        console.log(0);
        return;
    }
    const points = input.slice(1, n + 1).map(line => line.split(' ').map(x => +x));
    const slopes = {};
    points.forEach(p1 => {
        points.forEach(p2 => {
            if (p1 === p2) return;
            const dx = p2[0] - p1[0];
            const dy = p2[1] - p1[1];
            const key = [dx, dy].join('_');
            slopes[key] = slopes[key] == null ? 1 : slopes[key] + 1;
        });
    });
    const maxSlope = Object.entries(slopes).reduce((max, [key, count]) => {
        return count > max[0] ? [count, key] : [max[0], max[1]];
    }, [0, '']);
    console.log(1 + maxSlope[0]);
}
Main(require('fs').readFileSync('stdin', 'utf8'));
